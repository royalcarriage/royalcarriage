# Production-Grade KPI Dashboard & Enhanced Quality Gates - Implementation Summary

## Overview

This implementation provides a complete production-grade SEO system with:
- Real-time KPI dashboard with Green/Yellow/Red indicators
- Enhanced quality gates with hard-fail conditions
- City and airport page templates with strict requirements
- Lifecycle-based publishing workflow (daily/weekly/biweekly/monthly)

## 1. KPI Dashboard (`/admin/kpi`)

### Features

#### A. Data Freshness Panel
- **Purpose**: Monitor data staleness across all sources
- **Thresholds**:
  - Google Ads, GA4, Moovs: 🟢 ≤24h, 🟡 ≤72h, 🔴 >72h
  - GSC Data: 🟢 ≤7d, 🟡 ≤14d, 🔴 >14d
- **Action**: Shows "PUBLISHING FROZEN" banner if ANY source is red

#### B. Revenue & Profit Proxy Panel
- **Metrics**:
  - Revenue WoW: 🟢 ≥0%, 🟡 ≥-5%, 🔴 <-10%
  - Ad Spend vs Revenue: Shows spend ratio
  - Profit Proxy: Revenue - AdSpend - DriverPayout - Taxes
  - Avg Order Value: Tracks changes vs baseline
- **Formula**: `Profit = Revenue - AdSpend - DriverPayout - Taxes`

#### C. Conversion Health Panel (Per Page)
- **Metrics** (vs baseline):
  - Click to Call: 🟢 ≥0%, 🟡 ≥-5%, 🔴 <-10%
  - Book Now Clicks: 🟢 ≥0%, 🟡 ≥-5%, 🔴 <-10%
  - Scroll 75%: 🟢 ≥40%, 🟡 ≥25%, 🔴 <25%
  - Bounce Rate: 🟢 ≤+0%, 🟡 ≤+5%, 🔴 >+10%
- **Display**: Shows per-page metrics with overall status

#### D. SEO System Health Panel
- **Metrics**:
  - Indexed Pages: 🟢 stable/up, 🟡 -5%, 🔴 -15%
  - Coverage Errors: 🟢 ≤2, 🟡 ≤10, 🔴 >10
  - Cannibalization: 🟢 none, 🟡 suspected, 🔴 confirmed
  - Gate Status: Shows passed/warning/failed counts

#### E. Content Pipeline Status Panel
- **Metrics**:
  - Drafts Awaiting Review: 🟢 ≤20, 🟡 ≤50, 🔴 >50
  - Pages Published (Monthly): 🟢 3-10, 🟡 1-15, 🔴 >15 or <1
  - Pages Blocked by Gate: 🟢 ≤2, 🟡 ≤5, 🔴 >5
  - Queued Topics: Informational count
- **Warning**: Red if >15 pages/month (too aggressive)

### Navigation
- Access via: Admin → KPI Dashboard (or `/admin/kpi`)
- Quick indicators in admin header showing data and gate status

## 2. Enhanced Quality Gates

### Hard-Fail Gates (Block Publishing)

#### Content Quality
1. **Thin Content** [HARD FAIL]
   - City pages: Minimum 1200 words
   - Blog posts: Minimum 900 words
   
2. **Duplicate Intent** [HARD FAIL]
   - Semantic similarity must be ≤80%
   - Checks against all existing drafts

3. **Local Value** [HARD FAIL] (City pages only)
   - Minimum 6 local entities (hotels, venues, landmarks)
   - Must mention local airport routes
   - City-specific context required

#### SEO Technical
4. **H1 Count** [HARD FAIL]
   - Must have exactly 1 H1 tag
   
5. **Title & Meta** [Warning]
   - Title: 50-65 characters
   - Meta description: 140-165 characters

6. **Schema Markup** [Warning]
   - City pages: Service + FAQPage
   - Airport pages: Service + FAQPage
   - Blog posts: BlogPosting

#### Image Quality
7. **Hero Image** [HARD FAIL]
   - Every page must have a hero image
   
8. **Alt Text** [HARD FAIL]
   - All images must have alt text (min 10 chars)

#### Spam Prevention
9. **Doorway Pages** [HARD FAIL]
   - Detects pages with >85% similarity (after city name normalization)
   - Blocks if 3+ similar pages found

10. **Keyword Stuffing** [HARD FAIL]
    - Maximum 3% keyword density
    - Measured across all content

### Running Quality Gates

```bash
# Check specific draft
npm run seo:gate -- --draft filename.json

# Check all drafts
npm run seo:gate -- --all
```

## 3. Page Templates

### City Page Template (`templates/city-page-template.json`)

**Required Sections (6 total):**
1. **Intro** (150+ words)
   - Professional [Service] in [City]
   - Must be unique per city

2. **Airport Routes** (100+ words) - MONEY SECTION
   - Links to O'Hare and Midway
   - Varied anchor text (never repeat)
   - Include travel times

3. **Vehicles** (150+ words)
   - SUV, Executive Sprinter, Party Bus
   - Contextual recommendations

4. **Local Context** (200+ words)
   - About [City]
   - Minimum 6 local entities
   - Hotels, venues, landmarks, business parks

5. **Internal Links** (100+ words)
   - Related services
   - 3 nearby cities (contextual, not lists)

6. **FAQ** (400+ words)
   - 8-12 questions
   - Topics: travel time, vehicles, pricing, booking, luggage

**Quality Requirements:**
- Total: 1200+ words
- 6+ local entities
- Exactly 1 H1
- Hero image required
- <3% keyword density
- <80% similarity to other pages

### Airport Page Template (`templates/airport-page-template.json`)

