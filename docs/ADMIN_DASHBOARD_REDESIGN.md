# Admin Dashboard Redesign & Integration Plan

**Created:** January 15, 2026  
**Status:** Phase 1 Complete, Admin Dashboard Redesign in Progress  
**Purpose:** Integrate ROI intelligence layer with existing AI system and create unified control center

---

## Executive Summary

The admin dashboard needs to be redesigned to integrate:

1. **Existing AI System** (page analyzer, content generator, image generator)
2. **New ROI Intelligence Layer** (metrics import, keyword clustering, profit model)
3. **Phase 1 Improvements** (GA4, trust signals, pricing anchors)
4. **Future Multi-Site Management** (4 domains)

**Current State:**

- ✅ Basic admin dashboard exists with AI tools
- ✅ Page analyzer working (SEO scoring)
- ✅ Content generator (Vertex AI Gemini)
- ✅ Image generator (Imagen)
- ✅ Firebase Functions (scheduled tasks)
- ✅ ROI intelligence scaffolded (metrics import script)
- ⚠️ No integration between AI and ROI systems
- ⚠️ Dashboard UX needs improvement (accordion sidebar, compact layout)
- ⚠️ No content approval workflow
- ⚠️ No multi-site controls

---

## Other Agents' Work Review

### 1. AI System Agent (Previous)

**What They Built:**

- `server/ai/page-analyzer.ts` - SEO scoring (0-100)
  - Analyzes H1/H2/H3 structure
  - Keyword density calculation
  - Readability scoring (Flesch)
  - Location-specific optimization
  - Content length validation
- `server/ai/content-generator.ts` - Vertex AI integration
  - Gemini Pro for content generation
  - Template fallback system
  - Location & vehicle-specific content
  - Meta tag optimization
- `server/ai/image-generator.ts` - Imagen integration
  - Hero images, service cards, fleet showcases
  - Prompt engineering templates
  - Placeholder support
- `server/ai/routes.ts` - 9 API endpoints
  - Single & batch page analysis
  - Content generation & improvement
  - Image generation & variations
  - Location & vehicle-specific APIs
- `functions/src/index.ts` - Firebase Functions
  - `dailyPageAnalysis` (2:00 AM daily)
  - `weeklySeoReport` (9:00 AM Mondays)
  - Firestore integration
- `client/src/pages/admin/` - Admin UI
  - AdminDashboard.tsx (6 tabs: Overview, Pages, AI Tools, Images, Analytics, Settings)
  - PageAnalyzer.tsx (batch analysis with scoring)

**Database Schema (Drizzle ORM):**

- users, page_analysis, content_suggestions, ai_images
- audit_logs, scheduled_jobs, ai_settings
- RBAC (user, admin, super_admin)

### 2. ROI Intelligence Agent (Current - Me)

**What I Built:**

- Comprehensive audits (64 KB findings)
  - repo-audit.md, site-ux-audit.md, tech-seo-audit.md
  - Identified conversion blockers and technical SEO gaps
- Data pipeline infrastructure
  - `scripts/metrics-import.mjs` - Resilient CSV importer
  - `/data/{google-ads, moovs, keyword-research}/` with READMEs
  - `/packages/content/profit_model.json` - Editable margins
  - Keyword clustering by intent
  - ROAS & profit proxy calculations
- Master Roadmap (41 KB)
  - 9-phase implementation plan
  - Conversion blockers prioritized
  - Google compliance checklist
  - Multi-site expansion strategy
- Phase 1 implementations
  - GA4 tracking (G-CC67CH86JR)
  - Trust signals component (⭐ 4.8/5, 15+ vehicles)
  - Differentiated hero messaging
  - Pricing anchors (sample rates)

---

## Integration Gaps

### What Needs to Connect:

1. **AI Page Analyzer** ↔ **ROI Intelligence**
   - Page analyzer scores pages but doesn't prioritize by profit
   - Need to combine SEO score with keyword profitability
   - **Solution:** Add profit_proxy field to page_analysis table

