// Functions for Affiliate module

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// --- Partner Profiles Functions ---

export const createPartnerProfile = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const { name, contactPerson, email, phone, address, website, commissionRate, commissionType, status } = req.body;

    if (!name || !email || !commissionRate || !commissionType) {
      res.status(400).json({ error: "Missing required fields: name, email, commissionRate, commissionType" });
      return;
    }

    const profile = {
      name,
      contactPerson,
      email,
      phone,
      address,
      website,
      commissionRate: parseFloat(commissionRate),
      commissionType,
      status: status || "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.body.auth?.uid || null,
    };

    const writeResult = await admin.firestore().collection("partnerProfiles").add(profile);
    res.status(201).json({ id: writeResult.id, ...profile });

  } catch (error) {
    functions.logger.error("Error creating partner profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getPartnerProfiles = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const snapshot = await admin.firestore().collection("partnerProfiles").get();
    const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(profiles);
  } catch (error) {
    functions.logger.error("Error fetching partner profiles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Placeholder for update and delete functions for partner profiles
export const updatePartnerProfile = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update Partner Profile");
});

export const deletePartnerProfile = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Delete Partner Profile");
});

// --- Settlements Payable Functions (Placeholders) ---

export const createSettlementPayable = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Settlement Payable");
});

export const getSettlementsPayable = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Settlements Payable");
});

// --- Settlements Receivable Functions (Placeholders) ---

export const createSettlementReceivable = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Settlement Receivable");
});

export const getSettlementsReceivable = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Settlements Receivable");
});

// --- Disputes Functions (Placeholders) ---

export const createDispute = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Dispute");
});

export const getDisputes = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Disputes");
});
