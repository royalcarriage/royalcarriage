# Repository Audit Report — Royal Carriage Limousine SEO System
**Audit Date:** January 15, 2026  
**Repository:** royalcarriage/royalcarriage  
**Branch:** copilot/build-seo-ads-analytics-system  
**Firebase Project:** royalcarriagelimoseo

---

## Executive Summary

This is a monorepo containing:
1. **Primary Website** - React + Vite SPA for Chicago Airport Black Car (chicagoairportblackcar.com)
2. **Admin Dashboard** - Next.js static export app (royalcarriagelimoseo.web.app)
3. **Express Backend** - API server with AI capabilities (Google Vertex AI)
4. **Firebase Functions** - Serverless automation (scheduled tasks)

**Current Status:**
- ✅ Build system OPERATIONAL (fixed vite.config.ts)
- ✅ Dependencies installed (670 packages, 0 vulnerabilities)
- ✅ Smoke tests PASSING
- ⚠️ Only 1 of 4 target websites exists in this repo
- ⚠️ No SEO content generation system implemented
- ⚠️ No Moovs/Ads data pipeline exists
- ⚠️ No multi-domain Firebase hosting configuration

---

## Repository Structure

```
royalcarriage/
├── client/              # React frontend (PRIMARY SITE ONLY)
│   ├── src/
│   │   ├── pages/       # SPA pages (Home, O'Hare, Midway, Cities, etc.)
│   │   └── components/  # Reusable UI components (Hero, CTASection, etc.)
│   └── public/assets/   # Images, fonts, static files
├── apps/
│   └── admin/           # Next.js admin dashboard (SINGLE CONFIG FILE ONLY)
│       └── next.config.js
├── server/              # Express.js backend
│   ├── index.ts         # Main entry point
│   ├── routes.ts        # API routes
│   ├── ai/              # AI services (page-analyzer, content-generator, image-generator)
│   ├── security.ts      # CORS & security headers
│   └── storage.ts       # File utilities
├── functions/           # Firebase Functions (scheduled tasks)
├── shared/              # Shared types & DB schema (Drizzle ORM)
├── script/              # Build & test scripts
│   ├── build.ts         # Production build (client + server)
│   └── smoke-test.sh    # Post-build verification
├── docs/                # Extensive existing documentation
├── .github/workflows/   # CI/CD pipelines
│   ├── firebase-deploy.yml    # Main deployment workflow
│   └── deploy-admin.yml       # Admin app deployment
├── firebase.json        # Firebase hosting config (SINGLE SITE ONLY)
├── .firebaserc          # Project: royalcarriagelimoseo
├── package.json         # Root package (not a workspace)
└── vite.config.ts       # Vite build config (FIXED)
```

---

## Target Websites Analysis

### Expected 4-Site System:
1. **chicagoairportblackcar.com** ✅ EXISTS (primary site in `/client`)
2. **chicago-partybus.com** ❌ NOT FOUND
3. **chicagoexecutivecarservice.com** ❌ NOT FOUND
4. **chicagoweddingtransportation.com** ❌ NOT FOUND

### Current Reality:
- Only 1 site exists (airport/black car)
- No multi-site structure detected
- No separate build targets per domain
- Firebase hosting configured for single domain only

### Admin App Status:
- **Expected:** Full Next.js admin dashboard at royalcarriagelimoseo.web.app
- **Actual:** Only `apps/admin/next.config.js` exists (56 lines)
- **Location:** Admin UI exists in `/client/src/pages/admin/` (React SPA, not Next.js)
- **Confusion:** Repo shows both approaches (Next.js config + React admin pages)

---

## Build System & Commands

### Available npm Scripts:
```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "tsx script/build.ts",
  "start": "NODE_ENV=production node dist/index.cjs",
  "check": "tsc",
  "test": "bash script/smoke-test.sh",
  "db:push": "drizzle-kit push"
}
```

### Build Process:
1. **Client Build** (`vite build`)
   - Input: `client/index.html` + `client/src/`
   - Output: `dist/public/` (static assets for Firebase Hosting)
   - Chunks: react-vendor, query-vendor, ui-vendor
   - Size: ~292 KB (main), ~146 KB (react), ~25 KB (query)

2. **Server Build** (`esbuild`)
   - Input: `server/index.ts`
   - Output: `dist/index.cjs` (~849 KB)
   - Format: CommonJS bundle

### Build Issues Discovered:
- ✅ **FIXED:** vite.config.ts used undefined `isDev` variable → now uses `mode` parameter
- ✅ **VERIFIED:** All smoke tests pass
- ⚠️ **WARNING:** Large image assets (1.5-1.8 MB PNGs) in build output

---

## Firebase Hosting Configuration

