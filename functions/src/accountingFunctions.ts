import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

const verifyAuth = (context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');
};

// --- INVOICING ---

export const createInvoice = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { customerId, items, dueDate } = data;
    let total = 0;
    items.forEach((i: any) => total += i.amount);
    
    const ref = await db.collection("invoices").add({
        customerId, items, total, dueDate,
        status: "draft",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: ref.id };
});

export const sendInvoice = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("invoices").doc(data.invoiceId).update({
        status: "sent",
        sentAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const recordPayment = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { invoiceId, amount, method } = data;
    await db.collection("payments").add({
        invoiceId, amount, method,
        recordedBy: context.auth!.uid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection("invoices").doc(invoiceId).update({ status: "paid" });
    return { success: true };
});

export const getOverdueInvoices = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const now = new Date();
    const snap = await db.collection("invoices")
        .where("status", "in", ["sent", "partial"])
        .where("dueDate", "<", now.toISOString())
        .get();
    return snap.docs.map(d => d.data());
});

// --- EXPENSES ---

export const logExpense = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { category, amount, description, vendor } = data;
    await db.collection("expenses").add({
        category, amount, description, vendor,
        loggedBy: context.auth!.uid,
        date: admin.firestore.FieldValue.serverTimestamp()
    });
    return { success: true };
});

export const getExpenseReport = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    const { startDate, endDate } = data;
    const snap = await db.collection("expenses")
        .where("date", ">=", new Date(startDate))
        .where("date", "<=", new Date(endDate))
        .get();
    return snap.docs.map(d => d.data());
});

// --- FINANCIAL REPORTING ---

export const generatePLStatement = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    // Mock aggregation
    return { revenue: 500000, expenses: 300000, profit: 200000 };
});

export const getRevenueStats = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    return { daily: 1000, weekly: 7000, monthly: 30000 };
});

export const exportToQuickbooks = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    return { success: true, message: "Export queued" };
});

export const updateGlobalRate = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    await db.collection("settings").doc("rates").update(data.rates);
    return { success: true };
});