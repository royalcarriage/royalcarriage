import { HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

const ROLE_ORDER = ["Viewer", "Editor", "Admin", "SuperAdmin"] as const;
type Role = typeof ROLE_ORDER[number];

function roleRank(role: string): number {
  const idx = ROLE_ORDER.indexOf(role as Role);
  return idx < 0 ? -1 : idx;
}

export async function requireRole(req: CallableRequest, allowed: Role[]): Promise<void> {
  if (!req.auth) {
    throw new HttpsError("unauthenticated", "Login required.");
  }
  
  const uid = req.auth.uid;
  const db = getFirestore();
  const userDoc = await db.collection("users").doc(uid).get();
  
  if (!userDoc.exists) {
    throw new HttpsError("permission-denied", "User profile not found.");
  }
  
  const userData = userDoc.data();
  const userRole = userData?.role as string;
  
  if (!userRole) {
    throw new HttpsError("permission-denied", "No role assigned.");
  }
  
  const minRequiredRank = Math.min(...allowed.map(r => roleRank(r)));
  const userRank = roleRank(userRole);
  
  if (userRank < minRequiredRank) {
    throw new HttpsError("permission-denied", `Requires ${allowed.join(" or ")} role.`);
  }
}
