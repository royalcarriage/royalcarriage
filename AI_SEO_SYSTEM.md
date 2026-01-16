# AI/SEO System Implementation

## Overview

This document describes the complete closed-loop, gated, revenue-driven AI/SEO system implemented for Royal Carriage. The system follows a layered architecture with confirmation, decision, and action layers to ensure quality and ROI-focused content generation.

## Architecture

### LAYER A: SEO & Website Audit Systems (CONFIRMATION LAYER)

Monitors site health and identifies issues before they impact rankings.

#### 1. Google Search Console Integration
- **File**: `scripts/gsc-sync.mjs`
- **Purpose**: Fetch indexed pages, crawl errors, canonical issues from GSC API
- **Output**: Daily JSON snapshots in `/data/gsc/`, reports in Firestore `gsc_reports` collection
- **Flags**:
  - Pages deindexed since last sync
  - Impression drops > 50%
  - Keyword cannibalization (multiple pages ranking for same keyword)
- **Usage**: `npm run gsc:sync`
- **Schedule**: Weekly (via cron)

#### 2. Internal Site Crawler
- **File**: `scripts/site-crawler.mjs`
- **Purpose**: Crawl all built pages for structural SEO issues
- **Checks**:
  - Title/meta duplicates
  - Missing H1 tags
  - Broken internal links
  - Orphan pages (no inbound links)
  - Thin content (<500 words)
- **Output**: `/reports/crawl-report.json` with diff against previous crawl
- **Usage**: `npm run crawl`
- **Schedule**: Weekly (via cron)

#### 3. Lighthouse CI Integration
- **File**: `scripts/lighthouse-check.mjs`
- **Purpose**: Run performance audits on key pages
- **Metrics**: LCP, CLS, FID, Performance score
- **Thresholds**: Performance < 70 = FAIL, LCP > 2.5s = FAIL
- **Output**: `/reports/lighthouse/lighthouse-YYYY-MM-DD.json`, Firestore `lighthouse_reports`
- **Usage**: `npm run lighthouse` (requires dev server running)
- **Schedule**: Weekly (via cron)

### LAYER B: Ads + Analytics Intelligence (DECISION LAYER)

Uses revenue data to make intelligent content decisions.

