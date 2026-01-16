// Functions for Dispatch module

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// --- Trip Ingestion Functions ---

export const createTrip = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const {
      pickupDateTime,
      dropoffDateTime,
      pickupAddress,
      dropoffAddress,
      customerId,
      tripStatus,
      notes,
      fare,
      paymentStatus,
    } = req.body;

    if (!pickupDateTime || !pickupAddress || !dropoffAddress || !customerId) {
      return res.status(400).json({
        error:
          "Missing required fields: pickupDateTime, pickupAddress, dropoffAddress, customerId",
      });
    }

    const trip = {
      pickupDateTime: new Date(pickupDateTime),
      dropoffDateTime: dropoffDateTime ? new Date(dropoffDateTime) : null,
      pickupAddress,
      dropoffAddress,
      customerId,
      tripStatus: tripStatus || "scheduled",
      notes,
      fare: fare ? parseFloat(fare) : null,
      paymentStatus: paymentStatus || "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.body.auth?.uid || null,
    };

    // Signal completion for accounting (e.g., by updating a status or writing to a related collection)
    await admin.firestore().collection("trip_completions").add({
      tripId: writeResult.id,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Potentially other data relevant for accounting posting rules
    });
    res.status(201).json({ id: writeResult.id, ...trip });
  } catch (error) {
    functions.logger.error("Error creating trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getTrips = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const snapshot = await admin.firestore().collection("trips").get();
    const trips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(trips);
  } catch (error) {
    functions.logger.error("Error fetching trips:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Placeholder for update and delete functions for trips
export const updateTrip = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update Trip");
});

export const deleteTrip = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Delete Trip");
});

// --- Assignments Functions (Placeholders) ---

export const createAssignment = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Assignment");
});

export const getAssignments = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Assignments");
});

export const updateAssignmentStatus = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update Assignment Status");
});

// --- Trip Status History Functions (Placeholders) ---

export const addTripStatusUpdate = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Add Trip Status Update");
});
