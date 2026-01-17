import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

const verifyAuth = (context: any) => {
  if (!context.auth)
    throw new functions.https.HttpsError("unauthenticated", "Auth required");
};

// --- VEHICLE CRUD ---

export const createVehicle = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const ref = await db.collection("vehicles").add({
    ...data,
    status: "active",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
});

export const updateVehicle = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { vehicleId, updates } = data;
  await db.collection("vehicles").doc(vehicleId).update(updates);
  return { success: true };
});

export const getVehicleList = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const snap = await db.collection("vehicles").get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
});

export const decommissionVehicle = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    await db.collection("vehicles").doc(data.vehicleId).update({
      status: "decommissioned",
      inactiveAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  },
);

// --- MAINTENANCE ---

export const scheduleMaintenance = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    const { vehicleId, type, date, notes } = data;
    await db.collection("maintenance").add({
      vehicleId,
      type,
      scheduledDate: date,
      notes,
      status: "scheduled",
    });
    return { success: true };
  },
);

export const completeMaintenance = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    const { maintenanceId, cost, details } = data;
    await db.collection("maintenance").doc(maintenanceId).update({
      status: "completed",
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      cost,
      details,
    });
    return { success: true };
  },
);

export const getVehicleMaintenanceHistory = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    const snap = await db
      .collection("maintenance")
      .where("vehicleId", "==", data.vehicleId)
      .orderBy("scheduledDate", "desc")
      .get();
    return snap.docs.map((d) => d.data());
  },
);

// --- OPERATIONS ---

export const logFuelEntry = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { vehicleId, gallons, cost, mileage, driverId } = data;
  await db.collection("fuel_logs").add({
    vehicleId,
    gallons,
    cost,
    mileage,
    driverId,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  // Update vehicle current mileage
  await db
    .collection("vehicles")
    .doc(vehicleId)
    .update({ currentMileage: mileage });
  return { success: true };
});

export const assignVehicle = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { vehicleId, driverId } = data;
  await db.collection("vehicles").doc(vehicleId).update({
    assignedDriverId: driverId,
    assignmentStatus: "assigned",
  });
  return { success: true };
});

export const unassignVehicle = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  await db.collection("vehicles").doc(data.vehicleId).update({
    assignedDriverId: admin.firestore.FieldValue.delete(),
    assignmentStatus: "unassigned",
  });
  return { success: true };
});

export const logInspection = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const { vehicleId, items, passed } = data;
  await db.collection("inspections").add({
    vehicleId,
    items,
    passed,
    inspectorId: context.auth!.uid,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
});

export const getFleetStats = functions.https.onCall(async (data, context) => {
  verifyAuth(context);
  const vehicles = await db.collection("vehicles").get();
  const stats = {
    total: vehicles.size,
    active: 0,
    maintenance: 0,
    assigned: 0,
  };
  vehicles.docs.forEach((d) => {
    const v = d.data();
    if (v.status === "active") stats.active++;
    if (v.status === "maintenance") stats.maintenance++;
    if (v.assignedDriverId) stats.assigned++;
  });
  return stats;
});

export const updateRegistration = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    const { vehicleId, registrationExp, insuranceExp } = data;
    await db.collection("vehicles").doc(vehicleId).update({
      registrationExpiry: registrationExp,
      insuranceExpiry: insuranceExp,
    });
    return { success: true };
  },
);

export const checkVehicleAvailability = functions.https.onCall(
  async (data, context) => {
    verifyAuth(context);
    // const { _startTime, _endTime, _type } = data as any;
    // Simplified logic: check if assigned to active trips in timeframe
    // Implementation omitted for brevity, returns mock availability
    return { available: [] };
  },
);

export const triggerServiceAlerts = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const vehicles = await db
      .collection("vehicles")
      .where("status", "==", "active")
      .get();
    const batch = db.batch();

    vehicles.docs.forEach((doc) => {
      const v = doc.data();
      if (v.currentMileage - (v.lastServiceMileage || 0) > 5000) {
        const alertRef = db.collection("alerts").doc();
        batch.set(alertRef, {
          type: "maintenance_due",
          vehicleId: doc.id,
          message: `Vehicle ${v.plate} due for service`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    await batch.commit();
    return null;
  });
