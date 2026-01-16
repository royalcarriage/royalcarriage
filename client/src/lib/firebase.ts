import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration for royalcarriagelimoseo project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "royalcarriagelimoseo.firebaseapp.com",
  projectId: "royalcarriagelimoseo",
  storageBucket: "royalcarriagelimoseo.appspot.com",
  messagingSenderId: "910418192896",
  appId: "1:910418192896:web:43a0aa8f8bf2a2cb2ac6e5",
};

// Validate required configuration
if (!firebaseConfig.apiKey) {
  throw new Error(
    "VITE_FIREBASE_API_KEY environment variable is required. Please add it to your .env file.",
  );
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// User roles enum
export enum UserRole {
  SUPER_ADMIN = "SuperAdmin",
  ADMIN = "Admin",
  EDITOR = "Editor",
  VIEWER = "Viewer",
}

// SuperAdmin email
export const SUPER_ADMIN_EMAIL = "info@royalcarriagelimo.com";

// Helper to check if user is SuperAdmin
export const isSuperAdmin = (email: string | null | undefined): boolean => {
  return email === SUPER_ADMIN_EMAIL;
};

// Helper to check role permissions
export const hasPermission = (
  userRole: UserRole,
  requiredRole: UserRole,
): boolean => {
  const roleHierarchy = {
    [UserRole.SUPER_ADMIN]: 4,
    [UserRole.ADMIN]: 3,
    [UserRole.EDITOR]: 2,
    [UserRole.VIEWER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
