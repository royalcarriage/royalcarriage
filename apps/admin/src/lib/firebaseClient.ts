import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const DEFAULT_ORG = "royalcarriage";

// Embed Firebase config at module load time so Next.js can inline values
const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

if (typeof window !== "undefined") {
  console.log("[Firebase] Config status:", {
    apiKey: !!FIREBASE_CONFIG.apiKey,
    authDomain: !!FIREBASE_CONFIG.authDomain,
    projectId: !!FIREBASE_CONFIG.projectId,
    appId: !!FIREBASE_CONFIG.appId,
    allPresent: Object.values(FIREBASE_CONFIG).every(Boolean),
  });
}

export function getClientConfig(): FirebaseOptions | null {
  // Check if config has required Firebase values
  // Note: measurementId is optional for Analytics
  const required = [
    FIREBASE_CONFIG.apiKey,
    FIREBASE_CONFIG.authDomain,
    FIREBASE_CONFIG.projectId,
    FIREBASE_CONFIG.appId,
  ];
  const valid = required.every(Boolean);

  if (!valid && typeof window !== "undefined") {
    console.warn("[Firebase] Config incomplete:", FIREBASE_CONFIG);
  }
  return valid ? FIREBASE_CONFIG : null;
}

export function ensureFirebaseApp(customConfig?: FirebaseOptions): {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
  configured: boolean;
} {
  const config = customConfig || getClientConfig();
  if (!config) return { app: null, auth: null, db: null, storage: null, configured: false };
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  return { app, auth, db, storage, configured: true };
}

export async function googleSignIn(auth: Auth): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function googleSignOut(auth: Auth): Promise<void> {
  await signOut(auth);
}

export async function emailSignIn(auth: Auth, email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function emailRegister(auth: Auth, email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function sendResetEmail(auth: Auth, email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export { DEFAULT_ORG };
