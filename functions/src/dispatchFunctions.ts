import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

// Helper to validate auth
const verifyAuth = (context: any) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated",
    );
  }
};

// --- TRIP MANAGEMENT ---

export const createTrip = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { pickup, dropoff, time, customerId, vehicleType } = data;
  const ref = await db.collection("trips").add({
    pickup,
    dropoff,
    time,
    customerId,
    vehicleType,
    status: "pending",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: context.auth!.uid,
  });
  return { id: ref.id, message: "Trip created" };
});

export const updateTrip = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { tripId, updates } = data;
  await db
    .collection("trips")
    .doc(tripId)
    .update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: context.auth!.uid,
    });
  return { message: "Trip updated" };
});

export const cancelTrip = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { tripId, reason } = data;
  await db.collection("trips").doc(tripId).update({
    status: "cancelled",
    cancellationReason: reason,
    cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    cancelledBy: context.auth!.uid,
  });
  return { message: "Trip cancelled" };
});

export const getTripDetails = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const doc = await db.collection("trips").doc(data.tripId).get();
  if (!doc.exists)
    throw new functions.https.HttpsError("not-found", "Trip not found");
  return doc.data();
});

export const listActiveTrips = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const snapshot = await db
    .collection("trips")
    .where("status", "in", ["pending", "assigned", "en-route", "in-progress"])
    .orderBy("time", "asc")
    .get();
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
});

// --- ASSIGNMENT ---

export const assignDriver = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { tripId, driverId } = data;
  // Check for conflicts logic would go here
  await db.collection("trips").doc(tripId).update({
    status: "assigned",
    driverId,
    assignedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  // Notify driver logic
  return { message: "Driver assigned" };
});

export const unassignDriver = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { tripId } = data;
  await db.collection("trips").doc(tripId).update({
    status: "pending",
    driverId: admin.firestore.FieldValue.delete(),
    unassignedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { message: "Driver unassigned" };
});

// --- STATUS UPDATES ---

export const driverEnRoute = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { tripId } = data;
  await db.collection("trips").doc(tripId).update({
    status: "en-route",
    enRouteAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { message: "Status updated: En Route" };
});

export const driverArrived = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { tripId } = data;
  await db.collection("trips").doc(tripId).update({
    status: "arrived",
    arrivedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { message: "Status updated: Arrived" };
});

export const tripStarted = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { tripId } = data;
  await db.collection("trips").doc(tripId).update({
    status: "in-progress",
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { message: "Status updated: In Progress" };
});

export const tripCompleted = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { tripId, finalFare, mileage } = data;
  await db.collection("trips").doc(tripId).update({
    status: "completed",
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
    finalFare,
    mileage,
  });
  return { message: "Trip completed" };
});

// --- ADVANCED ---

export const calculateTripFare = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    const { distance, vehicleType } = data as any;
    // Mock calculation
    const baseRate = vehicleType === "luxury" ? 100 : 50;
    const perMile = 2.5;
    const estimatedFare = baseRate + distance * perMile;
    return { estimatedFare };
  },
);

export const validateTripAddress = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    const { address } = data;
    // Mock validation
    return { valid: true, normalized: address };
  },
);

export const archiveOldTrips = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);

    const snapshot = await db
      .collection("trips")
      .where("status", "==", "completed")
      .where("time", "<", cutoff)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      const archiveRef = db.collection("trips_archive").doc(doc.id);
      batch.set(archiveRef, doc.data());
      batch.delete(doc.ref);
    });

    await batch.commit();
    return null;
  });

export const getDispatchStats = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    const snapshot = await db
      .collection("trips")
      .where("time", ">=", startOfDay)
      .get();

    const stats = {
      total: snapshot.size,
      completed: 0,
      pending: 0,
      cancelled: 0,
    };

    snapshot.docs.forEach((doc) => {
      const s = doc.data().status;
      if (stats[s as keyof typeof stats] !== undefined) {
        (stats[s as keyof typeof stats] as number)++;
      }
    });

    return stats;
  },
);
