// Functions for Payroll module

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// --- Driver Profiles Functions ---

export const createDriverProfile = functions.https.onRequest(
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        hireDate,
        status,
        payRate,
        payRateType,
        paymentMethod,
        bankInfo,
        deductions,
      } = req.body;

      if (!firstName || !lastName || !email || !payRate || !payRateType) {
        return res.status(400).json({
          error:
            "Missing required fields: firstName, lastName, email, payRate, payRateType",
        });
      }

      const profile = {
        firstName,
        lastName,
        email,
        phone,
        hireDate: new Date(hireDate), // Ensure date is valid
        status: status || "active",
        payRate: parseFloat(payRate),
        payRateType,
        paymentMethod,
        bankInfo,
        deductions: deductions || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: req.body.auth?.uid || null,
      };

      const writeResult = await admin
        .firestore()
        .collection("driverProfiles")
        .add(profile);
      res.status(201).json({ id: writeResult.id, ...profile });
    } catch (error) {
      functions.logger.error("Error creating driver profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export const getDriverProfiles = functions.https.onRequest(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const snapshot = await admin.firestore().collection("driverProfiles").get();
    const profiles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(profiles);
  } catch (error) {
    functions.logger.error("Error fetching driver profiles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Placeholder for update and delete functions for driver profiles
export const updateDriverProfile = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update Driver Profile");
});

export const deleteDriverProfile = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Delete Driver Profile");
});

// --- Pay Rules Functions (Placeholders) ---

export const createPayRule = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Pay Rule");
});

export const getPayRules = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Pay Rules");
});

// --- Payroll Runs Functions (Placeholders) ---

export const createPayrollRun = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Payroll Run");
});

export const getPayrollRuns = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Payroll Runs");
});

// --- Payroll Statements Functions (Placeholders) ---

export const createPayrollStatement = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Payroll Statement");
});

export const getPayrollStatements = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Payroll Statements");
});

// --- Carryover Functions (Placeholders) ---

export const updateCarryover = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update Carryover");
});