2. **Content Generator** ↔ **Keyword Clusters**
   - Content generator doesn't know which keywords are profitable
   - Need to generate content for high-ROI keywords first
   - **Solution:** Feed keyword_clusters.json into content prompts

3. **Metrics Import** ↔ **Admin Dashboard**
   - Metrics import runs via CLI, results not visible in dashboard
   - Need UI to upload CSVs, run import, view reports
   - **Solution:** Add Analytics tab with CSV upload & report viewer

4. **Phase 1 Changes** ↔ **Page Analyzer**
   - Page analyzer doesn't check for GA4, trust signals, pricing anchors
   - Need to update scoring criteria
   - **Solution:** Add Phase 1 checks to analyzer logic

5. **Multi-Site** ↔ **Everything**
   - All systems assume single site
   - Need site selection in admin dashboard
   - **Solution:** Add site switcher component, filter all data by site

---

## Redesigned Admin Dashboard Architecture

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header: Site Selector | User Menu | Deploy Button   │
├──────────────┬──────────────────────────────────────┤
│              │                                       │
│  Accordion   │         Main Content Area            │
│  Sidebar     │                                       │
│              │  Dynamic tabs/views based on         │
│  ▼ Overview  │  sidebar selection                   │
│  ▶ Content   │                                       │
│  ▶ SEO Bot   │                                       │
│  ▶ Images    │                                       │
│  ▶ Analytics │                                       │
│  ▶ Deploy    │                                       │
│  ▶ Settings  │                                       │
│              │                                       │
└──────────────┴──────────────────────────────────────┘
```

### Sidebar Accordion Behavior

- Opening one section auto-closes others
- Compact, modern design (bubble/pill buttons)
- Icon + text for each section
- Active section highlighted

---

## Section-by-Section Design

### 1. Overview Dashboard

**Purpose:** Quick snapshot of system health & key metrics

**Layout:**

```
┌─ Site Status ──────────────┬─ SEO Performance ─────┬─ Revenue Impact ─────┐
│ ✅ Airport (Live)          │ Avg SEO Score: 78/100 │ Last 30 Days:        │
│ ⏳ Party Bus (Pending)     │ Pages Analyzed: 12    │ Revenue: $45,320     │
│ ⏳ Executive (Pending)     │ Issues: 3 High, 5 Med │ Ad Spend: $8,450     │
│ ⏳ Wedding (Pending)       │ Last Run: 2 hours ago │ ROAS: 5.4 ✅         │
└────────────────────────────┴───────────────────────┴──────────────────────┘

┌─ Recent Activity ──────────────────────────────────────────────────────────┐
│ ⏰ 2 hours ago  │ Daily page analysis completed (12 pages, avg score: 78) │
│ 📊 1 day ago    │ ROI report generated ($45K revenue, ROAS 5.4)           │
│ ⚠️ 2 days ago   │ 3 high-priority SEO issues detected                     │
│ ✅ 3 days ago   │ Phase 1 improvements deployed (GA4, trust signals)      │
└────────────────────────────────────────────────────────────────────────────┘

┌─ Quick Actions ────────────────────────────────────────────────────────────┐
│ [Run Page Analysis] [Import Metrics] [Generate SEO Report] [View Issues]  │
└────────────────────────────────────────────────────────────────────────────┘

┌─ Automation Schedule ──────────────────────────────────────────────────────┐
│ • Daily: Page analysis (2:00 AM CT)                   [Edit] [Run Now]   │
│ • Weekly: SEO report (Mon 9:00 AM CT)                [Edit] [Run Now]   │
│ • Biweekly: Content proposals (Mon 10:00 AM CT)      [Edit] [Run Now]   │
│ • Monthly: Full site audit (1st of month)            [Edit] [Run Now]   │
└────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources:**

- Firebase Functions execution logs
- `/packages/content/metrics/roi_summary.json`
- Firestore: page_analysis collection
- Build status from CI/CD

