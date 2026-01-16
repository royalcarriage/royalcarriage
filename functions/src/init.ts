import * as admin from "firebase-admin";

export function initFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}
