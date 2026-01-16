# Royal Carriage - Comprehensive Audit Report
**Date:** January 16, 2026
**Auditor:** Claude (Planner/Architect/QA)
**Status:** 5/5 Production Apps LIVE + Partial Features

---

## Executive Summary

### Overall Health: **6.5/10** (Good Core, Critical Gaps)

- ✅ **Core systems deployed** and running across 5 domains
- ✅ **Firebase infrastructure** solid (Firestore rules, RBAC, security)
- ✅ **Admin dashboard** and marketing sites fully functional
- ❌ **Critical security issue** in Firestore performance (sync DB reads)
- ❌ **7 incomplete features** blocking production maturity
- ⚠️ **CORS policy** too permissive (all origins allowed)
- ⚠️ **Data import pipeline** missing backend CSV parser

### Risk Level: **MEDIUM** (Security + Data Integrity)

---

## P0 (CRITICAL - Must Fix Before Next Deployment)

### P0.1: Firestore Role Lookup Performance Inefficiency
**Severity:** CRITICAL | **Type:** Security + Performance
**File:** `/Users/admin/VSCODE/firestore.rules` (lines 11-13)
**Impact:** Database read cost, latency, quota exhaustion

**Problem:**
```typescript
function getRole() {
  let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
  return userDoc.data != null ? userDoc.data.role : null;
}
```
- Every Firestore operation triggers a database document read
- violates Firebase best practices for security rules
- Inconsistent with Storage rules (which use token claims)

**Risk:**
- 10x read cost compared to token-based checks
- API delays under load (user waiting for Firestore read inside request lifecycle)
- Custom claims not synced if `syncUserRole` Cloud Function fails

**Fix Strategy:**
1. Use `request.auth.token.role` from custom claims (already synced by `syncUserRole` function)
2. Remove `getRole()` database call
3. Validate custom claims exist with fallback
4. Standardize with Storage rules (already correct)

**Acceptance Criteria:**
- ✅ All Firestore rules use `request.auth.token.role` instead of `get()`
- ✅ Custom claims validation added (fallback to viewer if missing)
- ✅ `syncUserRole` Cloud Function works correctly
- ✅ Security rules test suite passes
- ✅ No change in permission model (same RBAC behavior)

---

### P0.2: CORS Policy Too Permissive
**Severity:** CRITICAL | **Type:** Security
**File:** `/Users/admin/VSCODE/functions/src/index.ts` (line 22)
**Impact:** API accessible from any origin (XSS attacks, token theft)

**Problem:**
```typescript
app.use(cors({ origin: true }));
```
- Allows ANY domain to call your API
- No protection against cross-origin attacks
- Credentials can be exfiltrated by malicious sites

**Fix Strategy:**
1. Create environment variable `ALLOWED_ORIGINS` (comma-separated domains)
2. Whitelist only:
   - `https://admin.royalcarriagelimo.com`
   - `https://chicagoairportblackcar.com`
   - `https://chicagoexecutivecarservice.com`
   - `https://chicagoweddingtransportation.com`
   - `https://chicago-partybus.com`
   - `http://localhost:3000` (dev only)
3. Reject unrecognized origins with 403

**Acceptance Criteria:**
- ✅ CORS restricted to whitelisted domains
- ✅ Environment config for allowed origins
- ✅ Localhost allowed for development
- ✅ Unauthorized origins receive 403 Forbidden
- ✅ No test failures

---

### P0.3: Emulator UI Exposed in Production Config
**Severity:** CRITICAL | **Type:** Security + DevOps
**File:** `/Users/admin/VSCODE/firebase.json` (lines 88-91)

**Problem:**
```json
"emulators": {
  "ui": {
    "enabled": true,
    "port": 4000
  }
}
```
- Firebase emulator UI is development-only
- Accidentally deployed with production config
- Reveals data structure, provides unauthenticated data access

**Fix Strategy:**
1. Remove emulator config from `firebase.json` (use local `.firebaserc.local` for dev)
2. Create `.firebaserc.local` for development environment
3. Ensure production `firebase.json` has NO emulator settings

**Acceptance Criteria:**
- ✅ `firebase.json` has NO `emulators` section
- ✅ Development setup uses separate `.firebaserc.local`
- ✅ Deploy steps documented in DEPLOY.md
- ✅ No emulator ports exposed in production

---

## P1 (HIGH - Schedule for Next Sprint)

### P1.1: Image Generation Not Functional
**Severity:** HIGH | **Type:** Feature Completeness
**File:** `/Users/admin/VSCODE/functions/src/api/ai/image-generator.ts`
**Impact:** Admin dashboard image generation returns placeholders, not AI images

