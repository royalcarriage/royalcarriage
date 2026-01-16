// Functions for Accounting module

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// --- Ledger Functions ---

export const createLedgerEntry = functions.https.onRequest(
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const { amount, date, description, category, accountId, transactionType } = req.body;

      if (!amount || !date || !description || !category || !accountId || !transactionType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newEntry = {
        amount: parseFloat(amount),
        date: new Date(date), // Ensure date is a valid Date object
        description,
        category,
        accountId,
        transactionType,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: req.body.auth?.uid || null, // Assuming auth info might be passed or inferred
      };

      const writeResult = await admin.firestore().collection("ledger").add(newEntry);
      res.status(201).json({ id: writeResult.id, ...newEntry });

    } catch (error) {
      functions.logger.error("Error creating ledger entry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const getLedgerEntries = functions.https.onRequest(
  async (req, res) => {
    if (req.method !== "GET") {
      return res.status(405).send("Method Not Allowed");
    }

    try {
      const snapshot = await admin.firestore().collection("ledger").get();
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.status(200).json(entries);
    } catch (error) {
      functions.logger.error("Error fetching ledger entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Placeholder for update and delete functions
export const updateLedgerEntry = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Update Ledger Entry");
});

export const deleteLedgerEntry = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Delete Ledger Entry");
});

// --- Other Accounting Module Functions (Placeholders) ---

export const createChartOfAccount = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Chart of Account");
});

export const getChartOfAccounts = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Chart of Accounts");
});

export const createInvoice = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Invoice");
});

export const getInvoices = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Invoices");
});

export const createReconciliation = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Create Reconciliation");
});

export const getReconciliations = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Reconciliations");
});

export const getProfitAndLoss = functions.https.onRequest((req, res) => {
  res.status(501).send("Not Implemented: Get Profit and Loss Report");
});
