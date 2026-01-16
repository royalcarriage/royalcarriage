import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default(UserRole.USER).$type<UserRoleType>(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// AI Page Analysis and Recommendations
export const pageAnalysis = pgTable("page_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageUrl: text("page_url").notNull(),
  pageName: text("page_name").notNull(),
  
  // SEO Metrics
  seoScore: integer("seo_score"), // 0-100
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: jsonb("keywords").$type<string[]>(), // Array of keywords found
  headingStructure: jsonb("heading_structure"), // h1, h2, h3 analysis
  
  // Content Analysis
  contentScore: integer("content_score"), // 0-100
  wordCount: integer("word_count"),
  readabilityScore: integer("readability_score"),
  
  // AI Recommendations
  aiRecommendations: jsonb("ai_recommendations").$type<{
    seo: string[];
    content: string[];
    style: string[];
    conversion: string[];
  }>(),
  
  // Location & Vehicle Context
  targetLocation: text("target_location"),
  targetVehicle: text("target_vehicle"),
  
  // Analytics Integration
  analyticsData: jsonb("analytics_data").$type<{
    pageViews: number;
    bounceRate: number;
    avgTimeOnPage: number;
    conversions: number;
  }>(),
  
  // Status
  status: text("status").notNull().default("analyzed"), // analyzed, pending_review, approved, deployed
  lastAnalyzed: timestamp("last_analyzed").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// AI Generated Content Suggestions
export const contentSuggestions = pgTable("content_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageAnalysisId: varchar("page_analysis_id").notNull().references(() => pageAnalysis.id),
  
  // Suggested Changes
  suggestionType: text("suggestion_type").notNull(), // seo, content, style, images
  originalContent: text("original_content"),
  suggestedContent: text("suggested_content").notNull(),
  reason: text("reason").notNull(),
  
  // Priority and Impact
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  estimatedImpact: integer("estimated_impact"), // 0-100
  
  // Approval Workflow
  status: text("status").notNull().default("pending"), // pending, approved, rejected, deployed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Deployment
  deployedAt: timestamp("deployed_at"),
  rollbackAvailable: boolean("rollback_available").default(true),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// AI Generated Images
export const aiImages = pgTable("ai_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageUrl: text("page_url"),
  
  // Image Details
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  storageUrl: text("storage_url"),
  thumbnailUrl: text("thumbnail_url"),
  
  // Image Metadata
  width: integer("width"),
  height: integer("height"),
  format: text("format"), // png, jpg, webp
  size: integer("size"), // in bytes
  
  // Context
  purpose: text("purpose"), // hero, service_card, fleet, location
  targetLocation: text("target_location"),
  targetVehicle: text("target_vehicle"),
  
  // Status
  status: text("status").notNull().default("generated"), // generated, optimized, deployed
  isActive: boolean("is_active").default(false),
  
  generatedBy: varchar("generated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Audit Logs for AI Actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Action Details
  action: text("action").notNull(), // analyze_page, generate_content, deploy_changes, generate_image
  entityType: text("entity_type").notNull(), // page, content, image
  entityId: varchar("entity_id"),
  
  // User and System
  userId: varchar("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  
  // Details
  details: jsonb("details"), // Additional action-specific data
  status: text("status").notNull(), // success, failed, pending
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Scheduled AI Jobs
export const scheduledJobs = pgTable("scheduled_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Job Configuration
  jobType: text("job_type").notNull(), // page_analysis, content_generation, image_optimization
  schedule: text("schedule").notNull(), // cron expression
  isActive: boolean("is_active").default(true),
  
  // Target Configuration
  targetPages: jsonb("target_pages").$type<string[]>(), // URLs to analyze
  configuration: jsonb("configuration"), // Job-specific config
  
  // Execution Tracking
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  lastStatus: text("last_status"), // success, failed, running
  executionCount: integer("execution_count").default(0),
  
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// AI Configuration and Settings
export const aiSettings = pgTable("ai_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Setting Details
  settingKey: text("setting_key").notNull().unique(),
  settingValue: jsonb("setting_value").notNull(),
  description: text("description"),
  
  // Metadata
  category: text("category").notNull(), // ai_model, api_keys, thresholds, automation
  isSecret: boolean("is_secret").default(false),
  
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});
