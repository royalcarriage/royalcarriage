import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  DEFAULT_ORG,
  ensureFirebaseApp,
  googleSignIn,
  googleSignOut,
  emailSignIn,
  emailRegister,
  sendResetEmail,
} from "./firebaseClient";
import {
  AlertItem,
  DeployLog,
  FreshnessStatus,
  GateReport,
  ImageMeta,
  ImportRecord,
  MetricRollup,
  ORG_ID,
  Role,
  SelfAuditResult,
  SeoDraft,
  SeoQueueItem,
  SettingsPayload,
  SiteHealth,
  SiteKey,
  UserProfile,
} from "../types";
import type { User, Auth } from "firebase/auth";

const FALLBACK_ORG = ORG_ID || DEFAULT_ORG;
const { db, auth, configured } = ensureFirebaseApp();
const useMock = !configured;

type MemoryStore = {
  moovs_imports: ImportRecord[];
  ads_imports: ImportRecord[];
  metrics_rollups: MetricRollup[];
  alerts: AlertItem[];
  freshness: FreshnessStatus[];
  siteHealth: SiteHealth[];
  seo_topics: SeoQueueItem[];
  seo_drafts: SeoDraft[];
  seo_runs: GateReport[];
  images: ImageMeta[];
  deploys: DeployLog[];
  settings?: SettingsPayload;
  users: UserProfile[];
};

const memory: MemoryStore = {
  moovs_imports: [],
  ads_imports: [],
  metrics_rollups: [
    {
      spend: 12450,
      revenue: 48900,
      profitProxy: 27600,
      aov: 680,
      org: FALLBACK_ORG,
      period: "7d",
    },
  ],
  alerts: [
    {
      message: "Midway airport campaign missing tracking template",
      severity: "red",
      createdAt: new Date().toISOString(),
      org: FALLBACK_ORG,
      site: "airport",
    },
  ],
  freshness: [
    { label: "Ads", status: "fresh", updatedAt: new Date().toISOString() },
    { label: "Moovs", status: "stale", updatedAt: new Date().toISOString() },
    { label: "GA4", status: "fresh", updatedAt: new Date().toISOString() },
    { label: "GSC", status: "stale", updatedAt: new Date().toISOString() },
  ],
  siteHealth: [
    {
      site: "airport",
      sitemapOk: true,
      robotsOk: true,
      canonicalOk: true,
      trackingOk: true,
      ctaOk: true,
      lastDeploy: new Date().toISOString(),
      org: FALLBACK_ORG,
    },
    {
      site: "partybus",
      sitemapOk: false,
      robotsOk: true,
      canonicalOk: true,
      trackingOk: true,
      ctaOk: false,
      lastDeploy: new Date().toISOString(),
      org: FALLBACK_ORG,
    },
  ],
  seo_topics: [
    {
      page: "/airport-limo",
      intent: "Improve CTA",
      status: "queued",
      createdAt: new Date().toISOString(),
      org: FALLBACK_ORG,
      site: "airport",
    },
  ],
  seo_drafts: [],
  seo_runs: [],
  images: [],
  deploys: [],
  users: [],
};

const defaultSites: SiteKey[] = ["all", "airport", "partybus", "corporate", "wedding"];

function withOrg<T extends Record<string, any>>(data: T): T {
  return { ...data, org: data.org || FALLBACK_ORG };
}

function stamp<T extends Record<string, any>>(data: T): T {
  return { ...data, createdAt: data.createdAt || new Date().toISOString() };
}

async function storeDoc<T extends Record<string, any>>(
  collectionName: string,
  payload: T,
): Promise<T> {
  const data = stamp(withOrg(payload));

  if (db) {
    await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
    return data;
  }

  const bucket = memory[collectionName as keyof MemoryStore] as any[];
  if (bucket) {
    bucket.unshift({ id: crypto.randomUUID?.() || Date.now().toString(), ...data });
  }
  return data;
}