### Current Setup (firebase.json):
```json
{
  "hosting": {
    "public": "dist/public",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "functions": { "source": "functions", "runtime": "nodejs20" },
  "firestore": { "rules": "firestore.rules" }
}
```

**Problem:** No multi-site hosting configuration. Expected:
```json
{
  "hosting": [
    { "target": "airport", "public": "dist/airport", ... },
    { "target": "partybus", "public": "dist/partybus", ... },
    { "target": "executive", "public": "dist/executive", ... },
    { "target": "wedding", "public": "dist/wedding", ... },
    { "target": "admin", "public": "apps/admin/out", ... }
  ]
}
```

### Domain Mapping Status:
- No evidence of multi-domain Firebase hosting targets
- Would require `firebase target:apply hosting <name> <resource>` commands
- `.firebaserc` only references single project: `royalcarriagelimoseo`

---

## Framework & Technology Stack

### Frontend:
- **React** 18.3.1 (stable)
- **Vite** 7.3.1 (latest)
- **TypeScript** 5.6.3
- **Routing:** Wouter 3.3.5 (client-side SPA router)
- **UI:** Radix UI + Tailwind CSS + shadcn/ui components
- **State:** TanStack React Query 5.60.5
- **Icons:** Lucide React

### Backend:
- **Express.js** 4.21.2
- **Database:** PostgreSQL + Drizzle ORM 0.39.3
- **Session:** express-session + memorystore
- **AI:** Google Vertex AI (@google-cloud/vertexai 1.10.0)
- **Authentication:** Passport.js (local strategy)

### Firebase:
- **Hosting** (static site delivery)
- **Functions** (Node.js 20 runtime)
- **Firestore** (rules + indexes configured)
- **Admin SDK** 13.6.0

### Build Tools:
- **Vite** (client bundler)
- **esbuild** 0.25.0 (server bundler)
- **tsx** 4.20.5 (TypeScript executor)
- **TypeScript** 5.6.3

---

## Existing Scripts (script/ directory)

### 1. build.ts (Production Build)
**Path:** `/home/runner/work/royalcarriage/royalcarriage/script/build.ts`

**What it does:**
- Builds client with Vite → `dist/public/`
- Builds server with esbuild → `dist/index.cjs`
- Runs sequentially (client first, then server)

**Issues:**
- No multi-site build logic
- No site-specific output directories
- Hardcoded paths

### 2. smoke-test.sh (Build Verification)
**Path:** `/home/runner/work/royalcarriage/royalcarriage/script/smoke-test.sh`

**What it does:**
- Checks `dist/public/index.html` exists
- Checks `dist/index.cjs` exists
- Verifies assets directory, CSS/JS files
- Validates HTML has `<div id="root">`
- Checks file sizes

**Status:** ✅ PASSING (all checks pass)

### Missing Scripts:
- ❌ No `verify:seo` script
- ❌ No `verify:links` script
- ❌ No `audit:images` script
- ❌ No `build-all.mjs` (multi-site builder)
- ❌ No `yolo-agent.mjs` or SEO automation
- ❌ No metrics import scripts

---

## GitHub Actions Workflows

### 1. firebase-deploy.yml
**Path:** `.github/workflows/firebase-deploy.yml`

**Jobs:**
1. **audit** - npm audit (moderate + high severity checks)
2. **build** - npm ci, tsc check, build, smoke tests
3. **deploy-production** - Deploy to Firebase on `main` branch push
4. **deploy-preview** - Deploy preview on PR

**Secrets Required:**
- `FIREBASE_SERVICE_ACCOUNT` (base64 JSON)
- `FIREBASE_PROJECT_ID` (optional, defaults to "default")

**Issues:**
- Deploys single site only
- No multi-domain deployment logic
- No scheduled automation triggers

### 2. deploy-admin.yml
**Path:** `.github/workflows/deploy-admin.yml`

**Purpose:** Deploy admin dashboard separately

**Issue:** Admin app is incomplete (only config file exists)

### Missing Workflows:
- ❌ No `nightly-metrics.yml` (daily data import)
- ❌ No `biweekly-seo-propose.yml` (content proposals)
- ❌ No `weekly-quality.yml` (scheduled audits)

---

## Environment Variables & Secrets

### Detected in Code:
```typescript
// client/src/pages/Home.tsx (and others)
const PHONE_TEL = "tel:+12248013090";
const PHONE_DISPLAY = "(224) 801-3090";
const BOOKING_URL = "https://customer.moovs.app/royal-carriage-limousine/new/info...";
```

### Expected (not configured):
- `GA4_MEASUREMENT_ID` = G-CC67CH86JR
- `LLM_PROVIDER` (gemini|anthropic|openai)
- `LLM_API_KEY`
- `GOOGLE_ADS_API_KEY` (optional)
- `GOOGLE_SEARCH_CONSOLE_KEY` (optional)

