import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

const verifyAuth = (context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');
};

// --- DRIVER PROFILES ---

export const createDriverProfile = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const ref = await db.collection("drivers").add({
        ...data,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id };
});

export const updateDriverProfile = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { driverId, updates } = data;
    await db.collection("drivers").doc(driverId).update(updates);
    return { success: true };
});

export const getDriverList = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const snap = await db.collection("drivers").get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
});

// --- TIME & ATTENDANCE ---

export const clockIn = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { driverId, location } = data;
    await db.collection("time_entries").add({
        driverId,
        type: "clock_in",
        location,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection("drivers").doc(driverId).update({ status: "on_duty" });
    return { success: true };
});

export const clockOut = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { driverId, location } = data;
    await db.collection("time_entries").add({
        driverId,
        type: "clock_out",
        location,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection("drivers").doc(driverId).update({ status: "off_duty" });
    return { success: true };
});

export const getTimeSheet = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { driverId, startDate, endDate } = data;
    const snap = await db.collection("time_entries")
        .where("driverId", "==", driverId)
        .where("timestamp", ">=", new Date(startDate))
        .where("timestamp", "<=", new Date(endDate))
        .orderBy("timestamp", "asc")
        .get();
    return snap.docs.map(d => d.data());
});

// --- PAYROLL CALCULATION ---

export const generatePayStub = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { driverId, periodStart, periodEnd } = data;
    
    // Fetch trips
    const trips = await db.collection("trips")
        .where("driverId", "==", driverId)
        .where("completedAt", ">=", new Date(periodStart))
        .where("completedAt", "<=", new Date(periodEnd))
        .get();
        
    let grossPay = 0;
    trips.docs.forEach(t => {
        // Simplified payout logic: 40% of fare
        grossPay += (t.data().finalFare || 0) * 0.4;
    });
    
    // Create record
    const ref = await db.collection("pay_stubs").add({
        driverId,
        periodStart,
        periodEnd,
        grossPay,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "draft"
    });
    
    return { id: ref.id, grossPay };
});

export const approvePayStub = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("pay_stubs").doc(data.stubId).update({
        status: "approved",
        approvedBy: context.auth!.uid,
        approvedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const listPayStubs = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const snap = await db.collection("pay_stubs")
        .where("driverId", "==", data.driverId)
        .orderBy("periodStart", "desc")
        .get();
    return snap.docs.map(d => d.data());
});

// --- PERFORMANCE & INCIDENTS ---

export const logDriverIncident = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { driverId, type, description, severity } = data;
    await db.collection("incidents").add({
        driverId, type, description, severity,
        reportedBy: context.auth!.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const getDriverPerformance = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const trips = await db.collection("trips")
        .where("driverId", "==", data.driverId)
        .where("status", "==", "completed")
        .get();
        
    const totalTrips = trips.size;
    const ratingSum = trips.docs.reduce((acc, t) => acc + (t.data().rating || 5), 0);
    
    return {
        totalTrips,
        averageRating: totalTrips > 0 ? ratingSum / totalTrips : 5
    };
});

// --- ADMIN ---

export const updatePayRate = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { driverId, newRate, type } = data; // type: hourly or percentage
    await db.collection("drivers").doc(driverId).update({
        payRate: newRate,
        payType: type
    });
    return { success: true };
});

export const terminateDriver = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("drivers").doc(data.driverId).update({
        status: "terminated",
        terminatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const verifyDriverDocuments = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { driverId, documentType } = data;
    await db.collection("driver_documents").add({
        driverId, documentType, verified: true,
        verifiedBy: context.auth!.uid,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});