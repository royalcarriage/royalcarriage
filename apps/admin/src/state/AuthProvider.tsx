import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ensureUserProfile,
  getConfiguredAuth,
  signIn,
  signOutUser,
} from "../lib/dataStore";
import { signInWithEmail, registerWithEmail, resetPassword } from "../lib/dataStore";
import type { Role, UserProfile, SiteKey } from "../types";
import { getSiteOptions } from "../lib/dataStore";

interface AuthContextValue {
  user?: UserProfile;
  role: Role;
  site: SiteKey;
  setSite: (site: SiteKey) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  ready: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | undefined>(undefined);
  const [site, setSite] = useState<SiteKey>("all");
  const [ready, setReady] = useState(false);
  const auth = getConfiguredAuth();

  useEffect(() => {
    if (!auth) {
      setReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await ensureUserProfile(firebaseUser);
        setUser(profile);
      } else {
        setUser(undefined);
      }
      setReady(true);
    });
    return () => unsub();
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role || "viewer",
      site,
      setSite,
      ready,
      signInWithGoogle: async () => {
        if (!auth) throw new Error("Firebase auth not configured");
        await signIn(auth);
      },
      signInWithEmail: async (email: string, password: string) => {
        if (!auth) throw new Error("Firebase auth not configured");
        await signInWithEmail(auth, email, password);
      },
      registerWithEmail: async (email: string, password: string) => {
        if (!auth) throw new Error("Firebase auth not configured");
        await registerWithEmail(auth, email, password);
      },
      resetPassword: async (email: string) => {
        if (!auth) throw new Error("Firebase auth not configured");
        await resetPassword(auth, email);
      },
      signOut: async () => {
        if (!auth) return;
        await signOutUser(auth);
        setUser(undefined);
      },
    }),
    [auth, ready, site, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const SITE_OPTIONS = getSiteOptions();