### .env.example Status:
- ✅ EXISTS at `/home/runner/work/royalcarriage/royalcarriage/.env.example`
- Needs update for SEO system variables

---

## Existing Pages in Primary Site

### Static Routes (client/src/pages/):
1. `/` - Home.tsx ✅
2. `/ohare-airport-limo` - OHareAirport.tsx ✅
3. `/midway-airport-limo` - MidwayAirport.tsx ✅
4. `/airport-limo-downtown-chicago` - DowntownChicago.tsx ✅
5. `/airport-limo-suburbs` - SuburbsService.tsx ✅
6. `/fleet` - Fleet.tsx ✅
7. `/pricing` - Pricing.tsx ✅
8. `/about` - About.tsx ✅
9. `/contact` - Contact.tsx ✅

### Dynamic Routes:
10. `/city/:slug` - CityPage.tsx ✅ (renders city-specific landing pages)

### Admin Pages:
11. `/admin` - AdminDashboard.tsx ✅
12. `/admin/page-analyzer` - PageAnalyzer.tsx ✅

**Total Pages:** 12 (9 static + 1 dynamic template + 2 admin)

**Missing:**
- No party bus pages
- No executive/corporate pages
- No wedding pages
- No generated SEO pages (no `/generated/` directory)

---

## Page Quality Analysis (Primary Site)

### CTA Implementation:
- ✅ All pages use consistent `PHONE_TEL` and `BOOKING_URL` constants
- ✅ UTM parameters present: `?utm_source=airport&utm_medium=seo&utm_campaign=microsites`
- ✅ Dual CTA pattern: "Call (224) 801-3090" + "Book Online" buttons
- ✅ Uses Moovs booking portal as specified

### Hero Sections:
- ✅ Hero component used consistently
- ✅ Background images from `@assets/generated_images/`
- ⚠️ Hero images are HUGE (1.5-1.8 MB PNGs) → should be WebP or optimized

### SEO Components:
- ✅ `<SEO>` component used on all pages
- ✅ Custom title, description, canonical per page
- ⚠️ No JSON-LD structured data detected in pages
- ⚠️ No Open Graph image tags
- ⚠️ No Twitter Card meta tags

### FAQ Sections:
- ✅ Home page has 10 FAQ items (accordion UI)
- ✅ Service pages have relevant FAQs
- ⚠️ No FAQ schema markup (should add)

---

## AI System (Existing)

### Server AI Routes (server/ai/):
1. **page-analyzer.ts** - SEO scoring system
   - Analyzes title, meta, headings, keywords
   - Provides improvement suggestions
   - No Google policy compliance checks

2. **content-generator.ts** - AI content creation
   - Uses Google Vertex AI (Gemini)
   - Generates page content + schema
   - Has safety filters

3. **image-generator.ts** - AI image generation
   - Imagen 3 integration
   - Creates vehicle/location images
   - No manifest system

### API Endpoints (server/ai/routes.ts):
- `POST /api/ai/analyze-page` ✅
- `POST /api/ai/generate-content` ✅
- `POST /api/ai/generate-image` ✅
- `POST /api/ai/batch-analyze` ✅
- `GET /api/ai/health` ✅

### Admin UI (client/src/pages/admin/):
- **AdminDashboard.tsx** - Overview + controls
- **PageAnalyzer.tsx** - SEO analysis UI

**Problem:** AI system exists but NOT integrated with:
- No file-based content queue
- No draft → ready → published workflow
- No quality gates
- No PR-based publishing
- No profit-first prioritization

---

## Database Schema (Drizzle ORM)

**Location:** `shared/db/schema.ts` (assumed, not verified)

**Usage:** PostgreSQL connection configured

**Issue:** No evidence of SEO content tables:
- No `topics` table
- No `drafts` table
- No `published_pages` table
- No `image_manifests` table

---

## Documentation (docs/ directory)

### Existing Documents:
1. **REPO_AUDIT.md** (previous audit, Jan 12, 2026)
2. **DEVELOPER_GUIDE.md** - Comprehensive dev setup
3. **AI_SYSTEM_GUIDE.md** - AI features documentation
4. **DEPLOYMENT_GUIDE.md** - Firebase deployment steps
5. **CICD_WORKFLOW.md** - GitHub Actions guide
6. **PRE_DEPLOYMENT_AUDIT.md** - Security checklist
7. **SECURITY_DEPLOYMENT_COMPLETE.md** - Security implementation summary

**Quality:** Very thorough, professional documentation

