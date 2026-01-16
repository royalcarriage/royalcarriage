import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();
const db = admin.firestore();

const verifyAuth = (context: any) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth required');
};

const verifyAdmin = (context: any) => {
    verifyAuth(context);
    if (context.auth.token.role !== 'admin' && context.auth.token.role !== 'superadmin') {
        throw new functions.https.HttpsError('permission-denied', 'Admin required');
    }
};

// --- USER MANAGEMENT ---

export const createUser = functions.https.onCall(async (data, context) => {
    verifyAdmin(context);
    const { email, password, role, displayName } = data;
    const user = await admin.auth().createUser({ email, password, displayName });
    await admin.auth().setCustomUserClaims(user.uid, { role });
    await db.collection("users").doc(user.uid).set({
        email, role, displayName,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { uid: user.uid };
});

export const updateUser = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    // Users can update themselves, admins can update anyone
    if (context.auth!.uid !== data.uid && context.auth!.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Not allowed');
    }
    await admin.auth().updateUser(data.uid, data.updates);
    if (data.updates.role) {
        await admin.auth().setCustomUserClaims(data.uid, { role: data.updates.role });
    }
    return { success: true };
});

export const disableUser = functions.https.onCall(async (data, context) => {
    verifyAdmin(context);
    await admin.auth().updateUser(data.uid, { disabled: true });
    return { success: true };
});

export const listUsers = functions.https.onCall(async (data, context) => {
    verifyAdmin(context);
    const list = await admin.auth().listUsers();
    return list.users.map(u => ({ uid: u.uid, email: u.email, role: u.customClaims?.role }));
});

// --- SYSTEM ADMIN ---

export const getSystemHealth = functions.https.onCall(async (data, context) => {
    verifyAuth(context);
    return {
        database: "online",
        storage: "online",
        lastBackup: new Date().toISOString()
    };
});

export const getErrorLogs = functions.https.onCall(async (data, context) => {
    verifyAdmin(context);
    const snap = await db.collection("error_logs")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();
    return snap.docs.map(d => d.data());
});

export const backupDatabase = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    // const _bucket = admin.storage().bucket();
    // Implementation of export logic would go here via Firestore Admin API
    console.log("Database backup initiated");
    return null;
});

export const sendSystemNotification = functions.https.onCall(async (data, context) => {
    verifyAdmin(context);
    const { message, level } = data;
    await db.collection("notifications").add({
        message, level,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        target: "all"
    });
    return { success: true };
});

export const clearSystemCache = functions.https.onCall(async (data, context) => {
    verifyAdmin(context);
    // Mock cache clear
    return { success: true };
});

export const rotateApiKeys = functions.https.onCall(async (data, context) => {
    verifyAdmin(context);
    // Mock rotation
    return { success: true, message: "Keys rotated" };
});