#### 4. Enhanced ROI Intelligence
- **File**: `server/ai/roi-intelligence.ts`
- **Purpose**: Compute profit metrics from operational data
- **Integration**: Moovs data (from PR #26)
- **Metrics**:
  - `profit_proxy = revenue - tax - driver_payout - ad_spend`
  - Revenue breakdown by: service type, city, vehicle type, booking type
  - AOV (Average Order Value) per segment
  - Repeat booking signals
- **Functions**:
  - `loadMoovsData()` - Load booking data
  - `calculateROIMetrics()` - Compute profit metrics
  - `breakdownByServiceType/City/VehicleType/BookingType()` - Segment analysis
  - `calculateOpportunityScore()` - Score content opportunities

#### 5. SEO Proposer Enhancement
- **File**: `scripts/seo-propose.mjs`
- **Purpose**: Propose content topics based on revenue opportunity
- **Inputs**: Google Ads keyword clusters, Moovs revenue, GA4 engagement
- **Auto-propose logic**:
  - High-profit keywords with low content coverage
  - Cities with rising bookings but weak pages
  - Service types with good ROI but thin content
- **Usage**: 
  - Manual: `npm run seo:propose -- --keyword "luxury limo" --profit 85 --traffic 300 --difficulty 45`
  - Auto: `npm run seo:propose -- --auto`
- **Schedule**: Weekly (via cron)

#### 6. Data Freshness Tracking
- **File**: `shared/data-freshness.ts`
- **Purpose**: Monitor data source staleness
- **Sources Tracked**:
  - Moovs CSV (daily - threshold: 24h)
  - Google Ads CSV (weekly - threshold: 168h)
  - GA4 data (daily - threshold: 24h)
  - GSC data (weekly - threshold: 168h)
  - SEO Bot Queue (daily - threshold: 24h)
- **Status Levels**: 🟢 Fresh, 🟡 Stale, 🔴 Critical, ⚫ Missing
- **Usage**: `npm run data:check`
- **Schedule**: Daily (via cron)

### LAYER C: AI Content & Build Systems (ACTION LAYER)

Generates and validates content with strict quality gates.

#### 7. Enhanced SEO Draft AI
- **File**: `scripts/seo-draft.mjs`
- **Purpose**: Generate SEO-optimized content using OpenAI/Gemini
- **Master Rules** (STRICT):
  - Minimum 1500 words (target 2000+)
  - 5+ sections with H2 headers
  - FAQ section required (minimum 5 questions)
  - Local value content (Chicago-specific details)
  - Service-specific CTAs (phone number, booking links)
  - Schema blocks (LocalBusiness, Service, FAQ)
  - Image requirements (minimum 3 images with descriptive alt text)
  - Internal link suggestions (minimum 3 relevant links)
- **Output**: Draft JSON files in `/packages/content/seo-bot/drafts/`
- **Usage**: 
  - Single: `npm run seo:draft -- --topic topic-001`
  - Batch: `npm run seo:draft -- --all`
- **Schedule**: Manual (triggered after proposal approval)

#### 8. Enhanced Quality Gate
- **File**: `scripts/seo-gate.mjs`
- **Purpose**: Validate drafts before publishing
- **Checks**:
  - **Content Quality**: Min 1500 words, 5+ sections, FAQ section
  - **Local Value**: Chicago/suburb mentions, local keywords
  - **CTA Presence**: Minimum 2 CTAs with clear calls-to-action
  - **Phone Number**: Phone number in content or CTAs
  - **Duplicate Detection**: Intent similarity > 70% = FAIL
  - **Schema Completeness**: All required fields present
  - **Image Requirements**: Minimum 3 images, alt text with local keywords
  - **Internal Links**: Minimum 3 relevant internal links
- **Exit Codes**: 0 = PASS, 1 = FAIL (blocks publishing)
- **Usage**: 
  - Single: `npm run seo:gate -- --draft topic-001-chicago-limo.json`
  - Batch: `npm run seo:gate -- --all`
- **Schedule**: Before any publishing

### LAYER D: Image & Visual Systems (CONVERSION LAYER)

Manages image inventory and asset quality.

#### 9. Image Inventory System
- **File**: `scripts/image-inventory.mjs`
- **Purpose**: Track all image references across pages
- **Detects**:
  - Missing images (404s)
  - Poor aspect ratios (< 0.5 or > 3)
  - Overused images (same image on 5+ pages)
  - Pages with no images
  - Missing alt text
- **Output**: `/reports/image-inventory.json`
- **Usage**: `npm run image:audit`
- **Schedule**: Weekly (via cron)

#### 10. Image Manifest System
- **File**: `shared/image-manifest.ts`
- **Purpose**: Central manifest for image metadata
- **Stores**:
  - Image ID → metadata mapping
  - Alt text, placement, dimensions
  - Pages where image is used
  - AI prompt (for regeneration)
  - Firebase Storage URL
- **Functions**:
  - `loadManifest()` - Load manifest
  - `addImage()` - Register new image
  - `getImagesByPage()` - Find images for a page
  - `getManifestStats()` - Usage statistics

### LAYER E: Admin Dashboard (CONTROL LAYER)

Provides visibility and control over the AI system.

#### 11. System Status Dashboard
- **File**: `client/src/pages/admin/SystemStatus.tsx`
- **Route**: `/admin/system-status`
- **Purpose**: Real-time system health monitoring
- **Displays**:
  - 🟢 Fresh / 🟡 Stale / 🔴 Critical data source indicators
  - Last run timestamps for all systems
  - Error counts and details
  - Pages published this month vs blocked
- **Actions**: Refresh status button
- **Access**: Admin role required

#### 12. Audit Panel
- **File**: `client/src/pages/admin/AuditPanel.tsx`
- **Route**: `/admin/audit`
- **Purpose**: Review all system-detected issues
- **Tabs**:
  - **SEO Errors**: Gate failures blocking publishing
  - **Indexing Issues**: GSC-reported problems (deindexed pages, drops)
  - **Crawl Issues**: Broken links, missing H1, duplicates
  - **Image Issues**: Missing images, overused assets
  - **Performance**: Lighthouse failures, LCP issues
- **Access**: Admin role required

#### 13. One-Click Actions
Actions integrated throughout admin dashboard:
- "Import Moovs CSV" → `/admin/imports`
- "Import Ads CSV" → `/admin/imports`
- "Run SEO Propose" → Triggers `npm run seo:propose -- --auto`
- "Run SEO Gate" → Triggers `npm run seo:gate -- --all`
- "Deploy Sites" → Triggers `npm run deploy:all`

### LAYER F: Scheduling & Automation

Defines the automated workflow loop.

#### 14. Scheduled Jobs Configuration
- **File**: `scripts/cron-jobs.mjs`
- **Purpose**: Orchestrate automated tasks on schedules

**Daily Schedule** (NO PUBLISHING):
```bash
npm run cron:daily
```
- Check data freshness
- Import Moovs data (if API available)
- Import GA4 via API (if configured)
- Sync GSC data (if configured)
- Flag opportunities

**Weekly Schedule** (PROPOSAL ONLY):
```bash
npm run cron:weekly
```
- Run SEO proposer (auto-generate proposals)
- Run site crawler
- Run Lighthouse checks (if dev server available)
- Run image inventory

**Bi-weekly Schedule** (PUBLISH SMALL):
- Human reviews proposals (manual step)
- Approve 3-10 pages (manual step)
- Publish via PR (manual step)
- Re-index via GSC API (manual step)

**Monthly Schedule**:
- Prune underperforming pages (manual analysis)
- Merge cannibalized content (manual step)
- Refresh top money pages (manual step)

## The Loop (Automated Schedule)

### Daily
- ✅ Import data (Moovs, GA4, Ads)
- ✅ Flag opportunities
- ✅ Check data freshness
- ❌ NO PUBLISHING

### Weekly
- ✅ Run SEO proposer
- ✅ Generate proposals based on revenue data
- ✅ Run crawler + Lighthouse
- ❌ NO PUBLISHING (proposal only)

### Bi-weekly
- 📋 Human reviews proposals
- 📋 Approve 3-10 pages
- ✅ Publish via PR
- ✅ Re-index

### Monthly
- 📋 Prune underperforming pages
- 📋 Merge cannibalized content
- 📋 Refresh top money pages

## NPM Scripts Reference

### SEO Content Pipeline
- `npm run seo:propose` - Propose new topics
- `npm run seo:propose -- --auto` - Auto-generate proposals from revenue data
- `npm run seo:draft` - Generate content drafts
- `npm run seo:gate` - Quality check drafts
- `npm run seo:publish` - Publish approved content

### System Monitoring
- `npm run data:check` - Check data freshness
- `npm run gsc:sync` - Sync Google Search Console
- `npm run crawl` - Crawl site for issues
- `npm run lighthouse` - Run performance audits
- `npm run image:audit` - Check image inventory

### Scheduled Jobs
- `npm run cron:daily` - Run daily automation
- `npm run cron:weekly` - Run weekly automation
- `npm run cron:biweekly` - Run bi-weekly automation
- `npm run cron:monthly` - Run monthly automation

## Setup Requirements

### Google APIs
1. **Google Search Console API**
   - Enable in Google Cloud Console
   - Create service account with GSC permissions
   - Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable
   - Verify site ownership in GSC

2. **Google Analytics 4 API**
   - Enable GA4 Data API
   - Configure service account access
   - Set property ID in environment

3. **Google Ads API**
   - Set up API access
   - Configure OAuth or service account
   - Implement CSV export or API integration

### OpenAI/Gemini
- Set `OPENAI_API_KEY` or `GEMINI_API_KEY` environment variable
- Configure model preferences in `seo-draft.mjs`

### Firebase/Firestore
- Initialize Firebase Admin SDK
- Collections used:
  - `gsc_reports` - GSC sync results
  - `lighthouse_reports` - Performance audits
  - `seo_proposals` - Content proposals
  - `seo_drafts` - Generated content

## File Structure

```
royalcarriage/
├── scripts/
│   ├── gsc-sync.mjs              # GSC integration
│   ├── site-crawler.mjs          # Internal crawler
│   ├── lighthouse-check.mjs      # Performance audits
│   ├── image-inventory.mjs       # Image tracking
│   ├── seo-propose.mjs           # Topic proposals
│   ├── seo-draft.mjs             # Content generation
│   ├── seo-gate.mjs              # Quality gates
│   ├── check-data-freshness.mjs  # Data monitoring
│   └── cron-jobs.mjs             # Job scheduler
├── server/
│   └── ai/
│       └── roi-intelligence.ts   # Revenue analysis
├── shared/
│   ├── data-freshness.ts         # Freshness tracking
│   └── image-manifest.ts         # Image metadata
├── client/src/pages/admin/
│   ├── SystemStatus.tsx          # Status dashboard
│   └── AuditPanel.tsx            # Audit view
├── data/
│   ├── gsc/                      # GSC snapshots
│   ├── moovs/                    # Moovs data
│   └── google-ads/               # Ads data
├── reports/
│   ├── crawl-report.json         # Crawler results
│   ├── gsc-report.json           # GSC analysis
│   ├── image-inventory.json      # Image audit
│   └── lighthouse/               # Performance reports
└── packages/content/
    ├── metrics/                  # Revenue metrics
    └── seo-bot/
        ├── queue/
        │   └── topics.json       # Proposed topics
        └── drafts/               # Generated content
```

## Success Criteria

### ✓ Confirmation Layer
- GSC data syncing and flagging issues
- Crawler detecting structural problems
- Lighthouse blocking bad deploys

### ✓ Decision Layer
- Profit proxy computed from Moovs + Ads
- Proposals based on revenue opportunity, not guesses
- Data freshness alerts

### ✓ Action Layer
- Content generation with master rules
- Quality gates blocking bad content
- PR-based publishing (never direct to main)

### ✓ Control Layer
- Dashboard shows system health at a glance
- One-click actions work
- Audit errors visible

## Future Enhancements

1. **API Integrations**
   - Complete GSC API integration
   - GA4 automated imports
   - Moovs API (vs CSV)

2. **AI Improvements**
   - Multi-model content generation
   - A/B testing headlines
   - Automated image generation via DALL-E

3. **Advanced Analytics**
   - ROI tracking per published page
   - Content performance scoring
   - Predictive revenue modeling

4. **Automation**
   - Auto-approval for high-confidence drafts
   - Automated PR creation
   - Self-healing link fixer

## Security Considerations

- All API keys stored in environment variables
- Service accounts with minimal required permissions
- Admin dashboard requires authentication
- No secrets committed to repository
- Firestore security rules enforced

## Monitoring & Alerts

- Data freshness alerts (email/Slack)
- Critical SEO issue notifications
- Publishing gate failures logged
- Performance regression alerts
- Daily/weekly summary reports

## Support & Maintenance

- System designed for minimal manual intervention
- Weekly human review of proposals (30 min)
- Bi-weekly publishing decisions (1 hour)
- Monthly strategic review (2 hours)

---

**Last Updated**: 2026-01-16  
**Version**: 1.0  
**Maintained By**: Royal Carriage Development Team