**Main Sections:**
- Service introduction
- Airport-specific services (meet & greet, flight tracking)
- Vehicle fleet

**Reverse Links:**
- Maximum 15 cities
- Contextual presentation (not bare lists)
- Varied anchor text for each link

**Anti-Spam Rules:**
- No footer city lists
- No repeated anchor text
- Max 3 links per paragraph
- Natural language required

### Using Templates in Drafts

```bash
# Draft will automatically use appropriate template
npm run seo:draft -- --topic topic-001

# Template is determined by pageType in topic metadata
# - pageType: 'cityService' or 'city' → city-page-template.json
# - pageType: 'airport' → airport-page-template.json
```

## 4. Lifecycle Management

### Daily Run (No Publishing)
```bash
npm run seo:run -- --run --lifecycle daily
```

**Actions:**
- Import Moovs CSV
- Import Google Ads CSV
- Sync GA4 Events
- Sync GSC Data
- Compute KPIs
- Flag opportunities
- Check data freshness

**Output:** Data updates only

### Weekly Run (No Publishing)
```bash
npm run seo:run -- --run --lifecycle weekly
```

**Actions:**
- Run SEO proposer
- Run site crawler
- Run Lighthouse checks
- Generate proposal report

**Output:** Topic proposals and technical reports

### Bi-weekly Run (Publishing: 3-10 pages)
```bash
npm run seo:run -- --run --lifecycle biweekly --auto-publish
```

**Actions:**
- Human review proposals (manual step)
- Approve pages (manual step)
- Run quality gates
- Publish via PR (max 10 pages)
- Reindex via GSC

**Output:** PR with approved pages (3-10 recommended)

### Monthly Run (Optimization)
```bash
npm run seo:run -- --run --lifecycle monthly
```

**Actions:**
- Prune underperformers
- Merge cannibalized content
- Refresh top money pages
- Update internal links

**Output:** Optimization updates

## 5. File Structure

```
royalcarriage/
├── client/src/
│   ├── components/admin/
│   │   ├── DataFreshnessPanel.tsx
│   │   ├── RevenueProxyPanel.tsx
│   │   ├── ConversionHealthPanel.tsx
│   │   ├── SEOHealthPanel.tsx
│   │   ├── PipelineStatusPanel.tsx
│   │   └── PublishingFrozenBanner.tsx
│   ├── pages/admin/
│   │   └── KPIDashboard.tsx
│   └── lib/
│       └── kpi-thresholds.ts
├── scripts/
│   ├── seo-gate.mjs (enhanced with hard-fail gates)
│   ├── seo-draft.mjs (uses templates)
│   └── seo-run.mjs (lifecycle management)
├── shared/
│   ├── kpi-thresholds.ts (server-side constants)
│   └── quality-gate-rules.ts (gate rules)
└── templates/
    ├── city-page-template.json
    └── airport-page-template.json
```

## 6. Success Criteria

### Dashboard Shows:
- ✅ Data freshness with exact thresholds (24h/72h/7d)
- ✅ Revenue WoW change with % indicators
- ✅ Profit proxy calculation displayed
- ✅ Conversion health per page type
- ✅ SEO gate pass/warn/fail counts
- ✅ Pages published this month (with warning if >15)
- ✅ "PUBLISHING FROZEN" banner when data stale

### Gates Block:
- ✅ Thin content (<1200 words city, <900 words blog)
- ✅ Duplicate intent (>0.80 similarity)
- ✅ Missing local value (no landmarks/routes)
- ✅ Wrong H1 count (not exactly 1)
- ✅ Missing/invalid schema
- ✅ No hero image
- ✅ Doorway page detection
- ✅ Keyword stuffing (>3% density)

### Templates Enforce:
- ✅ City pages have 6 required sections
- ✅ 8-12 FAQs per city page
- ✅ 6+ local entities per city
- ✅ Airport pages link max 15 cities
- ✅ Varied anchor text (not repeated)
- ✅ No footer spam lists

### Lifecycle Runs:
- ✅ Daily: data import, no publishing
- ✅ Weekly: proposals only, no publishing
- ✅ Bi-weekly: max 10 pages via PR
- ✅ Monthly: prune/merge/refresh

## 7. Next Steps

### Integration
1. Connect dashboard to live data sources (APIs)
2. Set up automated daily/weekly/biweekly cron jobs
3. Configure GitHub Actions for PR creation
4. Set up GSC reindexing automation

### Monitoring
1. Set up alerts for red indicators
2. Configure Slack/email notifications for frozen publishing
3. Track KPI trends over time
4. Monitor gate pass rates

### Optimization
1. Adjust thresholds based on real data
2. Fine-tune similarity detection
3. Expand local entity detection
4. Add more page type templates

## 8. Commands Reference

```bash
# Quality Gates
npm run seo:gate -- --all              # Check all drafts
npm run seo:gate -- --draft file.json  # Check specific draft

# Drafting
npm run seo:draft -- --all             # Draft all queued topics
npm run seo:draft -- --topic topic-001 # Draft specific topic

# Lifecycle Runs
npm run seo:run -- --run --lifecycle daily
npm run seo:run -- --run --lifecycle weekly
npm run seo:run -- --run --lifecycle biweekly --auto-publish
npm run seo:run -- --run --lifecycle monthly

# View Results
npm run seo:run -- --list              # List recent pipeline runs
```

## Support

For questions or issues:
1. Check dashboard at `/admin/kpi`
2. Review gate logs in `packages/content/seo-bot/runs/`
3. Verify templates in `templates/`
4. Check thresholds in `client/src/lib/kpi-thresholds.ts`