**Missing:**
- No MASTER_ROADMAP.md
- No SEO content strategy document
- No multi-site architecture plan
- No ROI/metrics analysis guide

---

## Security Analysis

### Good Practices:
- ✅ No hardcoded secrets
- ✅ `.gitignore` excludes `.env`, `node_modules`, `dist`
- ✅ CORS configured in `server/security.ts`
- ✅ CSP headers implemented
- ✅ npm audit: 0 vulnerabilities

### Concerns:
- ⚠️ AI generation without spam/thin-page checks
- ⚠️ No duplicate content detection
- ⚠️ No semantic similarity threshold
- ⚠️ No publish rate limiting
- ⚠️ Admin auth not visible (may be in Firestore rules)

---

## Missing Infrastructure (Required for Task)

### Data Pipelines:
- ❌ `/data/google-ads/` (empty, needs READMEs)
- ❌ `/data/moovs/` (empty, needs READMEs)
- ❌ `/data/keyword-research/` (empty, needs READMEs)
- ❌ No CSV import scripts
- ❌ No metrics processing

### SEO Content System:
- ❌ `/packages/content/seo-bot/` (doesn't exist)
- ❌ No `queue/topics.json`
- ❌ No `drafts/*.json`
- ❌ No `published/*.json`
- ❌ No Zod schemas for content types

### Scripts:
- ❌ `scripts/metrics-import.mjs`
- ❌ `scripts/seo-propose.mjs`
- ❌ `scripts/seo-draft.mjs`
- ❌ `scripts/seo-generate.mjs`
- ❌ `scripts/seo-quality-gate.mjs`
- ❌ `scripts/seo-publish.mjs`
- ❌ `scripts/seo-run.mjs`

### Image System:
- ❌ No image manifests
- ❌ No missing image reports
- ❌ No naming conventions enforced
- ❌ No sourceType tracking (owned|licensed|ai)

### Multi-Site:
- ❌ No party bus site
- ❌ No executive car site
- ❌ No wedding site
- ❌ No multi-domain Firebase config

---

## Remediation Steps (Priority Order)

### Critical (Do First):
1. Create data folder structure + READMEs
2. Implement `scripts/metrics-import.mjs` (resilient, no data required)
3. Create `/packages/content/` structure
4. Generate profit model defaults
5. Write MASTER_ROADMAP.md

### High Priority (Phase 1):
6. Create SEO content Zod schemas
7. Implement quality gate script
8. Add JSON-LD schema to existing pages
9. Optimize hero images (convert to WebP)
10. Add FAQ schema markup

### Medium Priority (Phase 2):
11. Build multi-site architecture plan
12. Create GitHub Actions for scheduled tasks
13. Implement SEO propose/draft/generate scripts
14. Build image manifest system
15. Add duplicate content detection

### Low Priority (Later):
16. Scaffold party bus site
17. Scaffold executive car site
18. Scaffold wedding site
19. Implement full admin dashboard (Next.js)
20. Add Google Ads/Analytics API integrations

---

## Build Verification Results

**Command:** `npm run build`  
**Duration:** 3.62s (client) + 89ms (server)  
**Status:** ✅ SUCCESS

**Output:**
```
dist/public/
  index.html (3.27 KB)
  assets/
    *.css (7.23 KB)
    *.js (471 KB total: 293 + 146 + 25 + 8)
    *.jpg (138 KB)
    *.png (5.2 MB - NEEDS OPTIMIZATION)
dist/index.cjs (849 KB)
```

**Test Results:** ✅ All smoke tests passed

---

## Conclusion & Recommendations

### What Works:
- Single-site build system is functional
- AI page analyzer + content generator exist
- Good documentation foundation
- Clean, modern tech stack
- Professional UI components

### What's Missing:
- 3 of 4 target websites (75% of money system)
- Entire ROI/metrics pipeline (0% built)
- SEO content automation system (0% built)
- Multi-domain Firebase hosting (0% configured)
- Quality gates & Google compliance checks (0% built)

### Next Steps:
1. **DO NOT** build all 4 sites yet (scope creep)
2. **DO** build intelligence layer first (metrics, ROI, keywords)
3. **DO** create scaffolding + reports (this phase)
4. **DO** write MASTER_ROADMAP for prioritized execution
5. **DO** implement quality gates before mass content generation

### Estimated State:
- **Infrastructure:** 30% complete (build works, but single-site only)
- **Data Pipeline:** 0% complete
- **SEO Automation:** 10% complete (AI exists, but no workflow)
- **Multi-Site System:** 0% complete
- **Compliance:** 40% complete (some safeguards, but no hard gates)

---

**Audit Completed:** January 15, 2026  
**Auditor:** GitHub Copilot Agent  
**Next Report:** `/reports/site-ux-audit.md`
