import { ensureFirebaseApp } from "./firebaseClient";

const firebaseApp = ensureFirebaseApp();

// Export Firebase instances with type assertion for client-side usage
// In production, Firebase config should always be present from environment variables
export const db = firebaseApp.db!;
export const auth = firebaseApp.auth!;
export const storage = firebaseApp.storage!;
