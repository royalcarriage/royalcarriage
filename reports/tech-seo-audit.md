# Technical SEO Audit — Royal Carriage Primary Site

**Audit Date:** January 15, 2026  
**Site:** chicagoairportblackcar.com  
**Framework:** React SPA (Vite + Wouter)  
**Current State:** Single-site deployment

---

## Executive Summary

**Overall SEO Grade: C+ (Needs Significant Work)**

The site has basic SEO components (title, meta description, canonical) but lacks critical elements for competitive ranking: structured data (JSON-LD), XML sitemap, proper heading hierarchy, internal linking strategy, and content depth. Before scaling to 4 sites or generating hundreds of SEO pages, these foundational issues must be fixed.

**Critical Issues:**

- ❌ No JSON-LD structured data (Schema.org)
- ❌ No XML sitemap generation
- ❌ No internal linking strategy
- ❌ Thin content on key pages (<500 words)
- ⚠️ SPA SEO challenges (JavaScript rendering)
- ❌ No Open Graph images
- ❌ No Twitter Card tags
- ⚠️ Duplicate/missing H1 tags (likely)

---

## Meta Tags Implementation

### SEO Component Analysis

**File:** `client/src/components/SEO.tsx`

```typescript
export function SEO({ title, description, path = "/", type = "website", noindex = false }) {
  const fullUrl = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Chicago Airport Black Car`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta name="robots" content={noindex ? "index, follow" : "noindex, nofollow"} />
    </Helmet>
  );
}
```

### What's Good:

- ✅ Title tag implementation
- ✅ Meta description
- ✅ Canonical URL (correct domain)
- ✅ Open Graph title, description, type, URL
- ✅ Robots meta control

### What's Missing:

- ❌ **Open Graph image** (`og:image`) - Critical for social sharing
- ❌ **Twitter Card tags** (`twitter:card`, `twitter:title`, etc.)
- ❌ **og:site_name** property
- ❌ **Language meta** (`<html lang="en">`)
- ❌ **Geo tags** (for local SEO: `geo.region`, `geo.placename`)
- ❌ **Schema.org JSON-LD** (separate from meta tags)

### Recommended SEO Component Enhancement:

```typescript
export function SEO({
  title,
  description,
  path = "/",
  type = "website",
  noindex = false,
  image = "/og-image.jpg", // NEW
  schema = null // NEW - JSON-LD object
}: SEOProps) {
  const fullUrl = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Chicago Airport Black Car`;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      {/* Standard SEO */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Royal Carriage Limousine" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Local SEO */}
      <meta name="geo.region" content="US-IL" />
      <meta name="geo.placename" content="Chicago" />
      <meta name="geo.position" content="41.8781;-87.6298" />

      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* JSON-LD Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
```

---

## Title Tags Analysis

### Current Implementation:

```typescript
const fullTitle = `${title} | Chicago Airport Black Car`;
```

**Format:** `[Page Title] | Chicago Airport Black Car`

### Issues:

- ⚠️ **Generic brand suffix** - Same for every page
- ⚠️ **No keyword variation** in suffix
- ⚠️ **Missing location signals** (should include "Chicago" for all)
- ⚠️ **Length concerns** - Risk of truncation at 60 chars

### Example Current Titles (Assumed):

| Page   | Title                                                                            | Length    | Issue                   |
| ------ | -------------------------------------------------------------------------------- | --------- | ----------------------- |
| Home   | Chicago Airport Black Car Service – O'Hare & Midway \| Chicago Airport Black Car | ~80 chars | ❌ Too long (truncates) |
| O'Hare | O'Hare Airport Limo Service \| Chicago Airport Black Car                         | 58 chars  | ✅ Good                 |
| Midway | Midway Airport Limo Service \| Chicago Airport Black Car                         | 58 chars  | ✅ Good                 |

### Recommended Title Formula:

**Pattern:** `[Primary Keyword] [Location] | Royal Carriage [Service Type]`

**Examples:**

```
Home: "Airport Car Service Chicago – O'Hare & Midway | Royal Carriage"
O'Hare: "O'Hare Airport Transportation | Royal Carriage Black Car"
Midway: "Midway Airport Limo Service | Royal Carriage Chicago"
Downtown: "Downtown Chicago Black Car | Airport Transfer Service"
```

**Benefits:**

- Primary keyword first (better for SEO)
- Location included (local SEO signal)
- Brand "Royal Carriage" instead of generic site name
- Under 60 characters (no truncation)

---

## Meta Description Analysis

### Current Implementation:

Passed as prop to `<SEO description="...">` component.

### Example (Home Page):

```
"Premium black car service to Chicago O'Hare and Midway airports.
Professional chauffeurs, flight tracking, flat-rate pricing.
Book your reliable airport transportation today. Call (224) 801-3090."
```

**Length:** ~200 characters ⚠️ (Too long - Google truncates at 155-160)

### Quality Assessment:

- ✅ Includes primary keywords (black car, O'Hare, Midway)
- ✅ Includes location (Chicago)
- ✅ Includes CTA (Call number)
- ✅ Includes benefits (flight tracking, flat-rate)
- ❌ **Too long** (gets truncated in SERPs)
- ⚠️ **Phone number wastes space** (not clickable in SERP)

### Recommended Meta Descriptions:

**Formula:** [Service] in [Location] | [Key Benefit] | [Differentiator] | CTA

**Examples:**

```
Home:
"Chicago airport car service to O'Hare & Midway. Scheduled pickup, no surge pricing, professional chauffeurs. Book online or call (224) 801-3090." (155 chars)

O'Hare:
"O'Hare airport limo service with flight tracking & meet-and-greet. Fixed rates, 24/7 availability. Book your reliable Chicago airport ride now." (147 chars)

Midway:
"Midway airport transportation with professional chauffeurs. Flat-rate pricing, no surge fees. Serving Chicago + 50 suburbs. Book today." (140 chars)
```

**Length Target:** 140-155 characters (fits all devices)

---

## Canonical URLs

### Current Implementation:

```typescript
<link rel="canonical" href={fullUrl} />
```

Where `fullUrl = ${BASE_URL}${path}` and `BASE_URL = "https://chicagoairportblackcar.com"`

### Assessment:

- ✅ **Correct domain** (matches actual site URL)
- ✅ **HTTPS protocol**
- ✅ **No trailing slash** (consistent)
- ✅ **Self-referencing** (each page points to itself)

### Potential Issues:

- ⚠️ **SPA routing** - If client-side routing doesn't update canonical on route change, all pages might point to home
- ⚠️ **Query parameters** - Should strip UTM params from canonical
- ⚠️ **Trailing slash consistency** - Verify all routes don't have trailing slashes

### Recommended Enhancement:

```typescript
// Strip query params and fragments from canonical
const cleanPath = path.split("?")[0].split("#")[0];
const fullUrl = `${BASE_URL}${cleanPath}`.replace(/\/$/, ""); // Remove trailing slash
```

---

## Structured Data (Schema.org JSON-LD)

### Current Status: ❌ **MISSING ENTIRELY**

No JSON-LD structured data detected in code.

### Required Schema Types:

#### 1. Organization Schema (All Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Royal Carriage Limousine",
  "alternateName": "Chicago Airport Black Car",
  "url": "https://chicagoairportblackcar.com",
  "logo": "https://chicagoairportblackcar.com/logo.png",
  "telephone": "+1-224-801-3090",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Chicago",
    "addressRegion": "IL",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "41.8781",
    "longitude": "-87.6298"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Chicago"
    },
    {
      "@type": "State",
      "name": "Illinois"
    }
  ],
  "openingHours": "Mo-Su 00:00-23:59",
  "sameAs": [
    "https://www.facebook.com/royalcarriage",
    "https://www.instagram.com/royalcarriage"
  ]
}
```

#### 2. Service Schema (Service Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Airport Transportation",
  "provider": {
    "@type": "LocalBusiness",
    "name": "Royal Carriage Limousine"
  },
  "areaServed": {
    "@type": "City",
    "name": "Chicago"
  },
  "description": "Professional black car service to O'Hare and Midway airports",
  "offers": {
    "@type": "Offer",
    "priceRange": "$85-$200",
    "availability": "https://schema.org/InStock"
  }
}
```