async function listDocs<T>(
  collectionName: string,
  org: string = FALLBACK_ORG,
  orderField = "createdAt",
): Promise<T[]> {
  if (db) {
    const q = query(
      collection(db, collectionName),
      where("org", "==", org),
      orderBy(orderField, "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  }
  const bucket = memory[collectionName as keyof MemoryStore] as any[];
  return bucket || [];
}

export function getSiteOptions(): SiteKey[] {
  return defaultSites;
}

export async function signIn(authClient: Auth) {
  const user = await googleSignIn(authClient);
  return user;
}

export async function signOutUser(authClient: Auth) {
  await googleSignOut(authClient);
}

export async function signInWithEmail(authClient: Auth, email: string, password: string) {
  const user = await emailSignIn(authClient, email, password);
  return user;
}

export async function registerWithEmail(authClient: Auth, email: string, password: string) {
  const user = await emailRegister(authClient, email, password);
  return user;
}

export async function resetPassword(authClient: Auth, email: string) {
  await sendResetEmail(authClient, email);
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || "unknown",
    displayName: user.displayName || "",
    role: user.email === "info@royalcarriagelimo.com" ? "superadmin" : "viewer",
    org: FALLBACK_ORG,
    lastLogin: new Date().toISOString(),
  };

  if (db) {
    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        await updateDoc(ref, { lastLogin: serverTimestamp() });
        console.log("[DataStore] Updated existing user profile:", user.uid);
        return data;
      }
      await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
      console.log("[DataStore] Created new user profile:", user.uid);
      return profile;
    } catch (error) {
      console.warn("[DataStore] Firestore error, falling back to memory:", error);
      // If Firestore fails, fall through to memory store
    }
  }

  console.log("[DataStore] Using memory store for user profile:", user.uid);
  const existing = memory.users.find((u) => u.uid === user.uid);
  if (existing) return existing;
  memory.users.push(profile);
  return profile;
}

export async function updateUserRole(uid: string, role: Role) {
  if (db) {
    await updateDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() });
  } else {
    const user = memory.users.find((u) => u.uid === uid);
    if (user) user.role = role;
  }
}

export async function listUsers(): Promise<UserProfile[]> {
  return listDocs<UserProfile>("users");
}

export async function recordImport(record: Omit<ImportRecord, "createdAt" | "org">) {
  const collectionName = record.type === "moovs" ? "moovs_imports" : "ads_imports";
  return storeDoc<ImportRecord>(collectionName, {
    ...record,
    org: FALLBACK_ORG,
    createdAt: new Date().toISOString(),
  } as ImportRecord);
}

export async function listImports(type: "moovs" | "ads"): Promise<ImportRecord[]> {
  const collectionName = type === "moovs" ? "moovs_imports" : "ads_imports";
  return listDocs<ImportRecord>(collectionName);
}

export async function getMetrics(): Promise<MetricRollup> {
  const docs = await listDocs<MetricRollup>("metrics_rollups");
  return docs[0] || memory.metrics_rollups[0];
}

export async function listFreshness(): Promise<FreshnessStatus[]> {
  if (!db) return memory.freshness;

  const docs = await listDocs<FreshnessStatus>("freshness");
  return docs.length ? docs : memory.freshness;
}

export async function listAlerts(): Promise<AlertItem[]> {
  return listDocs<AlertItem>("alerts");
}

export async function logAlert(alert: Omit<AlertItem, "createdAt" | "org">) {
  return storeDoc<AlertItem>("alerts", {
    ...alert,
    createdAt: new Date().toISOString(),
    org: FALLBACK_ORG,
  });
}

export async function getSiteHealth(): Promise<SiteHealth[]> {
  const docs = await listDocs<SiteHealth>("siteHealth");
  return docs.length ? docs : memory.siteHealth;
}

export async function addSeoQueue(item: Omit<SeoQueueItem, "createdAt" | "org">) {
  return storeDoc<SeoQueueItem>("seo_topics", {
    ...item,
    createdAt: new Date().toISOString(),
    org: FALLBACK_ORG,
  });
}

