export type Role =
  | "superadmin"
  | "saas_admin"
  | "admin"
  | "fleet_manager"
  | "accountant"
  | "dispatcher"
  | "editor"
  | "viewer";

export type SiteKey =
  | "all"
  | "admin"
  | "airport"
  | "partybus"
  | "corporate"
  | "wedding";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  org: string;
  organizationId?: string;
  photoURL?: string;
  phoneNumber?: string;
  department?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "active" | "inactive" | "suspended";
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive" | "suspended";
  plan: "free" | "starter" | "professional" | "enterprise";
  settings?: {
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
    features?: string[];
    limits?: {
      users?: number;
      storage?: number;
    };
  };
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportRecord {
  id?: string;
  type: "moovs" | "ads";
  fileName: string;
  rows: number;
  warnings: string[];
  status: "pending" | "processing" | "completed" | "failed";
  org: string;
  createdAt: string;
  site: SiteKey | "all";
}

export interface MetricRollup {
  spend: number;
  revenue: number;
  profitProxy: number;
  aov: number;
  org: string;
  period: string;
}

export interface FreshnessStatus {
  label: string;
  status: "fresh" | "stale" | "down";
  updatedAt: string;
}

export interface AlertItem {
  id?: string;
  message: string;
  severity: "red" | "yellow";
  createdAt: string;
  org: string;
  site?: SiteKey | "all";
}

export interface SiteHealth {
  site: SiteKey;
  sitemapOk: boolean;
  robotsOk: boolean;
  canonicalOk: boolean;
  trackingOk: boolean;
  lastDeploy: string;
  ctaOk: boolean;
  org: string;
}

export interface SeoQueueItem {
  id?: string;
  page: string;
  intent: string;
  status: "queued" | "drafting" | "gating" | "ready" | "published";
  org: string;
  site: SiteKey | "all";
  createdAt: string;
}

export interface SeoDraft {
  id?: string;
  topic: string;
  status: "draft" | "ready" | "published";
  org: string;
  site: SiteKey | "all";
  updatedAt: string;
}

export interface GateReport {
  id?: string;
  topic: string;
  result: "pass" | "fail";
  summary: string;
  org: string;
  createdAt: string;
}

export interface ImageMeta {
  id?: string;
  url: string;
  site: SiteKey | "all";
  entity?: string;
  tags: string[];
  missing?: boolean;
  org: string;
  createdAt: string;
}

export interface DeployLog {
  id?: string;
  target: SiteKey;
  status: "queued" | "success" | "failed";
  message: string;
  org: string;
  createdAt: string;
}

export interface SettingsPayload {
  phone: string;
  bookingUrl: string;
  ga4Id: string;
  publishLimit: number;
  similarityThreshold: number;
  org: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface SelfAuditResult {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
}

export const ORG_ID = "royalcarriagelimo";