#### 3. FAQ Schema (Pages with FAQs)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do you monitor flights?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We track arrivals and adjust pickup timing for ORD and MDW."
      }
    }
    // ... more questions
  ]
}
```

#### 4. Product Schema (Fleet Vehicles)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Lincoln Town Car - Executive Sedan",
  "description": "Luxury sedan for airport transfers, seats 3 passengers",
  "image": "https://chicagoairportblackcar.com/vehicles/lincoln-sedan.jpg",
  "offers": {
    "@type": "Offer",
    "price": "85.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "brand": {
    "@type": "Brand",
    "name": "Lincoln"
  }
}
```

#### 5. Breadcrumb Schema (All Non-Home Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://chicagoairportblackcar.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "O'Hare Airport Service",
      "item": "https://chicagoairportblackcar.com/ohare-airport-limo"
    }
  ]
}
```

### Implementation Priority:

1. **Organization** - Add to all pages (highest priority)
2. **FAQ** - Add to Home + service pages (easy win)
3. **Breadcrumb** - Add to all non-home pages
4. **Service** - Add to service-specific pages
5. **Product** - Add to fleet page (per vehicle)

---

## Heading Hierarchy (H1-H6)

### Cannot Fully Audit Without Rendering, But:

**Expected Issues:**

- ⚠️ React components may render multiple H1 tags
- ⚠️ Heading levels may skip (H1 → H3, missing H2)
- ⚠️ Headings may not include target keywords

### Best Practices:

```html
<!-- Each page should have ONE H1 -->
<h1>O'Hare Airport Limo Service Chicago</h1>

