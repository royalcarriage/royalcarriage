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

function readEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env[key]) return process.env[key];
  if (typeof window !== "undefined") {
    // @ts-ignore
    return window?.__ENV__?.[key];
  }
  return undefined;
}

export function getClientConfig(): FirebaseOptions | null {
  const apiKey = readEnv("NEXT_PUBLIC_FIREBASE_API_KEY");
  const authDomain = readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const storageBucket = readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  const messagingSenderId = readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  const appId = readEnv("NEXT_PUBLIC_FIREBASE_APP_ID");
  const measurementId = readEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID");

  const config: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
  };

  const valid = Object.values(config).every(Boolean);
  return valid ? config : null;
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