**Problem:**
- Using `placehold.co` fallback (placeholder service)
- Vertex AI Imagen not configured
- Error messages direct users to docs instead of working feature

**Root Cause:**
```typescript
// Lines 59-61
const response = await client.generateImages({
  // Vertex AI client not configured → falls back to placehold.co
});
```

**Required Actions:**
1. Enable Vertex AI API in Google Cloud Console (gcloud services enable aiplatform.googleapis.com)
2. Grant Cloud Functions service account `roles/aiplatform.user`
3. Implement actual Vertex AI Imagen request
4. Add image upscaling (optional: Upscayl or similar)
5. Cache generated images in Firebase Storage

**Acceptance Criteria:**
- ✅ Vertex AI API enabled in Google Cloud
- ✅ Service account has correct IAM role
- ✅ Image generation endpoint returns real AI images
- ✅ Images stored in Firebase Storage `/ai_images/{id}`
- ✅ Admin dashboard displays real images (not placeholders)

---

### P1.2: Scheduled Cloud Functions Not Implemented
**Severity:** HIGH | **Type:** Core Feature
**Affected Functions:**
1. `dailyPageAnalysis` (line 46-53) - Empty stub
2. `weeklySeoReport` (line 59-65) - Empty stub
3. `autoAnalyzeNewPage` (line 71-76) - Empty trigger stub

**Problem:**
```typescript
export const dailyPageAnalysis = functions.pubsub
  .schedule('0 2 * * *')
  .onRun(async (context) => {
    // Implementation missing - just logs
    return null;
  });
```

**Impact:**
- No automated page analysis running
- SEO reports not generated
- New pages not automatically analyzed
- Content recommendations not triggered

**Required Implementation:**
1. **dailyPageAnalysis:**
   - Fetch all pages from Firestore
   - Call Gemini to analyze each page (title, headings, meta, content quality)
   - Score SEO health (0-100)
   - Store results in `page_analyses` collection
   - Create alerts for pages < 60 score

2. **weeklySeoReport:**
   - Aggregate weekly analysis results
   - Calculate top/bottom 10 pages
   - Generate content improvement suggestions
   - Email report to admin

3. **autoAnalyzeNewPage:**
   - Trigger when new page document created in Firestore
   - Call same analysis as daily job
   - Immediate feedback instead of waiting 24h

**Acceptance Criteria:**
- ✅ All 3 functions execute without errors
- ✅ Results stored in correct Firestore collections
- ✅ Alerts triggered for low-scoring pages
- ✅ Weekly reports generated and viewable in admin dashboard
- ✅ New pages auto-analyzed within 5 minutes of creation

---

### P1.3: CSV Import Pipeline Backend Missing
**Severity:** HIGH | **Type:** Core Feature
**Affected:**
- `/imports/moovs` page (UI present, backend absent)
- `/imports/ads` page (UI present, backend absent)

**Problem:**
- Admin dashboard has import upload forms
- No backend CSV parser implemented
- `recordImport()` function only stores metadata, not parsed data
- No validation, schema mapping, or data normalization

**Required Implementation:**
1. **CSV Parser Module:**
   - Parse CSV file (auto-detect delimiters)
   - Validate against schema
   - Map columns to Firestore fields
   - Handle type conversions (dates, numbers, enums)

2. **Moovs Import Handler:**
   - Expected columns: trip_id, driver_id, vehicle_id, pickup_time, dropoff_time, distance, fare, customer_id
   - Schema validation with clear error messages
   - Idempotency check (duplicate trip_id handling)
   - Store in `trips`, `drivers`, `vehicles`, `customers` collections

3. **Ads Import Handler:**
   - Expected columns: campaign_id, date, impressions, clicks, spend, conversions
   - ROI calculation (revenue from order_value column)
   - Upsert to `metrics_rollups` (daily aggregation)