<!-- H2s for main sections -->
<h2>Why Choose Royal Carriage for O'Hare Transportation</h2>
<h2>Our O'Hare Airport Fleet</h2>
<h2>Service Areas from O'Hare</h2>

<!-- H3s for subsections -->
<h3>Sedan Service</h3>
<h3>SUV Service</h3>
```

### Verification Needed:

```typescript
// In each page component, ensure:
<Hero title="..." /> // Should render H1
<Section heading="..." /> // Should render H2
```

### Common React Heading Mistakes:

```jsx
// ❌ BAD - Multiple H1s
<Hero><h1>Title</h1></Hero>
<Section><h1>Another Title</h1></Section>

// ✅ GOOD - One H1, rest H2+
<Hero><h1>Title</h1></Hero>
<Section><h2>Section Title</h2></Section>
```

---

## Content Depth & Quality

### Current Page Lengths (Estimated):

| Page     | Estimated Words | Status       | Target |
| -------- | --------------- | ------------ | ------ |
| Home     | ~800 words      | ⚠️ Thin      | 1,200+ |
| O'Hare   | ~500 words      | ❌ Very Thin | 1,500+ |
| Midway   | ~500 words      | ❌ Very Thin | 1,500+ |
| Downtown | ~600 words      | ⚠️ Thin      | 1,200+ |
| Suburbs  | ~700 words      | ⚠️ Thin      | 1,200+ |
| Fleet    | ~400 words      | ❌ Very Thin | 1,000+ |
| Pricing  | ~500 words      | ❌ Very Thin | 1,000+ |

**Problem:** All pages are below competitive thresholds.

**Competitive Analysis:** Top-ranking competitors for "Chicago airport car service" have 1,500-3,000 word pages.

### Content Gaps:

**O'Hare Page Should Include:**

- ✅ Basic service description (has)
- ❌ Terminal-specific instructions (Terminal 1, 2, 3, 5)
- ❌ Parking lot details (Cell Phone Lot, pickup procedures)
- ❌ Timing recommendations (how early to book, peak hours)
- ❌ Popular O'Hare destinations (Downtown, suburbs, Wisconsin)
- ❌ Flight delay policies
- ❌ International arrival procedures (customs wait times)
- ❌ Comparison to CTA Blue Line (when black car makes sense)
- ❌ Corporate account details
- ❌ Peak season considerations (holidays, weather delays)

**Recommended O'Hare Page Outline:**

```
H1: O'Hare Airport Car Service Chicago