---

### 2. Content Management

**Purpose:** Manage pages, drafts, and content workflow

**Sub-Tabs:** Pages | Drafts | City Manager

#### 2.1 Pages Tab

```
┌─ Website Pages ────────────────────────────────────────────────────────────┐
│ Search: [_________] Filter: [All] [Published] [Draft] [Needs Review]     │
├────────────────────────────────────────────────────────────────────────────┤
│ Page                      │ SEO Score │ Profit │ Last Updated │ Actions  │
├──────────────────────────-┼───────────┼────────┼──────────────┼──────────┤
│ Home (/)                  │ 85 ✅     │ High   │ 2 days ago   │ [Edit]   │
│ O'Hare Airport            │ 78 ⚠️     │ High   │ 3 days ago   │ [Edit]   │
│ Midway Airport            │ 72 ⚠️     │ Med    │ 5 days ago   │ [Edit]   │
│ Pricing                   │ 90 ✅     │ Med    │ 1 day ago    │ [Edit]   │
│ Fleet                     │ 65 ❌     │ Low    │ 1 week ago   │ [Edit]   │
└────────────────────────────────────────────────────────────────────────────┘
[Export Data] [Bulk Actions] [Generate Report]
```

**Features:**

- Click page → view full analysis (redirects to Page Analyzer with pre-filled URL)
- Profit column calculated from keyword_clusters.json
- SEO Score from AI page analyzer
- Quick filters

#### 2.2 Drafts Tab

```
┌─ Content Drafts ───────────────────────────────────────────────────────────┐
│ Status: [All] [DRAFT] [READY] [PUBLISHED] [REJECTED]                      │
├────────────────────────────────────────────────────────────────────────────┤
│ Draft Title                │ Status │ Word Count │ Created    │ Actions   │
├────────────────────────────┼────────┼────────────┼────────────┼───────────┤
│ O'Hare to Naperville      │ READY  │ 1,450      │ 2 days ago │ [Preview] │
│ Midway to Schaumburg      │ DRAFT  │ 850 ⚠️     │ 3 days ago │ [Edit]    │
│ Hourly Chauffeur Chicago  │ DRAFT  │ 1,200      │ 5 days ago │ [Edit]    │
└────────────────────────────────────────────────────────────────────────────┘
```

**Workflow:**

1. AI generates DRAFT
2. Quality gate checks → READY or REJECTED
3. Human reviews READY → approves → PUBLISHED
4. Create PR with published drafts

**Data Source:** `/packages/content/seo-bot/drafts/*.json`

#### 2.3 City Manager Tab

```
┌─ City Pages ───────────────────────────────────────────────────────────────┐
│ [Add New City] [Batch Import] [Export]                                    │
├────────────────────────────────────────────────────────────────────────────┤
│ City          │ Status    │ Page Generated │ SEO Score │ Actions          │
├───────────────┼───────────┼────────────────┼───────────┼──────────────────┤
│ Naperville    │ ✅ Active │ Yes            │ 82        │ [Edit] [Disable] │
│ Schaumburg    │ ✅ Active │ Yes            │ 76        │ [Edit] [Disable] │
│ Oak Brook     │ ⏳ Pending│ No             │ --        │ [Generate]       │
│ Evanston      │ ⏳ Pending│ No             │ --        │ [Generate]       │
└────────────────────────────────────────────────────────────────────────────┘
```

**Features:**

