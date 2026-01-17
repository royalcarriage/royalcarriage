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
import {
  signInWithEmail,
  registerWithEmail,
  resetPassword,
} from "../lib/dataStore";
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
      console.log("[AuthProvider] No auth configured, marking ready");
      setReady(true);
      return;
    }

    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const setReadyWithTimeout = () => {
      if (!mounted) return;
      console.log("[AuthProvider] Marking auth as ready");
      setReady(true);
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Safety timeout - if auth doesn't resolve in 5 seconds, proceed anyway
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn(
          "[AuthProvider] Auth state check timed out after 5s, proceeding with current state",
        );
        setReadyWithTimeout();
      }
    }, 5000);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        if (firebaseUser) {
          console.log(
            "[AuthProvider] User signed in, email:",
            firebaseUser.email,
          );
          try {
            // Add timeout to profile creation (3 seconds max)
            const profile = await Promise.race([
              ensureUserProfile(firebaseUser),
              new Promise<any>((_, reject) =>
                setTimeout(
                  () => reject(new Error("Profile creation timeout")),
                  3000,
                ),
              ),
            ]);
            console.log("[AuthProvider] Profile loaded successfully");
            setUser(profile);
          } catch (profileError) {
            console.warn(
              "[AuthProvider] Failed to load profile, using basic user info:",
              profileError,
            );
            // Use basic user info as fallback
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "unknown",
              displayName: firebaseUser.displayName || "",
              role:
                firebaseUser.email === "info@royalcarriagelimo.com"
                  ? "superadmin"
                  : "viewer",
              org: "royalcarriage",
              lastLogin: new Date().toISOString(),
            });
          }
        } else {
          console.log("[AuthProvider] No user signed in");
          setUser(undefined);
        }
      } catch (error) {
        console.error(
          "[AuthProvider] Unexpected error in auth state change:",
          error,
        );
        setUser(undefined);
      } finally {
        if (mounted) {
          setReadyWithTimeout();
        }
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      unsub();
    };
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
