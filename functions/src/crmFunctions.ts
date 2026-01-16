import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

const verifyAuth = (context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');
};

// --- CUSTOMER CRUD ---

export const createCustomer = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const ref = await db.collection("customers").add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id };
});

export const getCustomer = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const doc = await db.collection("customers").doc(data.customerId).get();
    if (!doc.exists) throw new functions.https.HttpsError('not-found', 'Customer not found');
    return doc.data();
});

export const updateCustomer = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("customers").doc(data.customerId).update(data.updates);
    return { success: true };
});

export const deleteCustomer = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("customers").doc(data.customerId).delete();
    return { success: true };
});

// --- LEADS & RESERVATIONS ---

export const createLead = functions.https.onCall(async (data, context) => {
    // Public endpoint (no auth check needed for web forms, but context check is good if internal)
    const ref = await db.collection("leads").add({
        ...data,
        status: "new",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id };
});

export const convertLeadToCustomer = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const lead = await db.collection("leads").doc(data.leadId).get();
    if (!lead.exists) throw new functions.https.HttpsError('not-found', 'Lead not found');
    
    const leadData = lead.data()!;
    const custRef = await db.collection("customers").add({
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        source: "lead_conversion",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection("leads").doc(data.leadId).update({ status: "converted", customerId: custRef.id });
    return { customerId: custRef.id };
});

export const createReservation = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const ref = await db.collection("reservations").add({
        ...data,
        status: "confirmed",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id };
});

export const cancelReservation = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("reservations").doc(data.reservationId).update({
        status: "cancelled",
        cancelledBy: context.auth!.uid
    });
    return { success: true };
});

// --- CRM FEATURES ---

export const addCustomerNote = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("customers").doc(data.customerId).collection("notes").add({
        content: data.note,
        authorId: context.auth!.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const getCustomerHistory = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const trips = await db.collection("trips").where("customerId", "==", data.customerId).get();
    return trips.docs.map(d => d.data());
});

export const blacklistCustomer = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("customers").doc(data.customerId).update({
        status: "blacklisted",
        reason: data.reason
    });
    return { success: true };
});

export const mergeCustomers = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { primaryId, secondaryId } = data;
    // Move trips from secondary to primary
    const trips = await db.collection("trips").where("customerId", "==", secondaryId).get();
    const batch = db.batch();
    trips.docs.forEach(doc => {
        batch.update(doc.ref, { customerId: primaryId });
    });
    // Delete secondary
    batch.delete(db.collection("customers").doc(secondaryId));
    await batch.commit();
    return { success: true };
});

export const sendCustomerEmail = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { customerId, templateId } = data;
    // Mock email sending
    await db.collection("email_logs").add({
        customerId, templateId, sentAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const getCustomerStats = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const trips = await db.collection("trips").where("customerId", "==", data.customerId).get();
    let totalSpend = 0;
    trips.docs.forEach(t => totalSpend += (t.data().finalFare || 0));
    return { totalTrips: trips.size, totalSpend };
});

export const exportCustomers = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    // In a real app, this would generate a CSV and return a signed URL
    return { url: "https://example.com/customers.csv" };
});
