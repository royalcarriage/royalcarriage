# Royal Carriage - Jira-Style Tickets

## P0 - Critical Security Fixes

### RC-001: Firestore Rules Performance Optimization
**Type:** Bug (Performance + Security)
**Priority:** P0 - Critical
**Status:** Completed
**Story Points:** 3

**Description:**
Firestore security rules were using `get()` calls to fetch user roles, causing N+1 performance issues and increased read costs. Each security check was making an additional database read.

**Acceptance Criteria:**
- [x] Replace `get()` calls with `request.auth.token.role` access
- [x] Implement `syncUserRole` Cloud Function to maintain custom claims
- [x] Test that role changes propagate to custom claims
- [x] Verify security rules still enforce proper access control
- [x] Confirm performance improvement (no extra reads)

**Technical Notes:**
- Custom claims stored in Firebase Auth tokens
- Cloud Function trigger on `users/{userId}` writes
- Fallback to 'viewer' role if claim not set

**Files Changed:**
- `firestore.rules`
- `functions/src/index.ts` (syncUserRole function)

---

### RC-002: CORS Whitelist Implementation
**Type:** Security
**Priority:** P0 - Critical
**Status:** Completed
**Story Points:** 2

**Description:**
Cloud Functions API was accepting requests from any origin, creating security vulnerability. Need to restrict CORS to only authorized production domains and localhost for development.

**Acceptance Criteria:**
- [x] Implement CORS origin whitelist
- [x] Add all 5 production domains to whitelist
- [x] Include localhost:3000 for development
- [x] Reject requests from unauthorized origins
- [x] Test with authorized and unauthorized origins

**Whitelist:**
- `https://admin.royalcarriagelimo.com`
- `https://chicagoairportblackcar.com`
- `https://chicagoexecutivecarservice.com`
- `https://chicagoweddingtransportation.com`
- `https://chicago-partybus.com`
- `http://localhost:3000` (dev only)

**Files Changed:**
- `functions/src/index.ts`

---

### RC-003: Remove Emulator UI from Production Config
**Type:** Security
**Priority:** P0 - Critical
**Status:** Completed
**Story Points:** 1

**Description:**
Firebase emulator UI configuration was present in main firebase.json, potentially exposing emulator endpoints in production deployments.

**Acceptance Criteria:**
- [x] Remove emulator configuration from firebase.json
- [x] Create .firebaserc.local for local emulator config
- [x] Add .firebaserc.local to .gitignore
- [x] Document local development setup
- [x] Verify production deployment doesn't expose emulators

**Files Changed:**
- `firebase.json`
- `.firebaserc.local` (new)
- `.gitignore`

---

## P1 - High Priority Features

### RC-101: Vertex AI Image Generation Integration
**Type:** Feature
**Priority:** P1 - High
**Status:** Completed
**Story Points:** 8

**Description:**
Replace placeholder image generation with real Vertex AI Imagen integration. Enable automated generation of high-quality, contextual images for website content across all sites.

**Acceptance Criteria:**
- [x] Enable Vertex AI API in Google Cloud
- [x] Configure service account permissions
- [x] Implement Imagen API client
- [x] Support multiple image purposes (hero, service_card, fleet, location, testimonial)
- [x] Upload generated images to Firebase Storage
- [x] Store image metadata in Firestore (ai_images collection)
- [x] Add batch generation support
- [x] Implement error handling with fallback to placeholders

**API Integration:**
- Model: `imagegeneration@006`
- Storage: Firebase Storage (`ai-generated/` prefix)
- Firestore: `ai_images` collection

**Files Changed:**
- `functions/src/api/ai/image-generator.ts`

**Dependencies:**
- Google Cloud Vertex AI API enabled
- Service account with `roles/aiplatform.user`
- Firebase Storage configured

---

### RC-102: Scheduled SEO Analysis Functions
**Type:** Feature
**Priority:** P1 - High
**Status:** Completed
**Story Points:** 13

**Description:**
Implement automated scheduled functions for continuous SEO monitoring and reporting. Enable proactive identification of SEO issues and automated weekly reporting.

**Acceptance Criteria:**
- [x] Daily page analysis (2 AM Chicago time)
  - Fetch all pages from Firestore
  - Analyze each with Gemini
  - Generate SEO score (0-100)
  - Store results in page_analyses collection
  - Create alerts for low scores (<50)
- [x] Weekly SEO report (Monday 9 AM)
  - Aggregate past 7 days of analyses
  - Calculate average score
  - Identify top 10 and bottom 10 pages
  - Find most common issues
  - Store report in reports collection
- [x] Auto-analyze new pages (onCreate trigger)
  - Immediate analysis on page creation
  - Store results with 'auto_on_create' type

**Scheduled Functions:**
1. `dailyPageAnalysis` - Cron: `0 2 * * *`
2. `weeklySeoReport` - Cron: `0 9 * * 1`
3. `autoAnalyzeNewPage` - Firestore trigger: `settings/master_spec/pages/{pageId}`

