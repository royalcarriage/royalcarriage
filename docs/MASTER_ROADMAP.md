# MASTER ROADMAP — Royal Carriage SEO + Ads + Analytics System

**Created:** January 15, 2026  
**Status:** Bootstrap Phase Complete  
**Next Review:** After first data import + 30 pages generated

---

## Executive Summary

This roadmap outlines the complete implementation plan for Royal Carriage's profit-first SEO, advertising, and analytics automation system across 4 Firebase-hosted marketing sites. The system is designed to be **Google-compliant**, **data-driven**, and **PR-based** (no auto-publishing spam).

**Current State:**

- 1 of 4 sites exists (chicagoairportblackcar.com)
- Build system operational
- Comprehensive audits complete (64KB of findings)
- ROI intelligence layer scaffolded
- No mass content generation yet (by design)

**Next 90 Days Goal:**

- Fix conversion blockers on existing site
- Import first 30-90 days of Moovs + Ads data
- Generate first 25 profit-first SEO pages (with quality gates)
- Implement technical SEO foundations
- Establish PR-based publishing workflow

---

## Phase 0: AUDIT FINDINGS SUMMARY

### Critical Issues (Must Fix First):

**Technical SEO:**

1. ❌ No JSON-LD structured data (Schema.org)
2. ❌ No XML sitemap generation
3. ❌ No internal linking strategy
4. ❌ Content too thin (<1,000 words/page)
5. ❌ No robots.txt verification

**Performance:** 6. ❌ Images not optimized (5+ MB hero images) 7. ❌ No image lazy loading 8. ❌ No WebP conversion

**Conversion:** 9. ❌ No mobile sticky CTA bar 10. ❌ No trust signals above fold 11. ❌ Generic hero messaging (not differentiated) 12. ❌ No pricing anchors

**Data/Analytics:** 13. ❌ No GA4 implementation 14. ❌ No ROI data pipeline (now scaffolded) 15. ❌ No conversion tracking

---

## PHASE 1: CONVERSION BLOCKERS (Week 1-2)

**Goal:** Fix issues preventing current traffic from converting.

### 1.1 Mobile CTA Bar (HIGH IMPACT)

**File:** `client/src/components/MobileStickyCTA.tsx` (NEW)

**Implementation:**

```jsx
// Mobile sticky CTA (bottom bar, shows after scroll)
<div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white p-4 flex gap-2 md:hidden">
  <Button className="flex-1" href="tel:+12248013090">
    <Phone /> Call Now
  </Button>
  <Button className="flex-1" href={BOOKING_URL}>
    <Calendar /> Book Online
  </Button>
</div>
```

**Add to:** All page layouts  
**Trigger:** Show after user scrolls past hero (300px)  
**Expected Impact:** +15-30% mobile conversion rate

### 1.2 Image Optimization (HIGH IMPACT)

**Task:** Convert 5+ MB PNGs to WebP, create responsive sizes

**Script:** `scripts/optimize-images.mjs` (NEW)

**Actions:**

1. Convert all PNGs to WebP (target: <200 KB each)
2. Generate responsive sizes: 480w, 768w, 1024w, 1920w
3. Update `<img>` tags to `<picture>` elements
4. Add lazy loading: `loading="lazy"`
5. Preload hero images: `<link rel="preload" as="image" href="hero.webp">`

**Expected Impact:**

- LCP: 6s → <2.5s (meets Core Web Vitals)
- Bounce rate: -20-30% (faster loads)
- Mobile experience: significantly improved

### 1.3 Trust Signals Above Fold (MEDIUM IMPACT)

**File:** `client/src/components/Hero.tsx` (MODIFY)

**Add below hero:**

```jsx
<div className="flex justify-center gap-8 text-sm text-gray-600 mt-4">
  <span>⭐⭐⭐⭐⭐ 4.8/5 (200+ reviews)</span>
  <span>🚗 15+ vehicles</span>
  <span>✓ Licensed & insured</span>
</div>
```

**Expected Impact:** +10-15% conversion (trust builders)

### 1.4 Hero Message Differentiation (MEDIUM IMPACT)

**Update all hero sections:**

**Current (Generic):**

> "Chicago Airport Car Service – O'Hare & Midway"

**Recommended (Differentiated):**

> "Royal Carriage Airport Service — No Surge Pricing, Guaranteed Pickup"  
> "Scheduled black car • Fixed rates • Flight tracking"

**Key differentiators to emphasize:**

- "No surge pricing" (vs Uber/Lyft)
- "Scheduled pickup" (vs on-demand uncertainty)
- "Fixed quote" (vs surprise fees)
- "Professional chauffeur" (vs random driver)

### 1.5 Pricing Anchors (MEDIUM IMPACT)

**File:** `client/src/pages/Pricing.tsx` (MODIFY)

**Add sample pricing table:**

```
Sample Rates (Base Fare):
- O'Hare to Downtown: From $85* (Sedan) | $115* (SUV)
- Midway to Downtown: From $70* (Sedan) | $95* (SUV)
- Hourly Charter: $95/hr (3-hour minimum)

*Final price includes taxes, tolls, and gratuity. No surge pricing.
```

**Expected Impact:** +10-20% quote requests (reduces uncertainty)

---

## PHASE 2: TECHNICAL SEO FOUNDATIONS (Week 2-3)

**Goal:** Build SEO infrastructure before scaling content.

### 2.1 JSON-LD Structured Data (CRITICAL)

**Files:** `client/src/components/schemas/` (NEW DIRECTORY)

**Schemas to implement:**

