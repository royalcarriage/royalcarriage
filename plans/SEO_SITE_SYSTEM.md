# SEO Website System & Blog Management

## 5-Domain Website Structure

### Domain 1: Airport (chicagoairportblackcar.com)

**Purpose**: Airport transfer services
**Pages**:

- Homepage (hero, services, airport pickup process, CTAs)
- Flight-Aware Pickups (how it works, track flight, quote)
- Chicago Airports (O'Hare, Midway hubs)
- Fleet Page (show premium vehicles)
- Pricing (per-route, hourly rates)
- Reviews (testimonials from travelers)
- Blog (travel tips, airport guides)

### Domain 2: Corporate (chicagoexecutivecarservice.com)

**Purpose**: Executive/business transportation
**Pages**:

- Homepage (professional branding)
- Services (meeting transport, corporate accounts, hourly charter)
- Fleet (sedans & SUVs for executives)
- Corporate Accounts (NET-30 billing, dedicated account manager)
- Pricing (contract pricing, volume discounts)
- Case Studies (corporate testimonials)
- Blog (business travel tips, Chicago networking events)

### Domain 3: Wedding (chicagoweddingtransportation.com)

**Purpose**: Wedding transportation
**Pages**:

- Homepage (romantic imagery, wedding showcase)
- Wedding Packages (bride/groom transport, guest shuttles, rehearsal)
- Gallery (wedding photos, decorated vehicles)
- Testimonials (real wedding stories)
- Pricing (per-hour, package pricing)
- Planning Guide (wedding day timeline)
- Contact (dedicated wedding coordinator)

### Domain 4: Party Bus (chicago-partybus.com)

**Purpose**: Party bus rentals
**Pages**:

- Homepage (party atmosphere, hero)
- Vehicles (party bus specs, inside photos, sound system, bar)
- Packages (girls night, bachelor party, prom, birthday)
- Gallery (party bus interior/exterior)
- Pricing (hourly rates, multi-hour discounts)
- Reviews (party testimonials)
- Blog (party planning tips, event ideas)

### Domain 5: Blog (shared across all domains)

**Purpose**: SEO content hub
**Structure**:

- Category: Travel Tips (airport efficiency, flight tracking)
- Category: Destination Guides (Chicago neighborhoods, attractions)
- Category: Event Planning (weddings, parties, corporate events)
- Category: Company News (new fleet additions, service updates)

---

## SEO Strategy per Domain

### Keyword Targeting

**Airport Domain**:

- "O'Hare airport car service"
- "Midway airport transportation Chicago"
- "Chicago airport limo"
- "corporate airport transfer Chicago"

**Corporate Domain**:

- "executive car service Chicago"
- "corporate transportation Chicago"
- "black car service Chicago"
- "Chicago business transportation"

**Wedding Domain**:

- "Chicago wedding transportation"
- "wedding limo rental Chicago"
- "bride transportation Chicago"
- "wedding party car service"

**Party Bus Domain**:

- "party bus rental Chicago"
- "bachelor party bus Chicago"
- "prom party bus"
- "girls night out limo"

**Blog**:

- "best time to arrive at O'Hare"
- "Chicago neighborhoods guide"
- "wedding transportation etiquette"
- "how to plan a party bus event"

### On-Page Optimization

#### Each Page Includes:

```html
<!-- Title (50-60 chars) -->
<title>Chicago Airport Car Service | O'Hare & Midway Transportation</title>

<!-- Meta Description (150-160 chars) -->
<meta
  name="description"
  content="Premium airport car service for O'Hare and Midway. Professional drivers, luxury vehicles, flight tracking. Book now."
/>

<!-- Meta Keywords -->
<meta
  name="keywords"
  content="airport car service, O'Hare, Midway, Chicago limo, black car"
/>

<!-- Open Graph for Social Sharing -->
<meta property="og:title" content="Chicago Airport Car Service" />
<meta property="og:image" content="gs://bucket/airport-hero.jpg" />
<meta property="og:url" content="https://chicagoairportblackcar.com/" />

<!-- Structured Data (JSON-LD) -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Royal Carriage Limousine",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main St",
      "addressLocality": "Chicago",
      "addressRegion": "IL",
      "postalCode": "60601"
    },
    "telephone": "+1-312-555-0100",
    "url": "https://chicagoairportblackcar.com",
    "image": "gs://bucket/logo.png",
    "servesCuisine": ["Airport Transportation", "Event Limo"],
    "openingHours": "Mo-Su 00:00-23:59"
  }
</script>

<!-- Canonical URL -->
<link
  rel="canonical"
  href="https://chicagoairportblackcar.com/airport-services"
/>

<!-- Heading Hierarchy -->
<h1>Chicago O'Hare & Midway Airport Car Service</h1>
<h2>Professional Airport Transportation</h2>
<h3>Flight-Aware Pickup</h3>

<!-- Image Alt Text -->
<img
  src="vehicle.jpg"
  alt="Luxury black sedan for O'Hare airport transfer, professional driver"
/>
```

### Core Web Vitals Targets

- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1

### Lighthouse Score Target: 90+

---

## Blog Content Calendar

### Month 1: Airport Content

- Week 1: "Best Times to Arrive at O'Hare" (SEO target: "o'hare arrival times")
- Week 2: "Chicago Airport Ground Transportation Guide"
- Week 3: "Flight Delay? Why You Should Book a Car Service"
- Week 4: "TSA PreCheck & Clear: How We Can Save You Time"

### Month 2: City Guides

- Week 1: "Downtown Chicago: Hotels, Restaurants, Attractions"
- Week 2: "Chicago Neighborhoods Guide: Where to Stay"
- Week 3: "Millennium Park & Grant Park: Complete Guide"
- Week 4: "Navy Pier & Riverwalk: What to See"

### Month 3: Events & Weddings

- Week 1: "Chicago Wedding Venues & Ceremony Locations"
- Week 2: "Wedding Day Timeline: From Ceremony to Reception"
- Week 3: "Bachelor/Bachelorette Party Ideas in Chicago"
- Week 4: "Corporate Event Transportation in Chicago"

---

## Content Management (Admin Dashboard)

### Page Builder Features

- Drag-drop sections
- Pre-built templates (hero, services, gallery, testimonials)
- WYSIWYG editor for content
- Image library integration
- Form builder for CTAs
- Meta tag editor
- SEO score feedback
- Mobile preview

### Publishing Workflow

```
Draft → Review → Schedule/Publish → Monitor → Archive
```

### Metrics Tracking

- Page views
- Bounce rate
- Time on page
- Conversions (bookings)
- Traffic source
- Mobile vs desktop
- Referrer analysis

---

## Technical SEO Checklist

### Sitemap & Robots

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://chicagoairportblackcar.com/</loc>
    <lastmod>2026-01-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- ... more URLs ... -->
</urlset>
```

```
# robots.txt
User-agent: *
Allow: /

Sitemap: https://chicagoairportblackcar.com/sitemap.xml
Disallow: /admin
Disallow: /api
```

### Search Console Integration

- Submit sitemap
- Monitor crawl errors
- Fix broken links
- Mobile usability review
- Core Web Vitals monitoring

### Redirects

- 301 redirect old URLs
- HTTPS enforcement
- Non-www → www (or vice versa)
- Trailing slash consistency

---

## Local SEO (Google Business Profile)

### GBP Optimization

- Complete business info (hours, phone, address)
- Regular posts (event announcements)
- Photo gallery (vehicles, team, operations)
- Customer reviews (respond to all)
- Q&A section management
- Service area updates

### Local Citations

- Yelp verified listing
- Apple Maps presence
- Yellow Pages listing
- Industry directories

---

## Link Building Strategy

### Internal Linking

- Blog posts link to service pages
- Service pages link to blog
- Footer links to important pages
- Related posts suggestions

### External Links (Backlink Targets)

- Chicago business directories
- Travel blogs (airport guides)
- Wedding vendor directories
- Event planning websites
- Local Chicago news sites

### Guest Posting

- "Airport Transportation Trends 2026"
- "Wedding Planning Tips" on wedding blogs
- "Corporate Event Ideas" on business sites

---

## Content SEO Scoring

### Pre-Publish Checklist

- ✅ Focus keyword in title
- ✅ Focus keyword in first 100 words
- ✅ Internal links (min 3)
- ✅ Images with alt text
- ✅ Minimum 1000 words (for blog)
- ✅ Readability Grade A/B
- ✅ Meta description (155 chars)
- ✅ H2/H3 headings present
- ✅ Mobile preview reviewed
- ✅ No duplicate content

---

## Analytics Dashboard

### Traffic Metrics

- Total visitors (month/week)
- New vs returning
- Traffic source breakdown
- Device type distribution
- Geographic breakdown

### Conversion Metrics

- Landing page > booking completion rate
- Cost per acquisition
- Average booking value
- Peak booking times

### SEO Metrics

- Keyword rankings (top 20)
- Search visibility score
- Organic traffic growth
- Backlink count

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Owner**: YOLO Autonomous Builder (Agent 4 - SEO/Content)
**Status**: Production Ready
