import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

// --- ROUTE LOGISTICS ---

export const optimizeRoute = functions.https.onCall(async (data, context) => {
  const { stops } = data;
  // Call Google Maps Route Optimization API
  return { optimizedOrder: stops, distance: 45, duration: 3600 };
});

export const calculateETA = functions.https.onCall(async (data, context) => {
  const { origin, destination } = data;
  return { etaMinutes: 25, trafficLevel: "medium" };
});

// --- FUEL & EFFICIENCY ---

export const calculateFleetFuelConsumption = functions.https.onCall(
  async (data, context) => {
    const { period } = data;
    const fuelLogs = await db.collection("fuel_logs").get();
    let totalGallons = 0;
    fuelLogs.docs.forEach((d) => (totalGallons += d.data().gallons));
    return { totalGallons, avgPrice: 3.5 };
  },
);

export const alertLowFuelEfficiency = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    // Check vehicles with MPG below threshold
    return null;
  });

// --- TRACKING ---

export const updateVehicleLocation = functions.https.onCall(
  async (data, context) => {
    const { vehicleId, lat, lng, speed } = data;
    await db.collection("vehicle_locations").doc(vehicleId).set({
      lat,
      lng,
      speed,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  },
);

export const getVehicleBreadcrumbs = functions.https.onCall(
  async (data, context) => {
    const { vehicleId, startTime } = data;
    const snap = await db
      .collection("vehicle_locations")
      .doc(vehicleId)
      .collection("history")
      .where("timestamp", ">=", new Date(startTime))
      .get();
    return snap.docs.map((d) => d.data());
  },
);

// --- COMPLIANCE ---

export const checkDriverHoursOfService = functions.https.onCall(
  async (data, context) => {
    const { driverId } = data;
    // Calculate driving time from clock-in
    return { remainingMinutes: 480, status: "compliant" };
  },
);

export const logMaintenanceIssue = functions.https.onCall(
  async (data, context) => {
    const { vehicleId, severity, description } = data;
    await db.collection("maintenance_alerts").add({
      vehicleId,
      severity,
      description,
      status: "open",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  },
);

// --- GEO-FENCING ---

export const createGeoFence = functions.https.onCall(async (data, context) => {
  const { name, center, radius } = data;
  await db.collection("geofences").add({ name, center, radius });
  return { success: true };
});

export const checkGeoFenceBreach = functions.https.onCall(
  async (data, context) => {
    const { vehicleId, lat, lng } = data;
    // Spatial check logic
    return { inside: true };
  },
);