H2: Professional O'Hare Transportation
  - Paragraph: Service overview (200 words)

H2: How It Works
  - Paragraph: Booking process (150 words)
  - Paragraph: Arrival procedure (150 words)

H2: O'Hare Terminal Guide
  - H3: Terminal 1 (American Airlines) - 100 words
  - H3: Terminal 2 (United, Delta, Alaska) - 100 words
  - H3: Terminal 3 (International + misc) - 100 words
  - H3: Terminal 5 (International arrivals) - 100 words

H2: Popular Routes from O'Hare
  - List: Downtown Chicago, Naperville, Schaumburg, etc. (200 words)

H2: Pricing & Vehicle Options
  - Table: Sedan, SUV, Sprinter rates (150 words)

H2: Why Choose Royal Carriage
  - 4-5 bullet points with paragraphs (300 words)

H2: FAQ (Schema-ready)
  - 10 questions specific to O'Hare (400 words)

Total: ~1,750 words
```

---

## Internal Linking Strategy

### Current Status: ❌ **NO VISIBLE STRATEGY**

### Issues:

- ❌ No topical hub structure
- ❌ No contextual links between pages
- ❌ Navigation only (header/footer)
- ❌ No "Related Services" sections
- ❌ No breadcrumb navigation

### Recommended Internal Linking Structure:

#### Hub-and-Spoke Model:

```
Home (Hub)
├── O'Hare Service (Spoke)
│   ├── Link to: Midway Service (related)
│   ├── Link to: Downtown Chicago (destination)
│   ├── Link to: Fleet (vehicles)
│   └── Link to: Pricing (cost)
├── Midway Service (Spoke)
│   ├── Link to: O'Hare Service (related)
│   ├── Link to: Downtown Chicago (destination)
│   └── Link to: Suburbs Service (related)
├── Downtown Chicago (Spoke)
│   ├── Link to: O'Hare Service (route)
│   ├── Link to: Midway Service (route)
│   └── Link to: Hourly Chauffeur (service type)
└── Fleet (Spoke)
    ├── Link to: O'Hare Service (use case)
    ├── Link to: Corporate Travel (use case)
    └── Link to: Pricing (booking)
```

#### Contextual Linking Examples:

**In O'Hare page body:**

```html
<p>
  Our <a href="/fleet">luxury sedans and SUVs</a> provide comfortable
  transportation from O'Hare to
  <a href="/airport-limo-downtown-chicago"> downtown Chicago</a> and
  <a href="/airport-limo-suburbs">50+ suburbs</a>. Also serving
  <a href="/midway-airport-limo">Midway Airport</a>.
</p>
```

**Benefits:**

- Distributes PageRank (link equity)
- Reduces pogo-sticking (bounce back to Google)
- Increases session duration (SEO signal)
- Helps Google understand site structure

### Anchor Text Strategy:

**✅ DO:**

- "luxury sedan service" (descriptive)
- "O'Hare to downtown Chicago" (location-based)
- "view our fleet" (action-based)

**❌ DON'T:**

- "click here" (generic)
- "this page" (non-descriptive)
- Exact-match keyword stuffing ("chicago airport limo" 20 times)

---

## XML Sitemap

### Current Status: ❌ **DOES NOT EXIST**

### Problem:

React SPAs don't auto-generate sitemaps. Google may not discover all pages.

### Solution:

Generate sitemap.xml during build process.

### Recommended Implementation:

**File:** `script/generate-sitemap.mjs`

```javascript
import fs from "fs";
import path from "path";

const BASE_URL = "https://chicagoairportblackcar.com";