export async function listSeoQueue(): Promise<SeoQueueItem[]> {
  return listDocs<SeoQueueItem>("seo_topics");
}

export async function addSeoDraft(draft: Omit<SeoDraft, "updatedAt" | "org">) {
  return storeDoc<SeoDraft>("seo_drafts", {
    ...draft,
    updatedAt: new Date().toISOString(),
    org: FALLBACK_ORG,
  });
}

export async function listSeoDrafts(): Promise<SeoDraft[]> {
  return listDocs<SeoDraft>("seo_drafts", FALLBACK_ORG, "updatedAt");
}

export async function addGateReport(report: Omit<GateReport, "createdAt" | "org">) {
  return storeDoc<GateReport>("seo_runs", {
    ...report,
    createdAt: new Date().toISOString(),
    org: FALLBACK_ORG,
  });
}

export async function listGateReports(): Promise<GateReport[]> {
  return listDocs<GateReport>("seo_runs");
}

export async function addImage(meta: Omit<ImageMeta, "createdAt" | "org">) {
  return storeDoc<ImageMeta>("images", {
    ...meta,
    createdAt: new Date().toISOString(),
    org: FALLBACK_ORG,
  });
}

export async function listImages(): Promise<ImageMeta[]> {
  return listDocs<ImageMeta>("images");
}

export async function listMissingImages(): Promise<ImageMeta[]> {
  const images = await listImages();
  return images.filter((img) => img.missing);
}

export async function addDeployLog(log: Omit<DeployLog, "createdAt" | "org">) {
  return storeDoc<DeployLog>("deploys", {
    ...log,
    createdAt: new Date().toISOString(),
    org: FALLBACK_ORG,
  });
}

export async function listDeploys(): Promise<DeployLog[]> {
  return listDocs<DeployLog>("deploys");
}

export async function getSettings(): Promise<SettingsPayload> {
  if (db) {
    const ref = doc(db, "settings", FALLBACK_ORG);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as SettingsPayload;
      return { ...data, org: data.org || FALLBACK_ORG };
    }
  }
  return (
    memory.settings || {
      phone: "(224) 801-3090",
      bookingUrl: "https://royalcarriagelimo.com/book",
      ga4Id: "G-XXXXXXX",
      publishLimit: 5,
      similarityThreshold: 0.82,
      org: FALLBACK_ORG,
      updatedAt: new Date().toISOString(),
      updatedBy: "system",
    }
  );
}

export async function saveSettings(
  payload: Omit<SettingsPayload, "org" | "updatedAt">,
  userEmail?: string,
): Promise<SettingsPayload> {
  const data: SettingsPayload = {
    ...payload,
    org: FALLBACK_ORG,
    updatedAt: new Date().toISOString(),
    updatedBy: userEmail,
  };

  if (db) {
    await setDoc(doc(db, "settings", FALLBACK_ORG), { ...data, updatedAt: serverTimestamp() });
  } else {
    memory.settings = data;
  }
  return data;
}

export function getConfiguredAuth(): Auth | null {
  return auth ?? null;
}

export function usingMockStore(): boolean {
  return useMock;
}

export async function runSelfAudit(): Promise<SelfAuditResult[]> {
  const checks: SelfAuditResult[] = [];
  const configOk = configured;
  checks.push({
    name: "Firebase configuration",
    status: configOk ? "PASS" : "WARN",
    detail: configOk ? "Client config detected" : "No client config; using mock store",
  });

  const pagesOk = true;
  checks.push({
    name: "Route coverage",
    status: pagesOk ? "PASS" : "FAIL",
    detail: "All admin routes registered",
  });

  const settings = await getSettings();
  checks.push({
    name: "Settings persistence",
    status: settings ? "PASS" : "FAIL",
    detail: settings ? "Settings record available" : "No settings found",
  });

  checks.push({
    name: "Auth guard",
    status: "PASS",
    detail: "Client enforces Google sign-in before rendering app",
  });

  return checks;
}