**Firestore Collections:**
- `page_analyses` - Individual page analysis results
- `reports` - Aggregated weekly reports and alerts

**Files Changed:**
- `functions/src/index.ts`

**Dependencies:**
- Gemini AI client initialized
- Pages stored in `settings/master_spec/pages`

---

### RC-103: CSV Import Pipeline
**Type:** Feature
**Priority:** P1 - High
**Status:** Completed
**Story Points:** 13

**Description:**
Build comprehensive CSV import system for Moovs trip data and advertising metrics. Enable business data integration with validation, idempotency, and audit trails.

**Acceptance Criteria:**
- [x] Moovs trip import
  - CSV parsing with auto-delimiter detection
  - Column mapping (flexible field names)
  - Data validation (required fields, formats)
  - Duplicate detection by tripId
  - Store in `trips` collection
- [x] Ads metrics import
  - CSV parsing with auto-delimiter detection
  - Column mapping (multiple platform formats)
  - Data validation (numeric ranges, platform enum)
  - Automatic metric calculation (CTR, CPC, CPA, ROAS)
  - Duplicate detection by metricId
  - Store in `metrics` collection
- [x] Import audit trail
  - Track all imports in `imports` collection
  - Record success/failure statistics
  - Log validation errors by row
  - Track duplicate skips
- [x] Admin UI integration
  - File upload interface
  - Real-time import status
  - Error reporting
  - Import history

**API Endpoints:**
- `POST /api/imports/moovs` - Import Moovs data
- `POST /api/imports/ads` - Import ads metrics
- `GET /api/imports/:importId` - Get import status
- `GET /api/imports` - List all imports

**Firestore Collections:**
- `trips` - Moovs trip records
- `metrics` - Advertising metrics
- `imports` - Import audit records

**Files Created:**
- `functions/src/lib/csv-parser.ts`
- `functions/src/lib/moovs-schema.ts`
- `functions/src/lib/ads-schema.ts`
- `functions/src/api/routes/imports.ts`

**Files Changed:**
- `functions/src/api/routes.ts` - Route registration
- `functions/package.json` - Added csv-parse dependency
- `apps/admin/src/react/AdminApp.tsx` - UI integration

**Dependencies:**
- `csv-parse` npm package
- Firebase Admin SDK
- Admin app with editor role

---

## P2 - Medium Priority

### RC-201: Content Generation Enhancements
**Type:** Enhancement
**Priority:** P2 - Medium
**Status:** Not Started
**Story Points:** 8

**Description:**
Enhance existing content generation functions with better templates, multi-language support, and SEO optimization.

**Acceptance Criteria:**
- [ ] Add location-specific FAQ templates
- [ ] Implement multilingual content generation
- [ ] Add SEO keyword optimization
- [ ] Create A/B testing variants
- [ ] Implement content versioning

**Dependencies:**
- RC-102 (scheduled functions)
- Gemini AI client

---

### RC-202: Image Optimization Pipeline
**Type:** Enhancement
**Priority:** P2 - Medium
**Status:** Not Started
**Story Points:** 5

**Description:**
Add automatic image optimization for web delivery (compression, format conversion, responsive sizes).

**Acceptance Criteria:**
- [ ] Implement WebP conversion
- [ ] Generate responsive image sizes
- [ ] Add lazy loading support
- [ ] Implement CDN caching headers
- [ ] Create image audit report

**Dependencies:**
- RC-101 (image generation)
- Firebase Storage configured

---

### RC-203: ROI Dashboard Enhancements
**Type:** Feature
**Priority:** P2 - Medium
**Status:** Not Started
**Story Points:** 8

**Description:**
Enhance ROI dashboard with advanced analytics, trend visualization, and forecasting.

**Acceptance Criteria:**
- [ ] Add time-series trend charts
- [ ] Implement cohort analysis
- [ ] Add forecasting models
- [ ] Create custom date ranges
- [ ] Export to CSV/PDF

**Dependencies:**
- RC-103 (import pipeline)
- Metrics data populated

---

## Dependencies Graph

```
RC-001 (Firestore Rules) → All other tickets (security foundation)
RC-002 (CORS) → All API features (security foundation)
RC-003 (Emulator) → Development workflow

RC-101 (Image Gen) → RC-202 (Image Optimization)
RC-102 (Scheduled) → RC-201 (Content Enhancement)
RC-103 (Import) → RC-203 (ROI Dashboard)
```

---

## Story Point Reference

- **1-2 points:** Simple change, < 1 hour, single file
- **3-5 points:** Moderate complexity, 2-4 hours, multiple files
- **8 points:** Complex feature, 1 day, new systems
- **13 points:** Major feature, 2-3 days, multiple integrations
- **21 points:** Epic, needs breakdown

---

## Status Definitions

- **Not Started:** Ticket created, not yet in progress
- **In Progress:** Actively being worked on
- **Completed:** Implementation done, tested, deployed
- **Blocked:** Waiting on dependency or external factor
- **Cancelled:** No longer needed
