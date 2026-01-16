// Admin Dashboard Types

// Import-related types
export interface ImportTemplate {
  id: string;
  name: string;
  type: 'moovs' | 'ads';
  columnMappings: Record<string, string>; // source column → canonical name
  createdBy: string;
  createdAt: string;
}

export interface ImportError {
  row: number;
  column: string;
  value: string;
  error: 'missing' | 'invalid_format' | 'duplicate' | 'parse_error';
  message: string;
}

export interface ImportLog {
  id: string;
  type: 'moovs' | 'ads';
  fileName: string;
  fileHash: string;
  filePath: string; // Firebase Storage path
  rowCount: number;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportError[];
  warnings: string[];
  completenessScore: number; // 0-100
  dedupeCount: number;
  status: 'pending' | 'processing' | 'success' | 'partial' | 'failed';
  userId: string;
  userEmail: string;
  createdAt: string;
  completedAt?: string;
}

// Audit trail
export interface AuditLog {
  id: string;
  action: 'import' | 'publish' | 'deploy' | 'settings_change' | 'user_action';
  userId: string;
  userEmail: string;
  timestamp: string;
  details: {
    fileName?: string;
    fileHash?: string;
    recordCount?: number;
    warnings?: string[];
    changes?: Record<string, { old: any; new: any }>;
    pageIds?: string[];
    siteSlug?: string;
  };
}

// ROI and Analytics
export interface MarginConfig {
  serviceType: string;
  taxRate: number; // e.g., 0.1025 for 10.25%
  payoutRate: number; // e.g., 0.40 for 40% to driver
}

export interface Booking {
  id: string;
  orderNo: string;
  tripNo: string;
  totalAmount: number;
  baseRate: number;
  taxAmount: number;
  driverPayout: number;
  pickupDate: string;
  serviceType: string;
  vehicleType: string;
  reqSource?: string; // UTM or tracking info
  gclid?: string;
}

export interface KeywordAction {
  keyword: string;
  spend: number;
  conversions: number;
  revenue: number;
  roas: number;
  cpa: number;
  recommendedPage: string;
  action: 'SCALE' | 'FIX' | 'PAUSE' | 'ADD_NEGATIVES' | 'BUILD_PAGE';
  reason: string;
}

// SEO Bot
export interface SEOTopic {
  id: string;
  title: string;
  slug: string;
  pageType: 'city' | 'service' | 'fleet' | 'blog';
  siteSlug: string;
  status: 'proposed' | 'draft' | 'ready' | 'published' | 'blocked';
  primaryKeyword: string;
  secondaryKeywords: string[];
  targetUrl: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface SEODraft {
  id: string;
  topicId: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  schema?: string; // JSON-LD schema
  internalLinks: string[];
  images: string[];
  wordCount: number;
  gateStatus: 'pending' | 'passed' | 'warned' | 'failed';
  gateResults?: GateResult;
  createdAt: string;
  updatedAt: string;
}

export interface GateResult {
  draftId: string;
  checks: {
    duplicateTitle: { passed: boolean; details: string };
    duplicateMeta: { passed: boolean; details: string };
    similarityScore: { passed: boolean; score: number; threshold: number };
    schemaValid: { passed: boolean; errors: string[] };
    brokenLinks: { passed: boolean; links: string[] };
    missingImages: { passed: boolean; missing: string[] };
    interlinks: { passed: boolean; missing: string[] };
    keywordMatch: { passed: boolean; details: string };
  };
  suggestions: string[];
  overallStatus: 'passed' | 'warned' | 'failed';
  timestamp: string;
}

// Images
export interface ImageMetadata {
  id: string;
  path: string; // Firebase Storage path
  url: string;
  alt: string;
  entityType: 'vehicle' | 'service' | 'city' | 'blog' | 'general';
  entitySlug: string;
  siteSlug: string;
  source: 'owned' | 'licensed' | 'ai';
  proofUrl?: string; // Required if licensed
  width: number;
  height: number;
  size: number; // bytes
  format: string; // 'jpeg', 'png', 'webp'
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

export interface ImageSyncLog {
  id: string;
  timestamp: string;
  action: 'upload' | 'delete' | 'update' | 'sync';
  imageCount: number;
  entitiesUpdated: string[];
  missing: string[];
  uploadedBy: string;
  siteSlug?: string;
}

// Changelog
export interface ChangelogEntry {
  id: string;
  date: string;
  type: 'publish' | 'update' | 'delete' | 'import';
  pages: string[];
  keywords: string[];
  images: string[];
  author: string;
  authorEmail: string;
  description: string;
}

// Settings
export interface PublishCadence {
  minDaysBetweenPublish: number;
  maxPagesPerCycle: number;
  defaultCycle: 'weekly' | 'biweekly' | 'monthly';
  lastPublishDate?: string;
  nextAllowedDate?: string;
}

export interface SeasonalContent {
  season: 'winter' | 'spring' | 'summer' | 'fall';
  active: boolean;
  heroImages: Record<string, string>; // siteSlug → image path
  promoSections: Record<string, string>; // siteSlug → promo HTML
}

// GSC Data
export interface GSCPage {
  id: string;
  page: string;
  siteSlug: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
  importedAt: string;
}

// Vehicle Profit
export interface VehicleProfit {
  vehicleType: string;
  bookings: number;
  revenue: number;
  profitProxy: number;
  avgRevenue: number;
  rank: number;
}

export type UserRole = 'Viewer' | 'Editor' | 'Admin' | 'SuperAdmin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: string;
  lastLogin: string;
}