- Add city with name, geo coords, suburbs
- Generate page button → creates draft
- Disable city → removes from sitemap (doesn't delete)

**Data Source:** `/packages/content/cities.json` (NEW - to be created)

---

### 3. SEO Autobot

**Purpose:** AI-powered content generation with quality gates

**Layout:**

```
┌─ SEO Autobot Control Panel ────────────────────────────────────────────────┐
│                                                                             │
│ ┌─ Pipeline Controls ─────────────────────────────────────────────────────┐│
│ │ [1. Propose Topics] [2. Generate Drafts] [3. Quality Gate] [4. Publish]││
│ │                                                                          ││
│ │ Or run full pipeline: [▶️ Run All Steps]                                ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Latest Gate Report ─────────────────────────────────────────────────────┐│
│ │ Generated: 2 days ago                                                    ││
│ │                                                                          ││
│ │ ✅ Passed: 18 pages                                                      ││
│ │ ❌ Failed: 7 pages                                                       ││
│ │                                                                          ││
│ │ Common Issues:                                                           ││
│ │ • 3 pages: Content too short (<1200 words)                              ││
│ │ • 2 pages: Duplicate title tags                                         ││
│ │ • 2 pages: High semantic similarity (>0.85)                             ││
│ │                                                                          ││
│ │ [View Full Report] [Download JSON]                                      ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Topic Queue (Profit-First) ────────────────────────────────────────────┐│
│ │ Priority | Keyword              | Intent        | Profit | Status       ││
│ │──────────┼──────────────────────┼───────────────┼────────┼──────────────││
│ │ 1        │ ohare limo naperville│ airport_ohare │ $450   │ ⏳ Queued    ││
│ │ 2        │ midway airport schau │ airport_midway│ $380   │ ⏳ Queued    ││
│ │ 3        │ hourly chauffeur chi │ hourly_chauf  │ $350   │ ⏳ Queued    ││
│ │ 4        │ party bus rental chi │ party_bus     │ $890   │ 📝 Drafting  ││
│ │                                                                          ││
│ │ [Approve Selected] [Reject Selected] [Reorder]                          ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Settings ───────────────────────────────────────────────────────────────┐│
│ │ Max pages per run: [25] ▼                                               ││
│ │ Similarity threshold: [0.85] ━━━━━━━━━━━━━━● (higher = stricter)       ││
│ │ Min word count (service/city): [1200]                                   ││
│ │ Min word count (blog): [900]                                            ││
│ │ LLM Provider: [gemini] ▼  API Key: [●●●●●●●●●●●●] [Test Connection]    ││
│ │                                                                          ││
│ │ [Save Settings] [Reset to Defaults]                                     ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources:**

- `/packages/content/seo-bot/queue/topics.json`
- `/packages/content/seo-bot/drafts/*.json`
- `/reports/seo-gate-report.md` & `.json`

**Scripts Invoked:**

- `npm run seo:propose` (button 1)
- `npm run seo:draft` (button 2)
- `npm run seo:gate` (button 3)
- `npm run seo:publish` (button 4)
- `npm run seo:run` (Run All button)

---

### 4. Images

**Purpose:** Manage images, manifests, and AI generation

**Layout:**

```
┌─ Image Management ─────────────────────────────────────────────────────────┐
│                                                                             │
│ ┌─ Upload Images ──────────────────────────────────────────────────────────┐│
│ │ Drag & drop images or [Browse Files]                                    ││
│ │                                                                          ││
│ │ Site: [Airport ▼] Entity Type: [Hero ▼] Entity: [home-page ▼]          ││
│ │ Alt Text: [___________________________]                                 ││
│ │ Source Type: [owned ▼] [licensed] [ai]  Source Proof: [_______]        ││
│ │                                                                          ││
│ │ [Upload] (Auto-generates WebP, creates responsive sizes, updates manifest)││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Image Inventory ────────────────────────────────────────────────────────┐│
│ │ Site: [Airport ▼]                                                        ││
│ │                                                                          ││
│ │ Entity           │ Images │ Missing │ Last Updated │ Actions            ││
│ │──────────────────┼────────┼─────────┼──────────────┼────────────────────││
│ │ home-hero        │ 1/1 ✅ │ 0       │ 2 days ago   │ [View] [Generate]  ││
│ │ ohare-hero       │ 1/1 ✅ │ 0       │ 3 days ago   │ [View] [Generate]  ││
│ │ fleet-sedan      │ 8/12 ⚠️│ 4       │ 1 week ago   │ [View] [Generate]  ││
│ │ fleet-suv        │ 5/12 ❌│ 7       │ 2 weeks ago  │ [View] [Generate]  ││
│ │                                                                          ││
│ │ Total Missing: 11 images                                                ││
│ │ [Generate All Missing] [Download Report]                                ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ AI Prompt Requests ─────────────────────────────────────────────────────┐│
│ │ Entity: fleet-sedan-interior  Prompt: "Luxury sedan interior, black... "││
│ │ [Generate with Imagen] [Edit Prompt] [Skip]                             ││
│ │                                                                          ││
│ │ 5 more prompts in queue. [View All]                                     ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources:**

- `/packages/content/images/{site}-images.json` (manifests)
- `/packages/content/images/prompt_requests.json`

**Scripts Invoked:**

- `npm run images:inventory` (inventory report)
- `npm run images:generate-prompts` (AI prompt generation)
- Server API: `/api/ai/generate-image`

---

### 5. Analytics & ROI

**Purpose:** Import data, view metrics, track performance

**Layout:**

```
┌─ Analytics & ROI Dashboard ────────────────────────────────────────────────┐
│                                                                             │
│ ┌─ Data Import ────────────────────────────────────────────────────────────┐│
│ │ Upload Google Ads CSV:  [Drag & drop or browse]  [Upload]              ││
│ │ Upload Moovs CSV:       [Drag & drop or browse]  [Upload]              ││
│ │ Upload Keywords XLSX:   [Drag & drop or browse]  [Upload]              ││
│ │                                                                          ││
│ │ [Run Metrics Import] ← After uploading, click to process                ││
│ │                                                                          ││
│ │ Last import: 2 days ago (✅ Successful)                                 ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ ROI Summary (Last 30 Days) ─────────────────────────────────────────────┐│
│ │ Ad Spend: $8,450  │  Revenue: $45,320  │  ROAS: 5.4 ✅  │  Profit: $15K ││
│ │ Conversions: 87   │  CPA: $97          │  Conv Rate: 3.2%│               ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Top 10 Keywords (by Profit Proxy) ──────────────────────────────────────┐│
│ │ Keyword                │ Volume │ CPC   │ ROAS │ Label │ Landing Page   ││
│ │────────────────────────┼────────┼───────┼──────┼───────┼────────────────││
│ │ ohare airport limo     │ 720    │ $6.50 │ 8.2  │ SCALE │ /ohare-airport ││
│ │ midway car service     │ 390    │ $5.80 │ 6.5  │ SCALE │ /midway-airport││
│ │ party bus rental chi   │ 1,600  │ $4.20 │ 7.1  │ SCALE │ /party-bus     ││
│ │ hourly chauffeur       │ 260    │ $9.50 │ 9.2  │ SCALE │ /hourly-chauf  ││
│ │ chicago limo service   │ 880    │ $3.80 │ 2.1  │ FIX   │ /               ││
│ │                                                                          ││
│ │ [View Full Report (Top 100)] [Export CSV]                               ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Service Mix (Revenue Distribution) ─────────────────────────────────────┐│
│ │ 📊 Pie Chart:                                                            ││
│ │ • Airport Transfers: 60% ($27K)                                          ││
│ │ • Corporate Hourly: 20% ($9K)                                            ││
│ │ • Wedding/Events: 12% ($5.4K)                                            ││
│ │ • Party Bus: 8% ($3.6K)                                                  ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Reports ────────────────────────────────────────────────────────────────┐│
│ │ • ROI Report (Last 30 Days)        [View] [Download PDF]                ││
│ │ • Keyword Top 100                  [View] [Download CSV]                ││
│ │ • Landing Page Matrix              [View] [Download CSV]                ││
│ │ • Profit Model Configuration       [View] [Edit]                        ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources:**

- `/packages/content/metrics/roi_summary.json`
- `/reports/roi-report.md`
- `/reports/keyword-top100.md`
- `/packages/content/metrics/keyword_clusters.json`
- `/packages/content/metrics/moovs_service_mix.json`

**Backend APIs (NEW - to be built):**

- `POST /api/admin/upload-csv` (handles CSV uploads)
- `POST /api/admin/run-metrics-import` (triggers `npm run metrics:import`)
- `GET /api/admin/reports/{type}` (serves report files)

---

### 6. Deploy

**Purpose:** Safe deployment controls per site

**Layout:**

```
┌─ Deployment Control Center ────────────────────────────────────────────────┐
│                                                                             │
│ ┌─ Site Status ────────────────────────────────────────────────────────────┐│
│ │ Site                │ Status      │ Last Deploy        │ Version        ││
│ │─────────────────────┼─────────────┼────────────────────┼────────────────││
│ │ Airport (Primary)   │ ✅ Live     │ 2 days ago         │ v1.5.0         ││
│ │ Party Bus           │ ⏳ Staging  │ --                 │ --             ││
│ │ Executive           │ ⏳ Not Built│ --                 │ --             ││
│ │ Wedding             │ ⏳ Not Built│ --                 │ --             ││
│ │ Admin Dashboard     │ ✅ Live     │ 2 days ago         │ v1.2.0         ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Deploy Options ─────────────────────────────────────────────────────────┐│
│ │ Select site: [Airport ▼]                                                ││
│ │                                                                          ││
│ │ [🚀 Deploy to Production]  [🧪 Deploy to Staging]  [📦 Build Only]     ││
│ │                                                                          ││
│ │ Pre-deploy checklist:                                                    ││
│ │ ✅ Build passing                                                         ││
│ │ ✅ Tests passing                                                         ││
│ │ ⚠️ 3 SEO warnings (non-blocking)                                        ││
│ │ ✅ No security issues                                                    ││
│ │ ✅ Images optimized                                                      ││
│ │ ✅ Sitemap generated                                                     ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Deployment History ─────────────────────────────────────────────────────┐│
│ │ Date           │ Site    │ Version │ Status      │ Duration │ By        ││
│ │────────────────┼─────────┼─────────┼─────────────┼──────────┼───────────││
│ │ Jan 15, 4:23PM │ Airport │ v1.5.0  │ ✅ Success  │ 3m 42s   │ Copilot   ││
│ │ Jan 13, 2:15PM │ Airport │ v1.4.2  │ ✅ Success  │ 3m 28s   │ Copilot   ││
│ │ Jan 12, 9:30AM │ Admin   │ v1.2.0  │ ✅ Success  │ 2m 15s   │ User      ││
│ │                                                                          ││
│ │ [View Full History]                                                      ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Manual Deploy (If Firebase CLI Not Available) ─────────────────────────┐│
│ │ Run these commands in your terminal:                                     ││
│ │ $ npm run build                                                          ││
│ │ $ firebase deploy --only hosting:airport                                ││
│ │                                                                          ││
│ │ [Copy Commands]                                                          ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Backend APIs:**

- `POST /api/admin/deploy` (triggers Firebase deploy)
- `GET /api/admin/deploy-status` (check deployment status)
- `GET /api/admin/deploy-history` (list past deploys)

**Firebase Integration:**

- Uses Firebase Admin SDK
- Checks pre-deploy conditions
- Triggers `firebase deploy --only hosting:{target}`
- Logs deployments to Firestore

---

### 7. Settings

**Purpose:** Configure system-wide settings

**Layout:**

```
┌─ System Settings ──────────────────────────────────────────────────────────┐
│                                                                             │
│ ┌─ Business Information ───────────────────────────────────────────────────┐│
│ │ Phone: [(224) 801-3090]                                                 ││
│ │ tel: [tel:+12248013090]                                                 ││
│ │ Booking URL: [https://customer.moovs.app/royal-carriage-limousine...] ││
│ │ GA4 Measurement ID: [G-CC67CH86JR]                                      ││
│ │                                                                          ││
│ │ [Save Business Info]                                                     ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ SEO Thresholds ─────────────────────────────────────────────────────────┐│
│ │ Max publish per run: [25] ▼                                             ││
│ │ Semantic similarity threshold: [0.85] ━━━━━━━━●                         ││
│ │ Min word count (service/city pages): [1200]                             ││
│ │ Min word count (blog posts): [900]                                      ││
│ │ Min word count (FAQ pages): [800]                                       ││
│ │                                                                          ││
│ │ [Save SEO Thresholds] [Reset to Defaults]                               ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Profit Model ───────────────────────────────────────────────────────────┐│
│ │ Airport Transfer Margin: [28%] ━━━━━━━━━━━━━●                           ││
│ │ Corporate Hourly Margin: [30%] ━━━━━━━━━━━━━━●                          ││
│ │ Wedding Event Margin: [33%] ━━━━━━━━━━━━━━━━●                           ││
│ │ Party Bus Margin: [35%] ━━━━━━━━━━━━━━━━━●                              ││
│ │                                                                          ││
│ │ ROAS Thresholds:                                                         ││
│ │ • Excellent: [5.0] • Good: [3.0] • Acceptable: [2.0] • Break-even: [1.0]││
│ │                                                                          ││
│ │ [Save Profit Model] [View Full Model (JSON)]                            ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ LLM Configuration ──────────────────────────────────────────────────────┐│
│ │ Provider: [gemini ▼] [anthropic] [openai]                               ││
│ │ API Key: [●●●●●●●●●●●●●●●●●●●●] [Show] [Update]                         ││
│ │ Model: [gemini-1.5-pro ▼]                                               ││
│ │ Temperature (creativity): [0.7] ━━━━━━━━━━━●                            ││
│ │                                                                          ││
│ │ [Test Connection] [Save LLM Config]                                     ││
│ └──────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│ ┌─ Automation Settings ────────────────────────────────────────────────────┐│
│ │ Daily page analysis: [Enabled ▼] Time: [02:00 AM CT]                   ││
│ │ Weekly SEO report: [Enabled ▼] Day: [Monday] Time: [09:00 AM CT]       ││
│ │ Biweekly content proposals: [Enabled ▼] Day: [Monday] Time: [10:00 AM] ││
│ │                                                                          ││
│ │ [Save Automation Settings]                                               ││
│ └──────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources:**

- `/packages/content/profit_model.json`
- Firebase Firestore: settings collection
- Environment variables (read-only display)

---

## Implementation Plan

### Phase 1: Core Infrastructure (Week 1)

- [x] GA4 tracking ✅
- [x] Trust signals ✅
- [x] Pricing anchors ✅
- [x] Differentiated messaging ✅
- [ ] Accordion sidebar component
- [ ] Site selector component
- [ ] Redesign Overview dashboard

### Phase 2: Analytics Integration (Week 2)

- [ ] CSV upload API endpoints
- [ ] Metrics import trigger endpoint
- [ ] Report viewer components
- [ ] ROI dashboard visualization
- [ ] Keyword top 100 display
- [ ] Service mix pie chart

### Phase 3: SEO Bot UI (Week 3)

- [ ] Topic queue display
- [ ] Draft management interface
- [ ] Quality gate report viewer
- [ ] Pipeline control buttons
- [ ] Settings configuration UI

### Phase 4: Image Management (Week 4)

- [ ] Image upload with manifest update
- [ ] Inventory display
- [ ] Missing images report
- [ ] AI prompt request queue
- [ ] Imagen integration UI

### Phase 5: Deploy & Multi-Site (Week 5)

- [ ] Deploy control panel
- [ ] Pre-deploy checklist automation
- [ ] Deployment history log
- [ ] Multi-site Firebase config
- [ ] Site switcher implementation

### Phase 6: Polish & Test (Week 6)

- [ ] Accordion behavior refinement
- [ ] Mobile responsive design
- [ ] Error handling & loading states
- [ ] Integration testing
- [ ] User acceptance testing

---

## Technical Requirements

### Frontend Components to Build

1. **AccordionSidebar.tsx** - Main navigation
2. **SiteSelector.tsx** - Multi-site dropdown
3. **ROIDashboard.tsx** - Analytics visualization
4. **TopKeywordsTable.tsx** - Keyword performance
5. **ServiceMixChart.tsx** - Revenue distribution pie chart
6. **SEOBotControl.tsx** - Pipeline controls
7. **TopicQueue.tsx** - Prioritized topics list
8. **QualityGateReport.tsx** - Gate results viewer
9. **ImageInventory.tsx** - Image manifest display
10. **DeployControl.tsx** - Deployment interface
11. **CSVUploader.tsx** - Drag & drop CSV upload

### Backend APIs to Build

1. `POST /api/admin/upload-csv` - Handle CSV uploads
2. `POST /api/admin/run-metrics-import` - Trigger metrics import
3. `GET /api/admin/reports/{type}` - Serve report files
4. `POST /api/admin/deploy` - Trigger Firebase deploy
5. `GET /api/admin/deploy-status` - Check deploy status
6. `GET /api/admin/deploy-history` - List deployments
7. `POST /api/admin/seo/propose` - Trigger topic proposal
8. `POST /api/admin/seo/draft` - Trigger draft generation
9. `POST /api/admin/seo/gate` - Trigger quality gate
10. `POST /api/admin/seo/publish` - Publish approved drafts

### Database Schema Updates

```typescript
// Add to Drizzle schema
table seo_drafts {
  id: uuid primary_key
  topic_id: uuid references topics
  title: text
  meta_description: text
  slug: text
  h1: text
  body_md: text
  schema_jsonld: jsonb
  internal_links: jsonb
  images: jsonb
  faq: jsonb
  word_count: integer
  status: enum('DRAFT', 'READY', 'PUBLISHED', 'REJECTED')
  created_at: timestamp
  updated_at: timestamp
}

table seo_topics {
  id: uuid primary_key
  keyword: text
  intent: text (airport_ohare, party_bus, etc.)
  priority: integer (profit proxy score)
  suggested_site: text (airport, partybus, executive, wedding)
  suggested_path: text (/ohare-to-naperville)
  status: enum('QUEUE', 'DRAFTING', 'READY', 'PUBLISHED')
  created_at: timestamp
}

table csv_uploads {
  id: uuid primary_key
  file_type: enum('google_ads', 'moovs', 'keywords')
  filename: text
  file_path: text
  uploaded_by: uuid references users
  uploaded_at: timestamp
  processed: boolean
  rows_imported: integer
}

table deployments {
  id: uuid primary_key
  site: enum('airport', 'partybus', 'executive', 'wedding', 'admin')
  version: text
  status: enum('PENDING', 'BUILDING', 'DEPLOYING', 'SUCCESS', 'FAILED')
  duration_seconds: integer
  deployed_by: uuid references users
  deployed_at: timestamp
  build_logs: text
}
```

---

## Success Metrics

### Admin Dashboard Performance

- Load time <2 seconds
- All API calls <500ms
- No console errors
- Mobile responsive (tablet+)

### User Experience

- Single-click access to all functions
- Accordion sidebar reduces navigation time 50%
- CSV upload → report view in <30 seconds
- Deploy process clear with progress indicators

### Integration Success

- AI page analyzer considers profit proxy ✅
- Content generator uses keyword clusters ✅
- Metrics import results visible in dashboard ✅
- Multi-site controls work seamlessly ✅

---

## Next Steps

1. **Complete Phase 1 tasks** (accordion sidebar, site selector, overview redesign)
2. **Build Analytics Integration** (CSV upload, metrics display)
3. **Test end-to-end workflow** (upload data → generate content → deploy)
4. **Document APIs** for future developers
5. **Create video walkthrough** for users

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026  
**Status:** Design Complete, Implementation Starting  
**Owner:** GitHub Copilot Agent (SEO/ROI Intelligence)
