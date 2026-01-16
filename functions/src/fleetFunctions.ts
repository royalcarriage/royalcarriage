// Functions for Fleet module

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// --- Vehicle Functions ---

export const createVehicle = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const {
      make,
      model,
      year,
      vin,
      licensePlate,
      color,
      purchaseDate,
      purchasePrice,
      currentMileage,
      status,
      assignedDriverId,
      imageUrl,
    } = req.body;

    if (!make || !model || !year || !vin || !licensePlate || !currentMileage) {
      return res.status(400).json({
        error:
          "Missing required fields: make, model, year, vin, licensePlate, currentMileage",
      });
    }

    const vehicle = {
      make,
      model,
      year: parseInt(year),
      vin,
      licensePlate,
      color,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
      currentMileage: parseInt(currentMileage),
      status: status || "active",
      assignedDriverId,
      imageUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.body.auth?.uid || null,
    };

    const writeResult = await admin
      .firestore()
      .collection("vehicles")
      .add(vehicle);
    res.status(201).json({ id: writeResult.id, ...vehicle });
  } catch (error) {
    functions.logger.error("Error creating vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getVehicles = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const snapshot = await admin.firestore().collection("vehicles").get();
    const vehicles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(vehicles);
  } catch (error) {
    functions.logger.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Placeholder for update and delete functions for vehicles
export const updateVehicle = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update Vehicle");
});

export const deleteVehicle = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Delete Vehicle");
});

// --- Maintenance Schedules Functions (Placeholders) ---

export const createMaintenanceSchedule = functions.https.onRequest(
  (req, res) => {
    res.status(501).send("Not Implemented: Create Maintenance Schedule");
  },
);

export const getMaintenanceSchedules = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Maintenance Schedules");
});

// --- Maintenance Tickets Functions (Placeholders) ---

export const createMaintenanceTicket = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Maintenance Ticket");
});

export const getMaintenanceTickets = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Maintenance Tickets");
});

// --- Receipts Functions (Placeholders) ---

export const createReceipt = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Receipt");
});

export const getReceipts = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Receipts");
});

// --- Utilization & TCO Functions (Placeholders) ---

export const updateUtilization = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update Utilization");
});

export const updateTCO = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update TCO");
});