1. **Organization Schema** (all pages)
   - LocalBusiness type
   - Contact info, hours, location
   - Logo, social profiles

2. **FAQ Schema** (pages with FAQs)
   - Converts accordion FAQs to rich snippets
   - Increases SERP real estate

3. **Service Schema** (service pages)
   - O'Hare, Midway, Corporate, etc.
   - Price range, availability

4. **Breadcrumb Schema** (all non-home pages)
   - Improves navigation in SERPs

5. **Product Schema** (fleet vehicles)
   - Each vehicle = product
   - Pricing, capacity, features

**Implementation approach:**

```jsx
// In SEO component:
<SEO
  title="..."
  description="..."
  schema={[organizationSchema, faqSchema, breadcrumbSchema]}
/>
```

**Expected Impact:**

- Rich snippets in SERPs (FAQ, ratings, price)
- Increased CTR from search: +15-30%
- Better understanding by Google

### 2.2 XML Sitemap Generation (CRITICAL)

**Script:** `scripts/generate-sitemap.mjs` (NEW)

**Implementation:**

1. Run after every build
2. Include all static pages
3. Include generated city/service pages
4. Priority: Home (1.0) → Services (0.9) → Cities (0.7) → Blog (0.6)
5. Changefreq: Homepage (weekly), Services (weekly), Cities (monthly)

**Add to build.ts:**

```typescript
console.log("generating sitemap...");
execSync("node scripts/generate-sitemap.mjs");
```

**Submit to:**

- Google Search Console
- Bing Webmaster Tools

### 2.3 Robots.txt + Meta Tags (HIGH PRIORITY)

**File:** `client/public/robots.txt` (CREATE/VERIFY)

**Content:**

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://chicagoairportblackcar.com/sitemap.xml
```

**Also add:**

- Language meta: `<html lang="en">`
- Geo tags for local SEO
- Twitter Card tags
- Open Graph images

### 2.4 Internal Linking Strategy (HIGH PRIORITY)

**Pattern:** Hub-and-spoke model

**Implementation:**

- Home (hub) links to all service pages (spokes)
- Each service page links to:
  - Related services (O'Hare ↔ Midway)
  - Relevant destinations (O'Hare → Downtown)
  - Fleet page (vehicle options)
  - Pricing page

**Contextual links in body content:**

```html
<p>
  Our <a href="/fleet">luxury sedans and SUVs</a> provide comfortable
  transportation from O'Hare to
  <a href="/airport-limo-downtown-chicago">downtown Chicago</a>.
</p>
```

**Rules:**

- 2-5 contextual links per page
- Varied anchor text (not exact-match spam)
- Relevant, helpful links (not forced)

### 2.5 Content Expansion (HIGH PRIORITY)

**Goal:** Bring all pages above 1,200 words (competitive threshold)

**Priority pages to expand:**

1. O'Hare Airport Limo (500 → 1,500 words) ⚠️ Very Thin
2. Midway Airport Limo (500 → 1,500 words) ⚠️ Very Thin
3. Home (800 → 1,200 words) ⚠️ Thin
4. Fleet (400 → 1,000 words) ❌ Very Thin
5. Pricing (500 → 1,000 words) ❌ Very Thin

**Content to add (O'Hare example):**

- Terminal-specific instructions (1, 2, 3, 5)
- Parking lot details (Cell Phone Lot)
- Popular destinations from O'Hare
- International arrival procedures
- Peak season considerations
- Comparison to CTA Blue Line
- Corporate account details
- 10-15 O'Hare-specific FAQs

**Format:**

- H1: Main keyword
- H2: Section headings (benefits, how it works, pricing, etc.)
- H3: Subsections
- FAQ accordion with schema

---

## PHASE 3: ANALYTICS & TRACKING (Week 3-4)

**Goal:** Measure everything before scaling.

### 3.1 Google Analytics 4 Implementation (CRITICAL)

**GA4 ID:** G-CC67CH86JR (from requirements)

**Implementation:**

```html
<!-- In client/index.html or App.tsx -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-CC67CH86JR"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-CC67CH86JR");
</script>
```

**Event tracking to implement:**

```typescript
// CTA clicks
gtag("event", "cta_click", {
  cta_location: "hero",
  cta_type: "book_online",
  page_path: window.location.pathname,
});

// Phone clicks
gtag("event", "phone_click", {
  phone_number: "(224) 801-3090",
  page_path: window.location.pathname,
});

// Form submissions
gtag("event", "form_submit", {
  form_type: "quote_request",
  service_type: "airport",
});
```

**Custom dimensions:**

- Service type (airport, corporate, wedding, party bus)
- Vehicle type (sedan, SUV, sprinter)
- User journey (first visit, repeat, returning)

### 3.2 Conversion Tracking (CRITICAL)

**Goals to track:**

1. **Phone Calls** - Click tel: links
2. **Moovs Booking Initiation** - Clicked "Book Online"
3. **Quote Form Submissions** - If form added
4. **Fleet Page Views** - Indicates high intent
5. **Pricing Page Views** - Indicates research phase

**Funnel definition:**

```
Homepage → Service Page → Pricing/Fleet → CTA Click → Moovs Portal
```

### 3.3 UTM Parameter Strategy (HIGH PRIORITY)

**Current issue:** All pages use `utm_source=airport`

**Recommended structure:**

```
utm_source=website
utm_medium=cta
utm_campaign={page-slug}  // e.g., ohare-airport-limo
utm_content={cta-location}  // e.g., hero-cta, footer-cta
```

**Benefits:**

- Track which pages drive conversions
- Track which CTA placements work best
- Attribute revenue in Moovs data

**Implementation:**

```typescript
// Dynamic per page:
const BOOKING_URL = `https://customer.moovs.app/royal-carriage-limousine/new/info?
  utm_source=website&
  utm_medium=cta&
  utm_campaign=${pageSlug}&
  utm_content=${ctaLocation}`;