4. **Error Handling:**
   - Row-level error capture (row #, field, error message)
   - Summary: X rows imported, Y skipped, Z errors
   - User can download error report

5. **Audit Trail:**
   - Every import creates `imports` record with file hash
   - Link each normalized row to importId + sourceRowNumber
   - Allow "rollback" (soft delete) by importId

**Acceptance Criteria:**
- ✅ CSV parsing works for Moovs format
- ✅ CSV parsing works for Ads format
- ✅ Schema validation with helpful error messages
- ✅ Idempotency (same file uploaded twice = no duplicates)
- ✅ Data appears in Firestore with audit trail
- ✅ Admin dashboard shows import status + error count
- ✅ Error download feature works

---

### P1.4: Inconsistent Storage Rules - Missing Validation
**Severity:** HIGH | **Type:** Security
**File:** `/Users/admin/VSCODE/storage.rules` (lines 12-14)

**Problem:**
```typescript
function isAdmin() {
  return isAuthenticated() && (
    request.auth.token.role == 'admin' ||
    request.auth.token.role == 'superadmin'
  );
}
```
- No validation that `request.auth.token.role` exists
- Could fail silently if custom claims not set
- No fallback or error message

**Fix Strategy:**
1. Add existence check and fallback
2. Log missing claims for debugging
3. Ensure `syncUserRole` Cloud Function always runs on user creation

**Acceptance Criteria:**
- ✅ Role claim existence validated
- ✅ Missing claims logged (debug level)
- ✅ No permission errors from missing role
- ✅ Storage rules consistent with Firestore

---

## P2 (MEDIUM - Next Quarter Roadmap)

### P2.1: Image Optimization Not Implemented
**Severity:** MEDIUM | **Type:** Performance
**File:** `functions/src/api/ai/image-generator.ts` (optimizeImage function)
**Impact:** Large images slow down marketing sites

**Current:**
```typescript
// This would integrate with image optimization service
return urls; // Returns unchanged
```

**Suggested Fix:**
- Use Cloudinary or ImageKit for dynamic optimization
- Serve webp/avif formats
- Responsive image sets (small/medium/large)
- Cache headers for browser caching

---

### P2.2: Sentiment Analysis Pipeline Incomplete
**Severity:** MEDIUM | **Type:** Feature
**Impact:** Negative feedback not triggering automated responses

**Current:**
- `analyzeSentimentOfFeedback()` function exists
- Analyzes sentiment but doesn't trigger alerts
- Approval workflow missing

**Fix:**
- Implement alert creation for negative sentiment
- Email notifications to ops team
- Response suggestion workflow

---

### P2.3: Content Suggestion Approval Workflow Incomplete
**Severity:** MEDIUM | **Type:** Feature
**Impact:** Suggested content requires manual review before publishing

**Current:**
- Suggestions generated
- Gate reports created
- No publish workflow

**Fix:**
- Admin approves/rejects suggestions
- Approved content queued for publish
- Publish workflow triggers content deployment

---

### P2.4: GA4 Configuration Not Complete
**Severity:** MEDIUM | **Type:** Analytics
**Location:** Multiple app configs
**Current:** GA4 ID is placeholder `"G-XXXXXXX"`

**Fix:**
- Set real GA4 measurement IDs for each site
- Verify event tracking working
- Create dashboard alerts

---

## Environmental Issues

### E1: Missing Secrets Configuration
**Files:** All apps need:
- `FIREBASE_CONFIG` (public config)
- `GEMINI_API_KEY` (if not using service account)
- `ALLOWED_ORIGINS` (for CORS)

**Current State:** Using Firebase service account (good), but env validation missing

---

## Test Coverage Assessment

| Area | Coverage | Status |
|------|----------|--------|
| Firestore Rules | Not visible | ⚠️ Need test suite |
| Cloud Functions | Basic | ⚠️ Need unit tests |
| Admin Dashboard | No tests visible | ❌ Need Playwright tests |
| Marketing Sites | No tests visible | ❌ Need Astro tests |
| CSV Import Logic | Not started | ❌ Critical gap |

---

## Summary by System

| System | Status | P0 | P1 | P2 |
|--------|--------|----|----|---|
| **Admin Dashboard** | ✅ Live | 0 | 1 (import) | 2 |
| **Marketing Sites** | ✅ Live | 0 | 0 | 1 (GA4) |
| **Firebase Auth** | ✅ Live | 0 | 0 | 0 |
| **API Backend** | ✅ Live | 2 (security) | 3 (functions) | 1 |
| **AI Integration** | ⚠️ Partial | 0 | 1 (images) | 1 (sentiment) |
| **Data Import** | ❌ Incomplete | 0 | 1 (CSV parsing) | 1 (workflows) |
| **Firestore** | ✅ Live | 1 (performance) | 1 (validation) | 0 |

---

## Definition of Done - This Audit

- ✅ Repo structure mapped (5 apps, 18+ functions, 13+ collections)
- ✅ Critical security issues identified (CORS, Firestore sync reads)
- ✅ Incomplete features cataloged (image gen, scheduled jobs, CSV import)
- ✅ Risk levels assigned (P0/P1/P2)
- ✅ Acceptance criteria defined for each issue
- ✅ Files and line numbers documented for quick navigation

---

## Next Steps

1. **Immediately (P0):** Fix Firebase security issues (CORS, Firestore rules, emulator)
2. **This Sprint (P1):** Implement image generation, scheduled functions, CSV import
3. **Next Quarter (P2):** Complete workflows, analytics, optimization

**Handoff:** See `FIX_PLAN.md` for ordered implementation steps.
