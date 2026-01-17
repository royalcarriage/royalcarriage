import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

// --- PUSH NOTIFICATIONS ---

export const sendPushToDriver = functions.https.onCall(
  async (data, context) => {
    const { driverId, title, body } = data;
    const userDoc = await db.collection("users").doc(driverId).get();
    const fcmToken = userDoc.data()?.fcmToken;
    if (fcmToken) {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
      });
    }
    return { sent: !!fcmToken };
  },
);

export const broadcastToAllDrivers = functions.https.onCall(
  async (data, context) => {
    const { message } = data;
    await admin.messaging().sendEachForMulticast({
      tokens: [], // Fetch all active tokens
      notification: { title: "Fleet Broadcast", body: message },
    });
    return { success: true };
  },
);

// --- SMS (Twilio Mock) ---

export const sendSmsToCustomer = functions.https.onCall(
  async (data, context) => {
    const { phone, message } = data;
    // Call Twilio API
    await db
      .collection("sms_logs")
      .add({
        phone,
        message,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return { success: true };
  },
);

export const notifyDriverTripAssigned = functions.firestore
  .document("trips/{tripId}")
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    if (after.driverId && !before.driverId) {
      // Driver assigned - send SMS and Push
      console.log(
        `Notifying driver ${after.driverId} about trip ${context.params.tripId}`,
      );
    }
  });

// --- EMAIL (SendGrid Mock) ---

export const sendMarketingEmail = functions.https.onCall(
  async (data, context) => {
    const { recipientList, templateId } = data;
    // Integration logic
    return { batchId: "batch_123" };
  },
);

// --- SLACK INTEGRATION ---

export const postToSlackChannel = functions.https.onCall(
  async (data, context) => {
    const { channel, text } = data;
    // Call Slack Webhook
    return { status: "posted" };
  },
);

export const alertHighPriorityIncident = functions.firestore
  .document("incidents/{id}")
  .onCreate(async (snap, context) => {
    const incident = snap.data();
    if (incident.severity === "high") {
      // Trigger Slack alert
    }
  });

// --- SYSTEM ALERTS ---

export const notifySuperAdminOnLogin = functions.auth
  .user()
  .onCreate(async (user) => {
    // Audit new account creation
    return null;
  });

export const sendDailyReportSummary = functions.pubsub
  .schedule("every day 21:00")
  .onRun(async (context) => {
    // Gather stats and email to admin
    return null;
  });
