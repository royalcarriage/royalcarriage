// User document
export interface UserDoc {
  uid: string;
  email: string;
  role: "SuperAdmin" | "Admin" | "Editor" | "Viewer";
  org: string;
  createdAt: string;
  lastLogin?: string;
}

// Site configuration
export interface SiteDoc {
  siteSlug: "airport" | "partybus" | "corporate" | "wedding";
  domain: string;
  primaryIntent: string;
  ga4Id: string;
  status: "active" | "paused";
  lastDeploy: string;
  org: string;
}

// Import logs
export interface MoovsImportDoc {
  fileName: string;
  importedAt: string;
  status: "success" | "failed" | "processing";
  records: number;
  org: string;
}

export interface AdsImportDoc {
  fileName: string;
  datasetName: string;
  importedAt: string;
  status: "success" | "failed" | "processing";
  org: string;
}

// Metrics rollups
export interface MetricsRollupDoc {
  date: string; // YYYY-MM-DD
  revenue: number;
  adSpend: number;
  profitProxy: number;
  aov: number;
  org: string;
}

// SEO topics
export interface SeoTopicDoc {
  topicId: string;
  siteSlug: string;
  pageType: "service" | "city" | "blog" | "fleet";
  keywordCluster: string;
  status: "draft" | "ready" | "published" | "blocked";
  createdAt: string;
  org: string;
}

// SEO runs
export interface SeoRunDoc {
  runId: string;
  startedAt: string;
  completedAt?: string;
  status: "running" | "pass" | "fail";
  failReasons: string[];
  org: string;
}

// Images
export interface ImageDoc {
  entityType: "vehicle" | "service" | "city" | "blog";
  entitySlug: string;
  storagePath: string;
  alt: string;
  source: "owned" | "licensed" | "ai";
  proof?: string;
  org: string;
}