```

### 3.4 Data Import & ROI Analysis (HIGH PRIORITY)

**Action:** Get real Moovs + Google Ads exports

**Steps:**

1. Export last 30-90 days of Google Ads data
   - See `/data/google-ads/README.md`
2. Export last 30-90 days of Moovs reservations
   - See `/data/moovs/README.md`
3. Export keyword research (Google Keyword Planner)
   - See `/data/keyword-research/README.md`
4. Run metrics import:
   ```bash
   npm run metrics:import
   ```
5. Review generated reports:
   - `/reports/roi-report.md`
   - `/reports/keyword-top100.md`

**Deliverables:**

- ROAS (Return on Ad Spend) by campaign/keyword
- Profit proxy by service type
- Top 100 keywords labeled SCALE vs FIX
- Keyword → landing page recommendations
- Service mix analysis

---

## PHASE 4: FIRST CONTENT GENERATION (Week 4-6)

**Goal:** Generate 25 profit-first pages with quality gates.

### 4.1 SEO Content System Architecture (IMPLEMENT)

**File structure:**

```
packages/content/seo-bot/
  queue/topics.json          # Proposed topics (prioritized)
  drafts/*.json             # DRAFT status pages
  published/*.json          # PUBLISHED status pages
  manifests/*.json          # Publish metadata (date, PR, etc.)
  runs/*.json               # Bot run logs
```

**Schemas (Zod):**

```typescript
// Topic
{
  id: string,
  keyword: string,
  intent: string, // airport_ohare, party_bus, etc.
  priority: number, // profit proxy score
  status: 'queue' | 'draft' | 'ready' | 'published',
  suggestedSite: string, // airport, partybus, executive, wedding
  suggestedPath: string, // /ohare-to-naperville
}

// Draft
{
  topic: Topic,
  title: string,
  metaDescription: string,
  slug: string,
  h1: string,
  outline: string[],
  bodyMd: string, // Markdown content
  schemaJsonLd: object[], // JSON-LD schemas
  internalLinks: {text: string, href: string}[],
  images: {entity: string, prompt: string}[],
  faq: {question: string, answer: string}[],
  wordCount: number,
  status: 'DRAFT' | 'READY' | 'PUBLISHED',
}

// PublishManifest
{
  draft: Draft,
  publishedDate: string,
  prNumber: number,
  buildPassed: boolean,
  gatesPassed: boolean,
}
```

### 4.2 Quality Gates (IMPLEMENT)

**Script:** `scripts/seo-quality-gate.mjs` (NEW)

**Hard fail checks:**

1. **Duplicate Detection:**
   - Exact title match → FAIL
   - Exact meta description match → FAIL
   - Semantic similarity > 0.85 → FAIL (use NLP library)

2. **Content Length:**
   - Service/city pages: ≥1,200 words
   - Blog posts: ≥900 words
   - FAQ pages: ≥800 words

3. **Required Sections:**
   - H1 tag (exactly 1)
   - Meta description (140-155 chars)
   - At least 2 internal links
   - At least 1 FAQ (with answer)
   - Canonical URL (correct domain)
   - JSON-LD schemas (Organization + page-specific)

4. **Keyword Stuffing Check:**
   - Keyword density ≤3% (avoid spam)
   - Keyword in H1: yes
   - Keyword in meta: yes
   - Natural language (not forced)

5. **Images:**
   - Hero image present
   - All images have alt text
   - Image entity mappings exist in manifest

6. **Local Relevance (for city pages):**
   - City mentioned ≥5 times
   - At least 1 local landmark/reference
   - Unique value proposition for that city

**Output:**

```json
{
  "passed": false,
  "errors": [
    "Title too similar to existing page (similarity: 0.92)",
    "Word count below threshold: 850 (need 1200)",
    "Missing FAQ section"
  ],
  "warnings": ["Keyword density high: 3.5% (target <3%)"]
}
```

### 4.3 First Wave: 25 Profit-First Pages (GENERATE)

**Site:** chicagoairportblackcar.com (primary site only)

**Page types:**

1. **Top Suburbs (10 pages):**
   - /city/naperville
   - /city/schaumburg
   - /city/oak-brook
   - /city/evanston
   - /city/elmhurst
   - /city/downers-grove
   - /city/aurora
   - /city/joliet
   - /city/wheaton
   - /city/palatine

2. **Route Pages (8 pages):**
   - /ohare-to-naperville
   - /ohare-to-downtown
   - /midway-to-naperville
   - /midway-to-schaumburg
   - /ohare-to-schaumburg
   - /downtown-to-ohare
   - /naperville-to-ohare
   - /chicago-suburbs-to-ohare

3. **Service Variations (7 pages):**
   - /hourly-chauffeur-chicago
   - /corporate-car-service
   - /executive-black-car-service
   - /sprinter-van-rental
   - /group-transportation-chicago
   - /airport-meet-and-greet
   - /business-travel-chicago

**Prioritization logic:**

- Sort by profit proxy: (search volume × CPC × margin × conversion rate estimate)
- Filter to high-intent (transactional) only
- Avoid brand terms (don't compete with yourself)
- Check existing Ads performance (if keyword already profitable, prioritize)

**Content template (city page example):**

```
H1: Airport Transportation to {City} – O'Hare & Midway Service

Intro (200 words):
- Service overview
- Why choose Royal Carriage for {City}
- Coverage area (downtown, suburbs, etc.)

H2: How It Works (150 words)
H2: {City} to O'Hare Airport (200 words)
  - Travel time
  - Route notes
  - Sample pricing
H2: {City} to Midway Airport (200 words)
H2: Popular Destinations in {City} (150 words)
  - Local landmarks
  - Business districts
  - Hotels
H2: Why Choose Royal Carriage (250 words)
  - Benefits (flight tracking, no surge, fixed rates)
  - Fleet options
  - Professional chauffeurs
H2: Pricing & Booking (150 words)
H2: FAQ (10 questions, 400 words)

Total: ~1,500 words
```

### 4.4 AI Content Generation (OPTIONAL)

**If LLM configured:**

**Provider setup:**

```
LLM_PROVIDER=gemini
LLM_API_KEY=your-key-here
```

**Script:** `scripts/providers/llm/gemini-provider.mjs` (NEW)

**Function:**

```typescript
async function generateDraft(topic, context) {
  const prompt = `
You are an expert SEO content writer for Royal Carriage Limousine, a premium black car service in Chicago.

Generate a unique, helpful, locally-relevant page about: ${topic.keyword}

Requirements:
- Target keyword: ${topic.keyword}
- Word count: 1,200-1,500 words
- Include local details specific to ${topic.city || "Chicago"}
- Emphasize differentiators: No surge pricing, scheduled pickup, flight tracking, professional chauffeurs
- Include 10 FAQs relevant to this service/location
- Write for actual customers, not search engines
- Avoid keyword stuffing or repetition

Context:
${JSON.stringify(context, null, 2)}

Output JSON format:
{
  "title": "...",
  "metaDescription": "...",
  "h1": "...",
  "bodyMd": "...",
  "faq": [{question, answer}, ...],
  "internalLinks": [{text, href}, ...]
}
`;

  const result = await callGeminiAPI(prompt);
  return parseAndValidate(result);
}
```

**Important:**

- If no LLM key → generate structured placeholders only
- Human review required before publishing
- Quality gates still apply (AI can fail gates too)

**Safety filters:**

- No competitor mentions (legal risk)
- No unverified claims ("best in Chicago")
- No fake reviews or testimonials
- No scraped content

### 4.5 PR-Based Publishing Workflow (IMPLEMENT)

**Never push directly to main/production.**

**Workflow:**

```
1. Run: npm run seo:run
   - Proposes topics
   - Generates drafts
   - Runs quality gates

2. If gates PASS:
   - Commit changes to feature branch: feature/seo-batch-{date}
   - Open PR with:
     - List of pages generated
     - Quality gate report
     - Word counts
     - Semantic similarity scores

3. Human review:
   - Spot-check 3-5 random pages
   - Verify local relevance
   - Check for keyword stuffing
   - Approve or request changes

4. Merge to main:
   - Triggers build + deploy
   - Pages go live

5. Monitor:
   - Check Google Search Console for indexing
   - Track rankings for target keywords
   - Measure traffic + conversions
```

**Gate failure:**

- Do NOT create PR
- Write remediation notes in `/reports/seo-gate-failures.md`
- Fix issues and re-run

---

## PHASE 5: MULTI-SITE EXPANSION (Week 7-12)

**Goal:** Replicate success to 3 additional domains.

### 5.1 Multi-Domain Firebase Hosting (SETUP)

**Current:** Single site deployment to chicagoairportblackcar.com

**Target:** 4 independent sites

**Firebase hosting targets:**

```json
{
  "hosting": [
    {
      "target": "airport",
      "public": "dist/airport",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "partybus",
      "public": "dist/partybus",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "executive",
      "public": "dist/executive",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "wedding",
      "public": "dist/wedding",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "admin",
      "public": "apps/admin/out",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```

**Domain mapping:**

```bash
firebase target:apply hosting airport chicagoairportblackcar
firebase target:apply hosting partybus chicago-partybus
firebase target:apply hosting executive chicagoexecutivecarservice
firebase target:apply hosting wedding chicagoweddingtransportation
firebase target:apply hosting admin royalcarriagelimoseo
```

**Deploy:**

```bash
firebase deploy --only hosting:airport
firebase deploy --only hosting:partybus
# ... etc
```

### 5.2 Site-Specific Content Strategy

#### Site #2: chicago-partybus.com

**Focus:** Party bus rentals, group events, bar hopping

**Key pages:**

- / (Home: Party bus rental Chicago)
- /birthday-party-bus
- /bachelor-bachelorette-party-bus
- /bar-hopping-party-bus
- /prom-party-bus
- /corporate-outing-party-bus
- /fleet (party buses only)
- /pricing (hourly rates)
- City pages: Naperville party bus, Schaumburg party bus, etc.

**Differentiation:**

- Emphasize capacity (14-20 passengers)
- Amenities (sound system, LED lighting, bar area)
- Itinerary flexibility
- No hidden fees

**Margin:** 35% (highest in portfolio)

#### Site #3: chicagoexecutivecarservice.com

**Focus:** Corporate transportation, hourly chauffeur, executive black car

**Key pages:**

- / (Home: Executive car service Chicago)
- /hourly-chauffeur
- /corporate-transportation
- /roadshow-transportation
- /business-meeting-transportation
- /airport-corporate (overlap with Site #1, different angle)
- /fleet (sedans and executive SUVs)
- /corporate-accounts
- City pages: Naperville corporate car, Schaumburg executive service, etc.

**Differentiation:**

- Professionalism (suited chauffeurs)
- Reliability (never late)
- Corporate billing (invoicing, account management)
- Confidentiality (privacy for executives)

**Margin:** 30%

#### Site #4: chicagoweddingtransportation.com

**Focus:** Wedding transportation, bridal party, guest shuttles

**Key pages:**

- / (Home: Wedding transportation Chicago)
- /bridal-party-transportation
- /guest-shuttle-service
- /ceremony-to-reception-transport
- /hotel-to-venue-shuttle
- /bachelor-party-limo (crossover with party bus)
- /fleet (stretch limos, SUVs, party buses)
- /wedding-packages
- Venue pages: Chicago wedding venues (Navy Pier, etc.)

**Differentiation:**

- Elegance (premium vehicles)
- Coordinated timing (multiple pickups)
- Photo opportunities (vintage limos)
- Stress-free (dedicated wedding coordinator)

**Margin:** 33%

### 5.3 Inter-Site Linking Strategy

**Goal:** Build authority across all 4 sites without triggering "link network" penalties.

**Allowed:**

- Footer link: "Part of Royal Carriage family: [Airport] [Party Bus] [Executive] [Wedding]"
- Contextual crossover: "Also offering [party bus rentals] for group events"
- Resource pages: "Complete guide to Chicago transportation" with links to all sites

**Not allowed:**

- Reciprocal links in every page footer (spam signal)
- Exact-match anchor text from all sites to one site
- Hidden links or link exchanges

**Best practice:**

- Each site is independent brand
- Mention other services when relevant
- Branded anchors ("Royal Carriage party bus") not keyword anchors

---

## PHASE 6: ADMIN DASHBOARD ENHANCEMENTS (Week 8-10)

**Goal:** Control center for content, images, analytics, deployment.

### 6.1 Admin UX Improvements (IMPLEMENT)

**File:** `apps/admin/` (rebuild as Next.js app or integrate into client)

**Current issue:** Only `next.config.js` exists, no actual admin app

**Recommended approach:**

1. Build admin as separate Next.js app (static export)
2. Or integrate admin into main client as protected routes
3. Authentication: Firebase Auth with role-based access

**Layout:**

- **Accordion sidebar** (opening one section closes others)
- **Bubble/pill buttons** (modern, compact design)
- **Reduced spacing** (more information density)

### 6.2 Admin Sections (REQUIRED)

#### 6.2.1 Overview Dashboard

**Path:** `/admin`

**Widgets:**

- Site status (last build, last deploy, uptime)
- Last SEO bot run result (passed/failed, pages generated)
- Missing images count (by site)
- Draft/Ready/Published page counts
- Top 10 keywords (by traffic this week)
- Revenue last 30 days (from Moovs import)
- ROAS last 30 days

#### 6.2.2 Content Management

**Path:** `/admin/content`

**Features:**

- View/edit `master_spec.json` (services, fleet, events)
- City batch controls:
  - Add new city (name, geo coords, suburbs)
  - Enable/disable city
  - Generate page for city
- Draft review:
  - List all drafts
  - Preview draft (markdown → HTML)
  - Edit draft manually
  - Move DRAFT → READY → PUBLISHED
  - Delete draft

#### 6.2.3 SEO Autobot

**Path:** `/admin/seo`

**Features:**

- Run buttons:
  - [Run Propose] → generates topic queue
  - [Run Draft] → generates drafts from queue
  - [Run Generate] → creates .astro/.mdx files
  - [Run Quality Gate] → validates drafts
  - [Run Full Pipeline] → all of the above
- Show latest gate report:
  - Display `/reports/seo-gate-report.md`
  - Highlight failures in red
  - Show similarity scores
- Topic queue view:
  - List prioritized topics
  - Approve/reject/reorder
- Settings:
  - Max pages per run (default: 25)
  - Similarity threshold (default: 0.85)
  - LLM provider (gemini/anthropic/openai)
  - Content length targets

#### 6.2.4 Images

**Path:** `/admin/images`

**Features:**

- Upload images:
  - Drag & drop interface
  - Auto-generate WebP versions
  - Auto-create responsive sizes
  - Add to manifest
- Manifest view:
  - Table: Entity, Image Count, Missing Count
  - Click to view entity images
- Missing images report:
  - Generated from `scripts/images-inventory.mjs`
  - List pages/entities missing images
  - Generate AI prompts for missing images
- Prompt requests:
  - View `/packages/content/images/prompt_requests.json`
  - Generate images with AI (if configured)

#### 6.2.5 Deploy

**Path:** `/admin/deploy`

**Features:**

- Safe deploy buttons per site:
  - [Deploy Airport Site]
  - [Deploy Party Bus Site]
  - [Deploy Executive Site]
  - [Deploy Wedding Site]
  - [Deploy Admin]
- Deploy history:
  - Last 10 deploys per site
  - Timestamp, user, status, duration
- Or instructions if no Firebase permissions:
  - "To deploy, run: firebase deploy --only hosting:airport"

#### 6.2.6 ROI/Analytics

**Path:** `/admin/analytics`

**Features:**

- Upload CSV buttons:
  - [Upload Google Ads CSV]
  - [Upload Moovs CSV]
  - [Upload Keyword Research CSV]
- Run metrics import:
  - [Run Import] → executes `npm run metrics:import`
  - Show output logs in real-time
- Summary view:
  - Display `/reports/roi-report.md` (rendered)
  - Display `/reports/keyword-top100.md` (table format)
  - Charts:
    - ROAS trend (last 90 days)
    - Revenue by service type (pie chart)
    - Top 10 keywords (bar chart)

#### 6.2.7 Settings

**Path:** `/admin/settings`

**Features:**

- Contact info:
  - Phone: (224) 801-3090
  - Booking URL: https://customer.moovs.app/...
  - GA4 ID: G-CC67CH86JR
- SEO thresholds:
  - Max publish per run (default: 25)
  - Similarity threshold (default: 0.85)
  - Min word count by page type
- Profit model:
  - Edit `/packages/content/profit_model.json`
  - Margins by service type
  - ROAS thresholds (SCALE vs FIX labels)
- LLM configuration:
  - Provider: gemini | anthropic | openai
  - API key (masked input)
  - Model: gemini-1.5-pro | claude-3-sonnet | gpt-4
  - Temperature: 0.7 (creativity slider)

### 6.3 Implementation Approach

**File-based reports consumed by admin** (static JSON in Firebase Hosting)

**OR**

**Firestore for job/run logs** (if real-time updates needed)

**Authentication:**

- Firebase Auth (email/password or Google sign-in)
- Firestore security rules:
  ```
  allow read, write: if request.auth != null &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  ```

---

## PHASE 7: AUTOMATION & WORKFLOWS (Week 10-12)

**Goal:** Scheduled analysis, periodic proposals, safe publishing.

### 7.1 GitHub Actions Workflows (IMPLEMENT)

#### Workflow #1: nightly-metrics.yml

**Trigger:** Daily at 2:00 AM CT (cron: `0 7 * * *` UTC)

**Jobs:**

1. Checkout repo
2. Install dependencies
3. Download CSVs from Firestore or Firebase Storage (if automated uploads enabled)
4. Run `npm run metrics:import`
5. Commit updated reports to branch: `metrics/daily-{date}`
6. Open PR with:
   - Title: "Daily metrics import - {date}"
   - Body: `/reports/roi-report.md` contents
   - Labels: `metrics`, `automated`

**Why PR, not direct commit:**

- Review anomalies (e.g., sudden ROAS drop)
- Verify data quality
- Prevent accidental overwrites

**Secrets needed:**

- `FIREBASE_SERVICE_ACCOUNT` (if downloading CSVs from Firestore)

#### Workflow #2: biweekly-seo-propose.yml

**Trigger:** Every 2 weeks, Monday 9:00 AM CT (cron: `0 14 * * 1`)

**Jobs:**

1. Checkout repo
2. Install dependencies
3. Run `npm run seo:propose` (proposes topics)
4. Run `npm run seo:draft` (generates drafts)
5. Run `npm run seo:generate` (creates .astro files)
6. Run `npm run seo:gate` (validates quality)
7. If gates PASS:
   - Commit to branch: `seo/batch-{date}`
   - Open PR with:
     - Title: "SEO content batch - {date}"
     - Body:
       - List of pages generated
       - Gate report summary
       - Word counts
       - Review checklist
     - Labels: `seo`, `content`, `needs-review`
8. If gates FAIL:
   - Do NOT open PR
   - Create issue with failure report
   - Label: `seo-gate-failure`

**Manual review required:**

- Spot-check 3-5 random pages
- Verify local relevance
- Approve PR to publish

**Frequency:** Every 2 weeks = ~12-13 batches/year = 300-325 pages/year (sustainable)

#### Workflow #3: weekly-quality.yml

**Trigger:** Every Monday 8:00 AM CT (cron: `0 13 * * 1`)

**Jobs:**

1. Checkout repo
2. Install dependencies
3. Run build: `npm run build`
4. Run tests: `npm test`
5. Run SEO verification:
   - `npm run verify:seo` (if script exists)
   - `npm run verify:links` (if script exists)
   - `npm run audit:images` (if script exists)
6. If any failures:
   - Open issue with:
     - Title: "Weekly quality check failures - {date}"
     - Body: Error logs
     - Labels: `quality`, `bug`
7. If all pass:
   - Comment on latest open PRs: "✅ Quality checks passed"

**Purpose:**

- Catch broken builds early
- Detect broken links (internal or external)
- Find missing images
- Prevent accumulation of tech debt

### 7.2 npm Scripts (IMPLEMENT)

**Add to root `package.json`:**

```json
{
  "scripts": {
    "metrics:import": "node scripts/metrics-import.mjs",
    "seo:propose": "node scripts/seo-propose.mjs",
    "seo:draft": "node scripts/seo-draft.mjs",
    "seo:generate": "node scripts/seo-generate.mjs",
    "seo:gate": "node scripts/seo-quality-gate.mjs",
    "seo:publish": "node scripts/seo-publish.mjs",
    "seo:run": "npm run seo:propose && npm run seo:draft && npm run seo:generate && npm run seo:gate",
    "verify:seo:full": "npm run seo:gate && npm run build && npm run verify:links && npm run audit:images",
    "verify:links": "node scripts/verify-links.mjs",
    "audit:images": "node scripts/audit-images.mjs",
    "images:inventory": "node scripts/images-inventory.mjs",
    "images:optimize": "node scripts/optimize-images.mjs"
  }
}
```

### 7.3 Secrets Management (CONFIGURE)

**GitHub Secrets (required if using APIs):**

1. `FIREBASE_SERVICE_ACCOUNT` (base64-encoded JSON)
   - Used for: Firebase deployment, Firestore access
   - How to add: Settings → Secrets → Actions → New repository secret

2. `GOOGLE_ADS_API_KEY` (optional)
   - Used for: Automated Google Ads data pull (if implementing API)
   - Alternative: Manual CSV uploads

3. `GOOGLE_SEARCH_CONSOLE_KEY` (optional)
   - Used for: Automated GSC data pull
   - Alternative: Manual Search Console reviews

4. `LLM_API_KEY` (optional)
   - Used for: AI content generation
   - Providers: Gemini, Anthropic, OpenAI
   - Alternative: Structured placeholder drafts only

**Never print secrets in logs:**

```bash
echo "Running metrics import..."
# ❌ Don't do this:
echo "Using API key: $LLM_API_KEY"
# ✅ Do this:
echo "LLM provider configured: yes"
```

**If secrets not provided:**

- Workflows run in "CSV-only mode"
- Manual data uploads required
- Placeholder drafts instead of AI-generated content

---

## PHASE 8: COMPLIANCE & QUALITY ASSURANCE (Ongoing)

**Goal:** Never trigger Google spam penalties.

### 8.1 Google Spam Policy Compliance Checklist

#### ✅ DO:

1. **Create helpful, unique content**
   - Each page serves a real user need
   - Unique information per city/service
   - Local landmarks, routes, specifics

2. **Use quality gates**
   - Semantic similarity checks
   - Minimum content length
   - Required sections (FAQ, benefits, etc.)

3. **PR-based publishing**
   - Human review before publish
   - Spot-check random pages
   - Reject thin/duplicate content

4. **Transparent comparisons**
   - Objective vs competitor comparisons OK
   - No false claims or disparagement
   - "No surge pricing" (true) vs "Best in Chicago" (subjective)

5. **Unique value per page**
   - City pages: local landmarks, specific routes
   - Service pages: different use cases, audiences
   - Route pages: travel time, pricing, popular destinations

#### ❌ DON'T:

1. **Mass thin pages**
   - No pages under 800 words (minimum)
   - No boilerplate content with keyword swaps
   - No "generated" feel (must read naturally)

2. **Doorway pages**
   - No pages that exist ONLY to rank, with no user value
   - No pages that redirect immediately to booking
   - No duplicate pages on multiple domains (same content, different URL)

3. **Keyword stuffing**
   - Keyword density ≤3%
   - Natural language, varied phrasing
   - Synonyms and related terms (not repetition)

4. **Scraped/unauthorized images**
   - Only use owned photos (actual fleet)
   - Or licensed stock photos (with proof)
   - Or AI-generated images (with manifest)
   - No Google Images scraping

5. **Fake reviews or claims**
   - No fabricated testimonials
   - No "Best in Chicago" without evidence
   - No "10,000 customers served" without data
   - Transparent about review sources

### 8.2 Content Quality Monitoring

**Weekly review (manual):**

- Random sample 5 pages
- Read for naturalness (does it sound human?)
- Check local relevance (are city details accurate?)
- Verify links work (internal + external)
- Check images load (all have alt text?)

**Monthly audit (automated):**

- Run duplicate detection across all pages
- Check for title/meta collisions
- Verify sitemap includes all pages
- Check robots.txt allows crawling
- Review Google Search Console for issues

**Quarterly deep dive:**

- Analyze which pages rank (GSC data)
- Identify pages with impressions but no clicks (poor titles/meta)
- Find pages with traffic but no conversions (CTA issues)
- Compare content length to competitors (falling behind?)
- Check for manual penalties (GSC → Security & Manual Actions)

### 8.3 Response Plan for Issues

**If Google issues warning:**

1. STOP all content generation immediately
2. Review flagged pages in Search Console
3. Identify pattern (thin content? duplicate? doorway?)
4. Fix or remove problematic pages
5. Submit reconsideration request
6. Update quality gates to prevent recurrence

**If rankings drop suddenly:**

1. Check Search Console for manual actions
2. Check for algorithm update (search SEO news)
3. Analyze lost rankings (which keywords, which pages)
4. Compare to competitors (did they improve or did we drop?)
5. Review recent content (was it low quality?)

**If conversions drop:**

1. Check Analytics for traffic drop (rankings issue)
2. Check if CTAs still work (Moovs portal live?)
3. Check mobile experience (Core Web Vitals)
4. A/B test different messaging
5. Review competitor sites (new pricing? new features?)

---

## PHASE 9: CONTINUOUS IMPROVEMENT (Month 3+)

**Goal:** Data-driven iteration and scaling.

### 9.1 Performance Metrics (KPIs)

**Traffic KPIs:**

- Organic search traffic (Google Analytics)
- Keyword rankings (Top 10, Top 20, Top 50)
- Impressions & CTR (Google Search Console)
- Branded vs non-branded traffic

**Conversion KPIs:**

- Phone call clicks (GA4 events)
- Booking button clicks (GA4 events)
- Moovs form submissions (if trackable)
- Conversion rate by page type (service, city, route)

**Revenue KPIs:**

- Google Ads spend (monthly)
- Moovs DONE revenue (monthly)
- ROAS (Revenue / Ad Spend)
- Profit proxy (Revenue - Costs - Ad Spend)
- Revenue by service type (airport, corporate, wedding, party bus)

**Content KPIs:**

- Pages published (total, per month)
- Pages ranking (Top 10, Top 20)
- Average page word count
- Average time on page (engagement)
- Bounce rate by page type

**Quality KPIs:**

- Quality gate pass rate (%)
- Duplicate content incidents (0 target)
- Manual penalties (0 target)
- Core Web Vitals (LCP <2.5s, FID <100ms, CLS <0.1)

### 9.2 Optimization Priorities

**Every 2 weeks:**

- Review top 100 keyword report
- Label keywords SCALE (increase bids) or FIX (pause/improve)
- Generate next batch of SEO pages (25 pages)
- Review and approve PR

**Every month:**

- Import Moovs + Ads data
- Calculate ROAS by campaign
- Analyze service mix (revenue distribution)
- Identify profit-first keywords for next month

**Every quarter:**

- Deep content audit (which pages perform, which don't)
- Competitor analysis (what are they doing better?)
- Update profit model (actual margins from accounting)
- Review and expand top-performing pages (1,500 → 2,000 words)

### 9.3 Scaling Roadmap

**After 100 pages published + 3 months data:**

1. Evaluate performance:
   - Are pages ranking? (Check GSC)
   - Are pages converting? (Check GA4)
   - Is content quality maintained? (Manual review)
2. If successful (ROAS >3.0, quality gates passing):
   - Increase publish rate: 25 → 50 pages per batch
   - Expand to long-tail keywords (lower volume, less competition)
   - Build blog content (informational intent)
3. If underperforming:
   - Pause generation
   - Analyze failures (not ranking? not converting?)
   - Improve existing pages before adding more
   - Adjust quality thresholds

**After 200 pages + 6 months:**

- Consider paid link building (guest posts, local directories)
- Build "hub" resource pages (comprehensive guides)
- Add video content (embedded YouTube)
- Implement review aggregation (Google, Yelp, Facebook)

---

## DELIVERABLES SUMMARY

### Reports (Done ✅):

- [x] `/reports/repo-audit.md` (16KB)
- [x] `/reports/site-ux-audit.md` (20KB)
- [x] `/reports/tech-seo-audit.md` (28KB)
- [x] `/reports/roi-report.md` (scaffold)
- [x] `/reports/keyword-top100.md` (scaffold)

### Data Infrastructure (Done ✅):

- [x] `/data/google-ads/README.md` (4KB)
- [x] `/data/moovs/README.md` (7KB)
- [x] `/data/keyword-research/README.md` (7KB)
- [x] `/packages/content/profit_model.json` (4KB)
- [x] `scripts/metrics-import.mjs` (22KB)
- [x] `npm run metrics:import` (working)

### To Build (Phase 1-2):

- [ ] Mobile sticky CTA component
- [ ] Image optimization script
- [ ] Trust signals component
- [ ] JSON-LD schema components
- [ ] XML sitemap generator
- [ ] Internal linking implementation
- [ ] Content expansion (bring pages to 1,200+ words)

### To Build (Phase 3-4):

- [ ] GA4 implementation + event tracking
- [ ] UTM parameter strategy
- [ ] SEO content system (seo-bot/)
- [ ] Quality gate script
- [ ] First 25 profit-first pages
- [ ] PR-based publish workflow

### To Build (Phase 5-7):

- [ ] Multi-domain Firebase hosting config
- [ ] 3 additional sites (party bus, executive, wedding)
- [ ] Admin dashboard (Next.js app)
- [ ] GitHub Actions workflows (3 workflows)
- [ ] Image management system

---

## NEXT IMMEDIATE ACTIONS (This Week)

1. **Fix vite.config.ts build issue** ✅ DONE
2. **Run comprehensive audits** ✅ DONE
3. **Create data folder structure** ✅ DONE
4. **Implement metrics import script** ✅ DONE
5. **Write this roadmap** ✅ DONE

### Week 1 Priority:

6. ⬜ Add mobile sticky CTA bar
7. ⬜ Optimize hero images (5 MB → <200 KB WebP)
8. ⬜ Add trust signals above fold
9. ⬜ Implement GA4 tracking
10. ⬜ Get real Moovs + Ads data, run first import

### Week 2 Priority:

11. ⬜ Add JSON-LD schemas (Organization, FAQ)
12. ⬜ Generate XML sitemap
13. ⬜ Expand O'Hare page to 1,500 words
14. ⬜ Expand Midway page to 1,500 words
15. ⬜ Implement quality gate script

**Target:** All Phase 1-2 complete by end of Week 2.

---

## STOP CONDITIONS & WARNINGS

⚠️ **DO NOT PROCEED** if:

- Quality gates consistently failing (>50% fail rate)
- Manual Google penalty received
- ROAS drops below 1.0 for 2+ months
- Duplicate content detected across sites
- Conversion rate drops >30% after changes

⚠️ **PAUSE & REVIEW** if:

- Pages not ranking after 60 days
- High bounce rate (>80%) on new pages
- Low time on page (<30 seconds)
- No conversions from organic traffic after 90 days

⚠️ **REQUEST CREDENTIALS** to proceed:

- Firebase service account (for deploy)
- Google Ads API access (for automated imports)
- LLM API key (for AI content generation)

---

## SUCCESS CRITERIA (90 Days)

**Metrics:**

- 25+ SEO pages published
- 10+ pages ranking in Top 20
- ROAS ≥2.0 (break-even at minimum)
- 0 Google manual penalties
- Core Web Vitals: all "Good" (green)
- Mobile conversion rate +20% (from sticky CTA)
- Page load time <3 seconds

**Operational:**

- Metrics import running monthly
- SEO bot generating 25 pages biweekly
- Quality gates passing ≥90%
- PR-based workflow established
- Admin dashboard functional

**Business:**

- Clear ROI attribution (Moovs ↔ Google Ads)
- Profit model validated with real data
- Service mix optimized (focusing on high-margin services)
- Keyword strategy data-driven (SCALE vs FIX)

---

**Roadmap Version:** 1.0  
**Last Updated:** January 15, 2026  
**Next Review:** After first data import + 25 pages published  
**Owner:** Royal Carriage Limousine + GitHub Copilot Agent
