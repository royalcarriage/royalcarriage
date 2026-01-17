/**
 * Helper to sync DB roles to Firebase custom claims if Firebase Admin SDK is initialized.
 * This is optional — keep it safe if firebase-admin is not configured.
 */
import admin from "firebase-admin";
import { firebaseClaimFromRole } from "@shared/roles";

export async function syncUserRoleToFirebase(uid: string, role: string) {
  if (!admin || !admin.auth) {
    console.warn("firebase-admin not initialized; skipping claim sync");
    return;
  }

  try {
    const claims = firebaseClaimFromRole(role as any);
    await admin.auth().setCustomUserClaims(uid, claims as any);
    console.log("Synced role to firebase claims for", uid);
  } catch (e) {
    console.warn("Failed to sync firebase claims:", (e as Error)?.message || e);
  }
}