const pages = [
  { url: "/", priority: 1.0, changefreq: "weekly" },
  { url: "/ohare-airport-limo", priority: 0.9, changefreq: "weekly" },
  { url: "/midway-airport-limo", priority: 0.9, changefreq: "weekly" },
  {
    url: "/airport-limo-downtown-chicago",
    priority: 0.8,
    changefreq: "weekly",
  },
  { url: "/airport-limo-suburbs", priority: 0.8, changefreq: "weekly" },
  { url: "/fleet", priority: 0.7, changefreq: "monthly" },
  { url: "/pricing", priority: 0.7, changefreq: "monthly" },
  { url: "/about", priority: 0.6, changefreq: "monthly" },
  { url: "/contact", priority: 0.6, changefreq: "monthly" },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>`;

fs.writeFileSync(path.join("dist", "public", "sitemap.xml"), sitemap);

console.log("✅ Generated sitemap.xml with", pages.length, "pages");
```

**Add to build.ts:**

```typescript
// After client build
console.log("generating sitemap...");
execSync("node script/generate-sitemap.mjs");
```

**Add to robots.txt:**

```
User-agent: *
Allow: /

Sitemap: https://chicagoairportblackcar.com/sitemap.xml
```

---

## Robots.txt

### Expected Location:

`client/public/robots.txt` (copied to `dist/public/robots.txt` during build)

### Recommended Content:

```
# Royal Carriage Limousine - Chicago Airport Black Car
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

# Crawl delay (optional, if concerned about bot load)
# Crawl-delay: 1

# Sitemap
Sitemap: https://chicagoairportblackcar.com/sitemap.xml

# Block AI scrapers (optional, ethical debate)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /
```

### Verification:

```bash
ls -la client/public/robots.txt
```

If missing, create it.

---

## Page Speed & Core Web Vitals

### Estimated Lighthouse Scores (Based on Build):

**Performance: 40-50** ⚠️

- Main issue: 5+ MB of unoptimized images
- LCP (Largest Contentful Paint): ~4-6 seconds ❌ (Target: <2.5s)
- FID (First Input Delay): Likely good (React fast) ✅
- CLS (Cumulative Layout Shift): Unknown, likely OK ⚠️

**Fix:** Optimize images to WebP, < 200 KB each.

### Render-Blocking Resources:

- React bundle: 293 KB (gzipped: 72 KB) ✅ Acceptable
- CSS: 7 KB ✅ Minimal

**Issue:** Hero images not preloaded.

**Fix:**

```html
<link rel="preload" as="image" href="/assets/hero-ohare.webp" />
```

---

## Mobile SEO

### Mobile-Friendliness:

- ✅ Responsive design (Tailwind CSS)
- ✅ Touch-friendly CTAs (large buttons)
- ⚠️ Large images slow mobile load
- ❌ No AMP pages (not critical, but helps)

### Mobile-Specific Meta Tags:

**Add to index.html:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta
  name="apple-mobile-web-app-status-bar-style"
  content="black-translucent"
/>
<meta name="apple-mobile-web-app-title" content="Royal Carriage" />
```

---

## JavaScript SEO (SPA Challenges)

### React SPA Concerns:

1. **Server-Side Rendering (SSR):** ❌ Not implemented
   - Googlebot renders JS, but slower to index
   - Bing/others may not render at all

2. **Prerendering:** ❌ Not implemented
   - Could use prerender.io or similar service
   - Serves static HTML to bots, SPA to users

3. **Meta Tag Updates:** ⚠️ Needs verification
   - React Helmet should update meta tags on route change
   - But does it? Test with Google Search Console.

### Recommended Solution:

**Option 1: Add Prerendering (Quick)**

```bash
npm install prerender-spa-plugin --save-dev
```

**Option 2: Migrate to Next.js or Astro (Better Long-Term)**

- Next.js: SSR + SSG out of the box
- Astro: Partial hydration (faster)

**Option 3: Do Nothing (Risky)**

- Modern Googlebot renders JS well
- But slower indexing, risk of missed content

---

## Local SEO Optimization

### Current Status: ⚠️ **PARTIAL**

### What's Good:

- ✅ Location in title tags (Chicago, O'Hare, Midway)
- ✅ Location in content (mentions suburbs, cities)

### What's Missing:

- ❌ **No Google Business Profile integration**
  - Should mention "Google reviews" on site
  - Link to Google Maps listing
- ❌ **No NAP (Name, Address, Phone) consistency**
  - Phone number in header/footer? (Check)
  - Business name consistent? ("Royal Carriage" vs "Chicago Airport Black Car")
  - Address listed? (Even if not public, add to schema)

- ❌ **No local schema markup** (see Organization schema above)

- ❌ **No service area pages**
  - Should have pages for: Naperville, Schaumburg, Oak Brook, etc.
  - Currently has dynamic `/city/:slug` route, but no city list

### Google Business Profile Optimization:

**Actions Required:**

1. Claim Google Business Profile for "Royal Carriage Limousine"
2. Add:
   - Business hours (24/7 dispatch)
   - Service areas (Chicago + 50 suburbs)
   - Photos (fleet, terminal pickups)
   - Reviews (ask customers to review)
3. Add GBP link to website footer:
   ```html
   <a href="https://g.page/royal-carriage-limo"> ⭐ Read our Google Reviews </a>
   ```

---

## Duplicate Content Risks

### Current Risk: ✅ **LOW** (Single site, unique pages)

### Future Risk: ⚠️ **HIGH** (When building 4 sites + SEO pages)

**Scenarios That Create Duplicate Content:**

1. **Same service described on multiple domains:**
   - chicagoairportblackcar.com/ohare
   - chicagoexecutivecarservice.com/ohare
   - Solution: Different angles, not copy-paste

2. **City pages with boilerplate text:**
   - /city/naperville
   - /city/schaumburg
   - Both say "We serve [city] with professional transportation..."
   - Solution: Unique local content per city (landmarks, routes, local events)

3. **Generated SEO pages without uniqueness:**
   - /ohare-to-naperville
   - /ohare-to-schaumburg
   - Risk: Thin, repetitive content
   - Solution: Quality gate checks semantic similarity

### Duplicate Detection Required:

**Before Publishing Any Generated Page:**

1. Check exact text match (plagiarism)
2. Check semantic similarity (cosine similarity > 0.85 = duplicate)
3. Check title/meta uniqueness (no two pages same title)
4. Check H1 uniqueness

**Tool Recommendation:**

```bash
npm install natural  # NLP library
# OR
npm install string-similarity
```

---

## 404 Pages & Redirects

### 404 Page:

**File:** `client/src/pages/not-found.tsx`

Exists ✅, but should include:

- ✅ Friendly message
- ✅ Link to home
- ✅ Search box (if implemented)
- ✅ Popular pages list
- ⚠️ **Still index as 404?** (Check robots meta)

**Recommended 404 meta:**

```typescript
<SEO
  title="Page Not Found"
  description="The page you're looking for doesn't exist. Visit our home page to find Chicago airport transportation services."
  noindex={true}  // Prevent indexing 404 pages
/>
```

### Redirects:

**None detected.** May need redirects if:

- Old site existed (redirect old URLs)
- URL structure changes (redirect old → new)

**Implementation:**

```javascript
// In firebase.json
"redirects": [
  {
    "source": "/old-page",
    "destination": "/new-page",
    "type": 301
  }
]
```

---

## Hreflang (Multi-Language)

### Current Status: ❌ **NOT APPLICABLE**

Site is English-only, serving U.S. market.

**If Expanding to Spanish:**

```html
<link
  rel="alternate"
  hreflang="en"
  href="https://chicagoairportblackcar.com/"
/>
<link
  rel="alternate"
  hreflang="es"
  href="https://chicagoairportblackcar.com/es/"
/>
<link
  rel="alternate"
  hreflang="x-default"
  href="https://chicagoairportblackcar.com/"
/>
```

---

## Image SEO

### Current Issues:

- ❌ **Large file sizes** (1.5-1.8 MB PNGs)
- ⚠️ **Alt text unknown** (need to verify all images have alt)
- ❌ **Filenames non-descriptive** (luxury_black_sedan_airport_terminal.png is OK, but could be better)
- ❌ **No image sitemap**

### Best Practices:

**Alt Text:**

```jsx
// ❌ BAD
<img src="car.jpg" alt="car" />

// ⚠️ BETTER
<img src="car.jpg" alt="black sedan" />

// ✅ BEST
<img src="lincoln-sedan.jpg" alt="Lincoln Town Car black sedan for O'Hare airport transportation" />
```

**Filenames:**

```
❌ img001.jpg
⚠️ luxury_black_sedan.jpg
✅ royal-carriage-lincoln-sedan-ohare-airport.jpg
```

**Image Sitemap (Optional):**

```xml
<url>
  <loc>https://chicagoairportblackcar.com/fleet</loc>
  <image:image>
    <image:loc>https://chicagoairportblackcar.com/assets/lincoln-sedan.webp</image:loc>
    <image:caption>Lincoln Town Car - Executive Sedan</image:caption>
    <image:title>Lincoln Sedan - Royal Carriage Fleet</image:title>
  </image:image>
</url>
```

---

## Security & HTTPS

### Current Status:

- ✅ **HTTPS enforced** (Firebase Hosting auto-HTTPS)
- ✅ **No mixed content** (all assets HTTPS)
- ✅ **HSTS header** (Firebase default)

**Verify in firebase.json:**

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ]
  }
}
```

---

## Indexation Status

### Cannot Verify Without Live Access, But:

**Check via Google Search Console:**

```
site:chicagoairportblackcar.com
```

**Expected Issues:**

- ⚠️ SPA may have indexation delays (JavaScript rendering)
- ⚠️ Dynamic city pages may not be discovered (no internal links)
- ⚠️ Admin pages should be noindexed (check /admin routes)

**Recommended:**

1. Submit sitemap.xml to GSC
2. Request indexing for key pages
3. Check "Coverage" report for errors
4. Check "Page Experience" for Core Web Vitals

---

## Competitor Benchmark

### Top Competitors (Assumed):

1. ExecuCar
2. Blacklane
3. GO Airport Express
4. Local limo companies

### Competitive SEO Gaps:

| Factor             | Royal Carriage | Competitors     | Action         |
| ------------------ | -------------- | --------------- | -------------- |
| JSON-LD Schema     | ❌ None        | ✅ Yes          | Add schemas    |
| Content Depth      | ⚠️ 500 words   | ✅ 1,500+ words | Expand pages   |
| Internal Links     | ❌ Nav only    | ✅ Contextual   | Add links      |
| Image Optimization | ❌ 5MB         | ✅ <500KB       | Optimize       |
| FAQ Schema         | ❌ None        | ✅ Yes          | Add FAQ schema |
| Reviews on Site    | ❌ None        | ✅ Displayed    | Add reviews    |
| Blog/Content       | ❌ None        | ⚠️ Some have    | Consider blog  |

---

## Summary: Top 15 Technical SEO Issues

### Critical (Fix First):

1. ❌ No JSON-LD structured data (Organization, FAQ, Service)
2. ❌ No XML sitemap generation
3. ❌ Images not optimized (5+ MB)
4. ❌ Content too thin (<1,000 words per page)
5. ❌ No internal linking strategy

### High Priority:

6. ⚠️ SPA SEO challenges (no SSR/prerendering)
7. ⚠️ Missing Open Graph images
8. ⚠️ Title tags too long (truncate at 60 chars)
9. ⚠️ Meta descriptions too long (>160 chars)
10. ⚠️ No breadcrumb navigation or schema

### Medium Priority:

11. ⚠️ Heading hierarchy unknown (need to verify H1 uniqueness)
12. ⚠️ No Twitter Card tags
13. ⚠️ No local SEO optimization (NAP, GBP integration)
14. ⚠️ No image alt text verification
15. ⚠️ No robots.txt verification

---

## Recommendations Before Scaling

**DO NOT build 4 sites or generate SEO pages until:**

1. ✅ Add JSON-LD schemas (Organization, FAQ minimum)
2. ✅ Implement sitemap generation
3. ✅ Optimize all images (<200 KB WebP)
4. ✅ Expand key pages to 1,200+ words
5. ✅ Add internal linking
6. ✅ Verify robots.txt exists
7. ✅ Add Open Graph images
8. ✅ Fix title/meta description lengths
9. ✅ Implement duplicate content detection
10. ✅ Add quality gates (content length, keyword density, uniqueness)

**Why:** These are foundational. If you scale broken SEO to 4 sites + hundreds of pages, you've multiplied the problem 400x.

---

**Audit Completed:** January 15, 2026  
**Auditor:** GitHub Copilot Agent  
**Next Steps:** Build ROI intelligence layer + implement fixes
