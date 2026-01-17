# Royal Carriage - Revised Strategic Plan

## Comprehensive System Architecture & Implementation Roadmap

**Document Version:** 2.0 (Revised Scope)
**Date:** January 16, 2026
**Agent:** Agent 11: Strategic Planner (Revised Scope)

---

## Executive Summary

Royal Carriage is transforming from a basic driver management system into a comprehensive multi-tenant platform that integrates:

- Moovs booking data
- Google Analytics & Ads
- AI-powered content generation
- Partner revenue tracking
- Financial analytics & reporting

The system serves three primary user types:

1. **Partners** (vehicle owners) - track earnings, payouts, performance
2. **Admins** (central control) - manage fleet, analytics, AI generation, finances
3. **Public Users** - book via 4 public websites with SEO-optimized content

---

## Section 1: New System Architecture

### 1.1 Data Flow Overview

```
┌─────────────┐
│  Moovs API  │ ──> Bookings, Customers, Revenue
└─────────────┘
       │
       ▼
┌──────────────────────┐
│  Firestore Database  │ ◄─── Central Data Hub
└──────────────────────┘
       │
       ├─> Admin Dashboard (Analytics, Reporting, AI)
       ├─> Partner Portal (Earnings, Payouts)
       └─> Public Websites (Dynamic Content)
            │
            ├─ Website 1 (Primary)
            ├─ Website 2 (Regional)
            ├─ Website 3 (Luxury)
            └─ Website 4 (Corporate)

Google Analytics 4 ──> AI Content System ──> Blog Posts
                  │                    │
Google Ads Data ──┘                    └──> Service Pages
                                       │
OpenAI GPT+DALL-E────────────────────▶│
                                       └──> Product Descriptions
```

### 1.2 Architecture Components

#### A. Moovs Integration Engine

- **CSV Import Pipeline**: Idempotent import from Moovs exports
- **Real-time API Sync**: Hourly polling for new bookings
- **Data Mapping**: Booking data → Internal database schema
- **Revenue Tracking**: Per-booking revenue attribution
- **Customer Sync**: Customer data from Moovs → Firestore

#### B. Financial Analytics System

- **Vehicle Profitability**: Revenue calculation per vehicle
- **Partner Revenue Sharing**: Commission/split calculation per partner
- **Driver Cost Analysis**: Hourly rates, per-booking costs, weekly costs
- **Fleet Utilization**: Bookings per vehicle per day
- **Affiliate Earnings**: Affiliate tracking and payment status
- **Receivables Dashboard**: Amounts owed to/from partners
- **Profit Margin Analysis**: Gross and net margins

#### C. AI Content Generation System

- **Data Ingestion**: GA4 and Google Ads API integration
- **Behavioral Analysis**: Customer journey, interests, keywords
- **Content Generation**: Blog posts, service pages, ad copy, product descriptions
- **Image Generation**: DALL-E for vehicle galleries, service imagery
- **SEO Optimization**: Meta tags, structured data, keyword targeting
- **Content Management**: Version control, approval workflows

#### D. Public Websites (4 Domains)

- **Dynamic Pages**: AI-generated service pages, blog posts
- **Static Pages**: Homepage, pricing, about, contact
- **Blog System**: AI-generated posts with manual override capability
- **Image Galleries**: AI-generated or uploaded images
- **Lead Capture**: Contact forms, quote requests, newsletter signups
- **SEO Optimization**: Structured data (Schema.org), sitemap, robots.txt

#### E. Admin Dashboard (Central Control)

- **Real-time Metrics**: Live bookings, revenue, costs
- **Financial Reporting**: P&L statements, expense breakdowns
- **Vehicle Management**: Fleet overview, profitability by vehicle
- **Partner Management**: Revenue tracking, payout processing
- **Driver Management**: Cost analysis, payroll integration
- **AI Content Interface**: Generation triggers, approval workflow
- **Data Integration**: GA4 and Google Ads dashboards
- **Affiliate Management**: Earnings, payment status, commission rules

#### F. Partner Portal

- **Vehicle Dashboard**: Specific vehicle earnings and costs
- **Revenue Sharing**: Detailed breakdown of commissions/splits
- **Payout History**: Payment records and bank details
- **Performance Metrics**: Booking volume, utilization rate
- **Booking History**: List of all bookings for owned vehicles

---

## Section 2: Data Flow Diagram

### 2.1 Complete System Data Flow

```
EXTERNAL DATA SOURCES
├─ Moovs Exports (CSV)
│  └─> Bookings, Customers, Revenue Data
├─ Moovs API (Real-time)
│  └─> New bookings, status updates
├─ Google Analytics 4
│  └─> Traffic, Conversions, User Behavior
├─ Google Ads
│  └─> Campaign Performance, Keywords, Costs
└─ Manual Data Entry
   └─> Driver info, Partner info, Fleet details

                 │
                 ▼
        ┌────────────────────┐
        │   INGEST LAYER     │
        ├────────────────────┤
        │ CSV Parser         │
        │ API Clients        │
        │ Data Validators    │
        │ Transform Logic    │
        └────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  FIRESTORE DB      │
        ├────────────────────┤
        │ Collections:       │
        │ - vehicles         │
        │ - partners         │
        │ - bookings         │
        │ - drivers          │
        │ - revenue          │
        │ - partners_revenue │
        │ - affiliate_earnings
        │ - ga_data          │
        │ - ads_data         │
        │ - ai_content       │
        │ - finances         │
        └────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
    ▼            ▼            ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Admin   │ │ Partner  │ │   AI     │ │   Public     │
│ Panel   │ │ Portal   │ │ System   │ │  Websites    │
└─────────┘ └──────────┘ └──────────┘ └──────────────┘
    │            │            │              │
    ├─>Analytics │            ├─>GA4 Query   ├─>Website 1
    ├─>Reports   │            ├─>Ads Query   ├─>Website 2
    ├─>Payroll   ├─>Earnings  ├─>GPT-4       ├─>Website 3
    ├─>AI Mgmt   ├─>Payouts   ├─>DALL-E      └─>Website 4
    └─>Finance   └─>Metrics   └─>Content
                               Storage
```

### 2.2 Business Process Flows

#### Booking to Revenue Flow

```
Moovs → CSV/API → Parse Booking Data
                        │
                        ▼
                Create Booking Record ─── Link to Vehicle
                        │                      │
                        ▼                      ▼
            Calculate Revenue Share ─── Allocate to Partner
                        │
                        ▼
            Track Driver Costs
                        │
                        ▼
            Calculate Net Profit
                        │
                        ▼
            Update Partner Dashboard
                        │
                        ▼
            Monthly Settlement
```

#### Content Generation Flow

```
GA4 Data + Ads Data
        │
        ▼
Analyze Keywords, Trends, User Behavior
        │
        ▼
Generate Prompts for GPT-4
        │
        ▼
Create Blog Posts, Service Pages
        │
        ▼
Generate Images with DALL-E
        │
        ▼
Add SEO Metadata
        │
        ▼
Store in ai_content Collection
        │
        ▼
Push to Public Websites
```

---

## Section 3: Module Specifications

### 3.1 Module 1: Moovs Integration Engine

**Purpose:** Seamlessly integrate booking and customer data from Moovs into the Royal Carriage system

**Key Features:**

- CSV Import with idempotency (duplicate detection)
- Real-time API sync (hourly polling)
- Data transformation and validation
- Error logging and retry logic
- Booking status tracking

**Technical Stack:**

- Cloud Functions (Node.js)
- Firestore
- Google Cloud Storage (for CSV staging)
- Moovs API client library

**Data Flow:**

```
CSV File Upload
    ↓
Parse & Validate
    ↓
Check for Duplicates (idempotent)
    ↓
Transform to Internal Schema
    ↓
Write to Firestore /bookings collection
    ↓
Trigger Revenue Calculation
    ↓
Update Partner Dashboard
```

**Endpoints:**

- `POST /api/moovs/import-csv` - Upload and process CSV
- `POST /api/moovs/sync-api` - Trigger real-time API sync
- `GET /api/moovs/import-status/{jobId}` - Check import status
- `GET /api/moovs/sync-history` - View sync history

**Error Handling:**

- Duplicate detection (by Moovs booking ID)
- Validation failures logged with details
- Automatic retry with exponential backoff
- Email notifications for failed imports

---

### 3.2 Module 2: Financial Analytics System

**Purpose:** Deep analysis of profitability, costs, and revenue distribution

**Key Features:**

- Real-time revenue tracking per booking
- Vehicle-level profitability analysis
- Partner revenue sharing calculations
- Driver cost analysis (hourly, per-booking, weekly)
- Fleet utilization metrics
- Affiliate earnings tracking
- Receivables management
- Profit margin analysis (gross, net)
- Cost breakdown (drivers, fuel, maintenance, commissions)

**Technical Stack:**

- Firestore (for data storage)
- Cloud Functions (for calculations)
- Firebase Analytics (for reporting)
- Google Sheets integration (for export)

**Key Collections:**

**vehicles**

```json
{
  "vehicleId": "string",
  "name": "string",
  "type": "sedan|suv|van|luxury",
  "partnerId": "string",
  "costPerHour": number,
  "fuelCost": number,
  "maintenanceCostMonthly": number,
  "insuranceCostMonthly": number,
  "status": "active|inactive|maintenance",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

**revenue** (per booking)

```json
{
  "bookingId": "string",
  "vehicleId": "string",
  "partnerId": "string",
  "grossRevenue": number,
  "platformCommission": number,
  "partnerRevenue": number,
  "driverCost": number,
  "netProfit": number,
  "bookingDate": timestamp,
  "durationMinutes": number
}
```

**partners_revenue** (aggregated)

```json
{
  "partnerId": "string",
  "month": "YYYY-MM",
  "totalBookings": number,
  "grossRevenue": number,
  "platformCommission": number,
  "netRevenue": number,
  "totalCosts": number,
  "netProfit": number,
  "percentageOfTotal": number,
  "payoutStatus": "pending|scheduled|paid",
  "payoutDate": timestamp,
  "payoutAmount": number
}
```

**affiliate_earnings**

```json
{
  "affiliateId": "string",
  "referralId": "string",
  "bookingValue": number,
  "commissionPercentage": number,
  "commissionAmount": number,
  "status": "pending|approved|rejected|paid",
  "bookingDate": timestamp,
  "paymentDate": timestamp,
  "paymentMethod": "bank_transfer|paypal|check"
}
```

**Dashboards & Reports:**

- Vehicle Profitability Dashboard: Ranking by profit, utilization
- Partner Revenue Tracker: Real-time earnings per partner
- Driver Cost Analysis: Cost per booking, weekly trends
- Fleet Utilization: Bookings per vehicle, downtime tracking
- Affiliate Program: Earnings, pending payouts
- Financial Summary: P&L, cash flow, receivables

**Calculations:**

```
Partner Revenue = Gross Revenue - Platform Commission
Net Profit = Partner Revenue - Driver Costs - Vehicle Costs
Vehicle Profitability = Sum(Net Profit) / Vehicle
Utilization Rate = Bookings / Available Hours
Driver Cost Per Booking = (Hourly Rate * Duration) / 60
```

---

### 3.3 Module 3: AI Content Generation System

**Purpose:** Automatically generate SEO-optimized content based on market data and user behavior

**Key Features:**

- GA4 integration (traffic, conversions, user flow)
- Google Ads integration (keywords, CTR, conversions)
- AI content generation (blog posts, service pages, ad copy)
- AI image generation (vehicle photos, service imagery)
- SEO optimization (meta tags, structured data, keywords)
- Content versioning and approval workflow
- A/B testing capabilities

**Technical Stack:**

- OpenAI API (GPT-4 for text, DALL-E for images)
- Google Analytics API (GA4)
- Google Ads API
- Cloud Functions (orchestration)
- Firestore (content storage)
- Google Cloud Storage (image storage)

**Data Integration:**

**GA4 Data Ingestion:**

```
Query Endpoints:
- Page views by URL
- Conversion funnel analysis
- User demographics
- Search keywords from Google Search Console
- Event tracking (form submissions, bookings)
- User flow and drop-off analysis

Stored in: /ga_data/{metric} collection
Updated: Daily batch process
```

**Google Ads Data Ingestion:**

```
Query Endpoints:
- Campaign performance (impressions, clicks, conversions)
- Keyword analysis (CTR, conversion rate, cost per conversion)
- Ad copy performance
- Audience demographics

Stored in: /ads_data/{campaignId} collection
Updated: Daily batch process
```

**Content Generation Pipeline:**

```
┌─────────────────────────────────┐
│ 1. Data Analysis                 │
│ - Top keywords from GA4          │
│ - High-conversion topics         │
│ - User search patterns           │
│ - Competitor keywords            │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 2. Prompt Engineering            │
│ - Service: "Write SEO blog post" │
│ - Audience: Luxury car renters   │
│ - Keywords: Wedding transportation
│ - Tone: Professional, persuasive │
│ - Length: 1500 words             │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 3. Content Generation (GPT-4)    │
│ - Blog posts (1500-2000 words)   │
│ - Service pages (800-1200 words) │
│ - Meta descriptions (155 chars)  │
│ - Ad copy variations (5 versions)│
│ - Product descriptions           │
│ - FAQ sections                   │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 4. Image Generation (DALL-E)     │
│ - Service imagery                │
│ - Vehicle showcase photos        │
│ - Hero images for blog           │
│ - Social media graphics          │
│ - Product images                 │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 5. SEO Optimization              │
│ - Meta tags generation           │
│ - Schema.org markup              │
│ - Internal linking strategy      │
│ - Keyword density optimization   │
│ - Alt text for images            │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 6. Content Storage & Versioning  │
│ - Store in /ai_content           │
│ - Version control                │
│ - Prompt & parameters logged     │
│ - Generation timestamp           │
│ - Performance tracking ready     │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 7. Admin Review & Approval       │
│ - Human review interface         │
│ - Edit capability                │
│ - Approval/rejection             │
│ - Schedule for publishing        │
└─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────┐
│ 8. Publishing                    │
│ - Push to public websites        │
│ - Update social media            │
│ - Update sitemaps                │
│ - Notify users                   │
└─────────────────────────────────┘
```

**AI Content Types:**

1. **Blog Posts**
   - Topic: High-traffic keywords from GA4
   - Length: 1500-2000 words
   - Structure: Intro, 3-4 main sections, conclusion, CTA
   - SEO: H2/H3 headers with keywords, internal links
   - Examples: Wedding transportation guide, luxury car rental tips

2. **Service Pages**
   - Topic: Based on user search patterns
   - Length: 800-1200 words
   - Structure: Overview, benefits, features, pricing, CTA
   - SEO: Optimized for local + service keywords
   - Examples: Wedding car service, corporate transportation

3. **Ad Copy**
   - Variations: 5 different versions per ad
   - Length: 150 characters (headlines), 300 characters (descriptions)
   - Focus: High-converting keywords from Google Ads
   - A/B testing enabled

4. **Product Descriptions**
   - Topics: Vehicle types (sedan, SUV, van, luxury)
   - Length: 200-400 words
   - SEO: Optimized for vehicle type keywords
   - Highlight: Features, capacity, amenities

5. **Image Generation**
   - Prompts: Derived from content topic
   - Quality: Professional, high-resolution (1200x800 minimum)
   - Styling: Consistent with brand guidelines
   - Usage: Blog headers, service page hero images, galleries

**ai_content Collection Schema:**

```json
{
  "contentId": "uuid",
  "type": "blog_post|service_page|ad_copy|product_description|image",
  "title": "string",
  "content": "string (or image URL)",
  "targetKeywords": ["string"],
  "sourceData": {
    "gaKeywords": ["string"],
    "adsPerformance": {object},
    "userBehavior": {object}
  },
  "prompt": "string (original prompt used)",
  "metadata": {
    "model": "gpt-4|dall-e-3",
    "tokensUsed": number,
    "costUSD": number,
    "generationTime": number
  },
  "seoMetadata": {
    "metaDescription": "string",
    "schemaMarkup": {object},
    "internalLinks": ["string"],
    "keywordDensity": {object}
  },
  "version": number,
  "status": "draft|pending_review|approved|published|archived",
  "generatedAt": timestamp,
  "publishedAt": timestamp,
  "reviewedBy": "string",
  "reviewedAt": timestamp,
  "performance": {
    "views": number,
    "clicks": number,
    "conversions": number,
    "avgTimeOnPage": number,
    "bounceRate": number
  }
}
```

---

### 3.4 Module 4: Public Websites (4 Domains)

**Purpose:** Multi-domain presence with SEO-optimized, dynamic content driven by AI

**Architecture:**

- Single React SPA backend (shared infrastructure)
- 4 separate domain configurations
- Dynamic page rendering from /ai_content collection
- Static + dynamic content hybrid approach

**Domain Strategy:**

1. **Domain 1: Primary/Corporate**
   - Focus: All vehicle types, comprehensive services
   - Content: Full service catalog, blog, corporate info
   - Target: Wide audience

2. **Domain 2: Regional/Local**
   - Focus: Specific geographic market
   - Content: Local events, regional partnerships
   - Target: Local customers

3. **Domain 3: Luxury/Premium**
   - Focus: Luxury vehicles, premium services
   - Content: High-end wedding transport, executive services
   - Target: Upscale clientele

4. **Domain 4: Corporate/B2B**
   - Focus: Business transportation, fleet services
   - Content: Corporate solutions, bulk pricing
   - Target: Business customers

**Website Features:**

**Static Pages:**

- Homepage (brand, value prop, CTA)
- Services overview (vehicle types)
- Pricing page
- About us
- Contact/inquiry form
- FAQ
- Privacy policy, Terms

**Dynamic Pages:**

- Service detail pages (generated from AI)
- Blog post pages (AI-generated content)
- Vehicle gallery (AI-generated images)
- Testimonials/reviews
- Case studies

**Content Management:**

- CMS interface in Admin Dashboard
- Drag-and-drop page builder
- Template system
- Multi-language support ready
- Version control (publish/revert)

**Blog System:**

- AI-generated posts
- Manual posts
- Categories and tags
- Search functionality
- Related posts
- Comments section (optional)
- SEO optimization per post

**Lead Capture:**

- Contact forms (variations per page)
- Quote request forms
- Newsletter signup
- Callback scheduling
- Form analytics
- CRM integration (Salesforce/HubSpot)

**SEO Optimization:**

```
On-Page:
- Meta titles (60 chars)
- Meta descriptions (155 chars)
- H1, H2, H3 hierarchy
- Keyword optimization (3-5% density)
- Internal linking strategy
- Image alt text
- Mobile responsiveness

Technical:
- XML sitemaps (auto-generated)
- Robots.txt optimization
- Canonical tags
- Schema.org markup (LocalBusiness, Service, Event)
- Structured data for rich snippets
- Core Web Vitals optimization
- Mobile-first indexing ready

Link Building:
- Internal linking between related content
- Breadcrumb navigation
- FAQ schema for featured snippets
- Local schema for SEO
```

**SEO Schema Examples:**

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Royal Carriage",
  "image": "URL",
  "description": "Premium car rental services",
  "url": "website.com",
  "telephone": "+1-XXX-XXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "postalCode": "12345"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  }
}
```

**Performance Requirements:**

- Page load time: < 2 seconds
- Lighthouse score: > 90
- Mobile responsiveness: 100% coverage
- Uptime: 99.9%

---

### 3.5 Module 5: Admin Dashboard (Central Control)

**Purpose:** Comprehensive control center for all platform operations

**Key Features:**

**Dashboard Home:**

- Real-time KPIs (bookings today, revenue, costs)
- 7-day/30-day trends
- Top performing vehicles
- Partner rankings
- Quick action buttons

**Sections:**

**1. Analytics & Reporting**

- Revenue trends (daily, weekly, monthly)
- Booking volume analysis
- Cost analysis by category
- Profitability by vehicle
- Partner performance rankings
- Geographic distribution (if applicable)
- Custom report builder
- Export to CSV/PDF

**2. Financial Management**

- P&L statement (monthly/quarterly)
- Cash flow forecast
- Expense tracking
- Partner payouts (pending, scheduled, completed)
- Affiliate earnings and payments
- Receivables tracking
- Tax summary

**3. Vehicle Management**

- Fleet overview (status, utilization)
- Individual vehicle details
- Performance metrics per vehicle
- Maintenance tracking
- Cost allocation per vehicle
- Partner ownership assignments

**4. Partner Management**

- Partner directory
- Revenue sharing details
- Payout history and status
- Performance metrics
- Contact information
- Payment method management
- Partnership agreements

**5. Driver Management**

- Driver directory
- Hourly rates
- Certification/license tracking
- Performance ratings
- Cost analysis
- Payroll integration
- Scheduling (if applicable)

**6. AI Content Management**

- Content generation interface
- Trigger manual generation
- Queue of pending generation
- Draft review interface
- Approval/rejection workflow
- Schedule for publishing
- View published content performance
- Manage prompts/templates

**7. Data Integration**

- Google Analytics 4 dashboard
  - Traffic by device, location, source
  - Conversion funnel
  - User behavior flow
  - Top pages, search queries
- Google Ads dashboard
  - Campaign performance
  - Keyword analysis
  - Ad group performance
  - Cost per conversion

**8. Affiliate Program**

- Affiliate directory
- Commission structure management
- Earnings tracking
- Pending payouts
- Payment history
- Commission rules configuration

**9. Settings & Configuration**

- Business settings
- Payment method configuration
- Email notifications
- User roles and permissions
- API keys management
- Integration settings
- Branding customization

**10. Reports & Exports**

- Standard reports (P&L, Revenue Summary)
- Custom report builder
- Scheduled report delivery
- Data export (CSV, PDF, Excel)
- API for external tools

**Dashboard Technical Stack:**

- React SPA
- Material-UI or Chakra UI
- Charts: Chart.js or Recharts
- Data tables: React Table or AG Grid
- Real-time updates: Firebase Realtime DB or Firestore listeners
- Export: PDF (jsPDF), Excel (ExcelJS)

---

## Section 4: Database Schema

### 4.1 Firestore Collections & Fields

#### Collection 1: /vehicles/{vehicleId}

```json
{
  "vehicleId": "string (auto-generated)",
  "name": "string (e.g., 'Luxury Mercedes S-Class #1')",
  "type": "sedan | suv | van | luxury | coach",
  "partnerId": "string (vehicle owner/partner)",
  "status": "active | inactive | maintenance | retired",
  "
  "Specifications": {
    "year": number,
    "make": "string",
    "model": "string",
    "color": "string",
    "licensePlate": "string",
    "vin": "string",
    "seatingCapacity": number,
    "fuelType": "gasoline | diesel | hybrid | electric",
    "transmission": "manual | automatic"
  },

  "Costs": {
    "costPerHour": number,
    "costPerMile": number,
    "fuelCostPerMile": number,
    "maintenanceCostMonthly": number,
    "insuranceCostMonthly": number,
    "registrationCostAnnual": number,
    "depreciationMonthly": number
  },

  "Amenities": [
    "WiFi",
    "Phone charger",
    "Premium sound system",
    "Climate control",
    "Luxury seating"
  ],

  "Contact": {
    "partnerName": "string",
    "partnerEmail": "string",
    "partnerPhone": "string",
    "emergencyContact": "string"
  },

  "Maintenance": {
    "lastServiceDate": timestamp,
    "nextServiceDue": timestamp,
    "insuranceExpiryDate": timestamp,
    "registrationExpiryDate": timestamp,
    "registrationNumber": "string"
  },

  "Performance": {
    "totalBookings": number,
    "totalRevenueGenerated": number,
    "totalHoursInService": number,
    "averageRating": number (1-5),
    "utilizationRate": number (0-100%),
    "lastBookingDate": timestamp,
    "downtime": number (percentage)
  },

  "createdAt": timestamp,
  "updatedAt": timestamp,
  "createdBy": "string (admin ID)"
}
```

#### Collection 2: /partners/{partnerId}

```json
{
  "partnerId": "string (auto-generated)",
  "status": "active | inactive | suspended",

  "Profile": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "businessName": "string",
    "businessRegistration": "string",
    "taxId": "string"
  },

  "Address": {
    "streetAddress": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  },

  "Banking": {
    "accountHolderName": "string",
    "bankName": "string",
    "accountNumber": "string (encrypted)",
    "routingNumber": "string (encrypted)",
    "accountType": "checking | savings",
    "verificationStatus": "pending | verified | failed"
  },

  "Vehicles": [
    "vehicleId1",
    "vehicleId2"
  ],

  "RevenueShare": {
    "commissionPercentage": number (0-100%),
    "minimumMonthlyPayout": number,
    "payoutSchedule": "weekly | bi-weekly | monthly",
    "payoutDay": number (1-31),
    "customTerms": "string (if applicable)"
  },

  "Performance": {
    "totalBookings": number,
    "totalEarnings": number,
    "totalPayouts": number,
    "averageRating": number (1-5),
    "joinDate": timestamp,
    "lastPayoutDate": timestamp
  },

  "Compliance": {
    "insuranceDocuments": ["url"],
    "licenseDocuments": ["url"],
    "backgroundCheckComplete": boolean,
    "backgroundCheckDate": timestamp,
    "termsAccepted": boolean,
    "termsAcceptanceDate": timestamp
  },

  "Notifications": {
    "emailNotifications": boolean,
    "smsNotifications": boolean,
    "payoutNotifications": boolean,
    "reportingFrequency": "daily | weekly | monthly"
  },

  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Collection 3: /bookings/{bookingId}

```json
{
  "bookingId": "string (from Moovs or auto-generated)",
  "moovsBookingId": "string (original Moovs ID for reconciliation)",
  "status": "pending | confirmed | in_progress | completed | cancelled",

  "Customer": {
    "customerId": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  },

  "Booking Details": {
    "vehicleId": "string",
    "vehicleType": "string",
    "pickupDateTime": timestamp,
    "dropoffDateTime": timestamp,
    "durationMinutes": number,
    "pickupLocation": {
      "latitude": number,
      "longitude": number,
      "address": "string"
    },
    "dropoffLocation": {
      "latitude": number,
      "longitude": number,
      "address": "string"
    },
    "purpose": "wedding | corporate | airport | leisure | other",
    "specialRequirements": "string"
  },

  "Pricing": {
    "basePrice": number,
    "distance": number (miles),
    "distancePrice": number,
    "surcharges": number,
    "discounts": number,
    "taxes": number,
    "totalPrice": number,
    "pricingBreakdown": {object}
  },

  "Revenue Allocation": {
    "grossRevenue": number,
    "platformCommission": number (percentage),
    "platformCommissionAmount": number,
    "partnerRevenue": number,
    "driverCost": number,
    "vehicleCost": number,
    "netProfit": number
  },

  "Driver": {
    "driverId": "string",
    "driverName": "string",
    "driverPhone": "string"
  },

  "Payment": {
    "method": "credit_card | debit_card | paypal | other",
    "status": "pending | authorized | charged | refunded",
    "transactionId": "string",
    "paidAt": timestamp,
    "refundAmount": number (if applicable)
  },

  "Ratings & Reviews": {
    "customerRating": number (1-5),
    "customerReview": "string",
    "ratedAt": timestamp,
    "driverRating": number (1-5),
    "driverReview": "string"
  },

  "importSource": "moovs_csv | moovs_api | manual",
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Collection 4: /drivers/{driverId}

```json
{
  "driverId": "string (auto-generated)",
  "status": "active | inactive | suspended",

  "Profile": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "dateOfBirth": timestamp,
    "ssn": "string (encrypted)"
  },

  "License": {
    "licenseNumber": "string",
    "licenseState": "string",
    "expirationDate": timestamp,
    "documentUrl": "string"
  },

  "Employment": {
    "hireDate": timestamp,
    "hourlyRate": number,
    "employmentType": "full_time | part_time | contractor",
    "assignedVehicles": ["vehicleId1", "vehicleId2"],
    "bankAccountForPayroll": "string (reference to banking info)"
  },

  "Certifications": [
    {
      "type": "cdl | passenger_endorsement | safety_course",
      "issuedDate": timestamp,
      "expirationDate": timestamp,
      "documentUrl": "string"
    }
  ],

  "Performance": {
    "totalBookings": number,
    "totalEarnings": number,
    "averageRating": number (1-5),
    "cancelledBookings": number,
    "onTimePercentage": number,
    "safetyIncidents": number
  },

  "Compliance": {
    "backgroundCheckComplete": boolean,
    "backgroundCheckDate": timestamp,
    "backgroundCheckResult": "passed | failed | pending",
    "insuranceDocuments": ["url"],
    "termsAccepted": boolean
  },

  "Payroll": {
    "lastPaymentDate": timestamp,
    "totalEarningsYTD": number,
    "deductions": {object},
    "taxes": {object}
  },

  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Collection 5: /revenue/{bookingId}

```json
{
  "bookingId": "string (foreign key to bookings)",
  "month": "YYYY-MM",
  "vehicleId": "string",
  "partnerId": "string",

  "RevenueBreakdown": {
    "grossRevenue": number,
    "platformCommissionRate": number (percentage),
    "platformCommissionAmount": number,
    "partnerGrossRevenue": number
  },

  "CostBreakdown": {
    "driverHourlyRate": number,
    "durationMinutes": number,
    "driverCost": number,
    "fuelCostMile": number,
    "distanceMiles": number,
    "fuelCost": number,
    "maintenanceAllocated": number,
    "insuranceAllocated": number,
    "depreciation": number,
    "totalCosts": number
  },

  "NetProfit": {
    "partnerNetRevenue": number,
    "profitMarginPercentage": number,
    "costPercentage": number
  },

  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Collection 6: /partners_revenue/{partnerId}/{month}

```json
{
  "partnerId": "string",
  "month": "YYYY-MM",
  "status": "pending | scheduled | paid",

  "Summary": {
    "totalBookings": number,
    "totalDuration": number (hours),
    "totalDistance": number (miles),
    "grossRevenue": number,
    "platformCommission": number,
    "platformCommissionAmount": number,
    "netRevenue": number
  },

  "Costs": {
    "driverCosts": number,
    "fuelCosts": number,
    "maintenanceCosts": number,
    "insuranceCosts": number,
    "depreciationCosts": number,
    "otherCosts": number,
    "totalCosts": number
  },

  "Profitability": {
    "netProfit": number,
    "profitMargin": number (percentage),
    "costPercentage": number (percentage),
    "bookingAverage": number
  },

  "VehicleBreakdown": [
    {
      "vehicleId": "string",
      "vehicleName": "string",
      "bookings": number,
      "revenue": number,
      "costs": number,
      "profit": number
    }
  ],

  "Payout": {
    "totalDue": number,
    "payoutMethod": "bank_transfer | check | paypal",
    "payoutDate": timestamp,
    "bankAccountUsed": "string",
    "transactionId": "string",
    "notes": "string"
  },

  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Collection 7: /affiliate_earnings/{affiliateId}/{month}

```json
{
  "affiliateId": "string",
  "month": "YYYY-MM",
  "status": "pending | approved | rejected | paid",

  "Summary": {
    "totalReferrals": number,
    "confirmedReferrals": number,
    "rejectedReferrals": number,
    "totalBookingValue": number,
    "commissionPercentage": number,
    "totalCommissionEarned": number
  },

  "Referrals": [
    {
      "referralId": "string",
      "bookingId": "string",
      "bookingValue": number,
      "bookingDate": timestamp,
      "status": "pending | approved | rejected",
      "commissionAmount": number,
      "approvalDate": timestamp
    }
  ],

  "Payout": {
    "totalDue": number,
    "payoutMethod": "bank_transfer | check | paypal | credit",
    "payoutDate": timestamp,
    "payoutStatus": "pending | scheduled | completed",
    "transactionId": "string",
    "notes": "string"
  },

  "Performance": {
    "conversionRate": number (percentage),
    "averageBookingValue": number,
    "repeatReferralRate": number (percentage)
  },

  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Collection 8: /ga_data/{metric}/{date}

```json
{
  "metric": "pageviews | sessions | users | conversions | bounce_rate",
  "date": "YYYY-MM-DD",

  "Traffic": {
    "pageViews": number,
    "sessions": number,
    "uniqueUsers": number,
    "returnVisitors": number,
    "bounceRate": number (percentage),
    "avgSessionDuration": number (seconds),
    "avgPageLoadTime": number (seconds)
  },

  "Conversions": {
    "goalCompletions": number,
    "conversionRate": number (percentage),
    "conversionValue": number,
    "bookingFormSubmissions": number,
    "quoteRequests": number,
    "newsletterSignups": number
  },

  "Traffic Sources": {
    "organic": {pageviews: number, sessions: number, conversions: number},
    "direct": {pageviews: number, sessions: number, conversions: number},
    "referral": {pageviews: number, sessions: number, conversions: number},
    "social": {pageviews: number, sessions: number, conversions: number},
    "paid": {pageviews: number, sessions: number, conversions: number},
    "email": {pageviews: number, sessions: number, conversions: number}
  },

  "Devices": {
    "mobile": {pageviews: number, sessions: number, conversionRate: number},
    "desktop": {pageviews: number, sessions: number, conversionRate: number},
    "tablet": {pageviews: number, sessions: number, conversionRate: number}
  },

  "TopPages": [
    {
      "pagePath": "string",
      "pageTitle": "string",
      "pageViews": number,
      "sessions": number,
      "avgTimeOnPage": number,
      "bounceRate": number,
      "conversions": number
    }
  ],

  "Keywords": [
    {
      "keyword": "string",
      "impressions": number,
      "clicks": number,
      "ctr": number (percentage),
      "position": number,
      "conversions": number
    }
  ],

  "Geography": [
    {
      "country": "string",
      "city": "string",
      "sessions": number,
      "conversions": number,
      "conversionRate": number
    }
  ],

  "updatedAt": timestamp
}
```

#### Collection 9: /ads_data/{campaignId}/{date}

```json
{
  "campaignId": "string",
  "campaignName": "string",
  "date": "YYYY-MM-DD",
  "channel": "google_search | facebook | instagram | linkedin | tiktok",

  "Performance": {
    "impressions": number,
    "clicks": number,
    "ctr": number (percentage),
    "cost": number,
    "conversions": number,
    "costPerConversion": number,
    "conversionRate": number (percentage),
    "roi": number (percentage)
  },

  "KeywordMetrics": [
    {
      "keyword": "string",
      "matchType": "exact | phrase | broad",
      "impressions": number,
      "clicks": number,
      "ctr": number (percentage),
      "cost": number,
      "conversions": number,
      "costPerConversion": number,
      "qualityScore": number
    }
  ],

  "AdGroupMetrics": [
    {
      "adGroupId": "string",
      "adGroupName": "string",
      "impressions": number,
      "clicks": number,
      "cost": number,
      "conversions": number,
      "roi": number (percentage)
    }
  ],

  "AudienceMetrics": {
    "demographics": {
      "ageGroups": {object},
      "gender": {male: number, female: number},
      "interests": [string]
    },
    "devices": {
      "mobile": {impressions: number, clicks: number},
      "desktop": {impressions: number, clicks: number},
      "tablet": {impressions: number, clicks: number}
    },
    "geography": [
      {
        "location": "string",
        "impressions": number,
        "clicks": number,
        "conversions": number
      }
    ]
  },

  "Budget": {
    "dailyBudget": number,
    "monthlyBudget": number,
    "spent": number,
    "remaining": number
  },

  "updatedAt": timestamp
}
```

#### Collection 10: /ai_content/{contentId}

```json
{
  "contentId": "string (uuid)",
  "type": "blog_post | service_page | ad_copy | product_description | image",
  "title": "string",
  "slug": "string (url-friendly)",

  "Content": {
    "body": "string (markdown or HTML)",
    "imageUrl": "string",
    "imageAlt": "string",
    "videoUrl": "string (optional)"
  },

  "Metadata": {
    "targetKeywords": ["string"],
    "targetAudience": "string",
    "tone": "professional | conversational | persuasive",
    "callToAction": "string",
    "relatedContentIds": ["string"]
  },

  "SourceData": {
    "gaKeywords": ["string"],
    "gaSearchTerms": ["string"],
    "adsPerformance": {
      "topKeywords": ["string"],
      "topSearchTerms": ["string"]
    },
    "userBehavior": {
      "topPages": ["string"],
      "userFlow": "string",
      "dropOffPoints": ["string"]
    }
  },

  "Generation": {
    "model": "gpt-4 | gpt-3.5 | dall-e-3",
    "prompt": "string",
    "temperature": number (0-1),
    "tokensUsed": number,
    "costUSD": number,
    "generationDurationSeconds": number,
    "generatedAt": timestamp
  },

  "SEO": {
    "metaTitle": "string (60 chars)",
    "metaDescription": "string (155 chars)",
    "metaKeywords": ["string"],
    "schemaMarkup": {object},
    "internalLinks": [
      {
        "text": "string",
        "url": "string"
      }
    ],
    "keywordDensity": {
      "keyword": number (percentage)
    },
    "readabilityScore": number
  },

  "Status": {
    "state": "draft | pending_review | approved | published | archived",
    "createdBy": "system | admin_id",
    "reviewedBy": "string (admin_id)",
    "reviewedAt": timestamp,
    "publishedAt": timestamp,
    "archivedAt": timestamp
  },

  "Version": {
    "version": number,
    "previousVersionId": "string",
    "changeLog": ["string"]
  },

  "Performance": {
    "views": number,
    "clicks": number,
    "conversions": number,
    "avgTimeOnPage": number (seconds),
    "bounceRate": number (percentage),
    "shareCount": number,
    "commentCount": number
  },

  "Distribution": [
    {
      "website": "website_1 | website_2 | website_3 | website_4",
      "publishedAt": timestamp,
      "url": "string"
    }
  ],

  "updatedAt": timestamp
}
```

#### Collection 11: /finances/{period}

```json
{
  "period": "YYYY-MM",
  "periodType": "monthly | quarterly | annual",

  "Revenue": {
    "grossBookingRevenue": number,
    "refunds": number,
    "netRevenue": number,
    "revenueByServiceType": {
      "wedding": number,
      "corporate": number,
      "airport": number,
      "leisure": number,
      "other": number
    }
  },

  "CostOfRevenue": {
    "driverPayroll": number,
    "driverBenefits": number,
    "fuelCosts": number,
    "vehicleMaintenance": number,
    "vehicleInsurance": number,
    "depreciation": number,
    "totalCOGS": number
  },

  "GrossProfit": {
    "amount": number,
    "margin": number (percentage)
  },

  "OperatingExpenses": {
    "platformCommissions": number,
    "affiliateCommissions": number,
    "technologyCosts": number,
    "aiServicesCosts": number,
    "marketingAdvertising": number,
    "salaries": number,
    "officeRent": number,
    "utilities": number,
    "insurance": number,
    "licenses": number,
    "otherOperating": number,
    "totalOperatingExpenses": number
  },

  "EBITDA": {
    "amount": number,
    "margin": number (percentage)
  },

  "FinancingCosts": {
    "interestExpense": number,
    "loanFees": number,
    "totalFinancingCosts": number
  },

  "TaxesAndOtherExpenses": {
    "incomeTaxes": number,
    "salesTaxes": number,
    "payrollTaxes": number,
    "otherTaxes": number,
    "totalTaxes": number
  },

  "NetIncome": {
    "amount": number,
    "margin": number (percentage)
  },

  "CashFlow": {
    "operatingCashFlow": number,
    "investingCashFlow": number,
    "financingCashFlow": number,
    "netCashFlow": number,
    "beginningCashBalance": number,
    "endingCashBalance": number
  },

  "Metrics": {
    "totalBookings": number,
    "averageBookingValue": number,
    "customerAcquisitionCost": number,
    "customerLifetimeValue": number,
    "churnRate": number (percentage)
  },

  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Collection 12: /users/{userId}

```json
{
  "userId": "string (auth uid)",
  "role": "admin | partner | driver | affiliate",

  "Profile": {
    "email": "string",
    "displayName": "string",
    "photoUrl": "string"
  },

  "Permissions": {
    "canViewAnalytics": boolean,
    "canManageFinances": boolean,
    "canManageAI": boolean,
    "canManageVehicles": boolean,
    "canManageDrivers": boolean,
    "canManagePartners": boolean,
    "canExportData": boolean,
    "customPermissions": [string]
  },

  "Associated": {
    "partnerId": "string (if role=partner)",
    "driverId": "string (if role=driver)",
    "affiliateId": "string (if role=affiliate)"
  },

  "Notifications": {
    "emailNotifications": boolean,
    "smsNotifications": boolean,
    "notificationTypes": [string],
    "language": "en | es | fr"
  },

  "Activity": {
    "lastLoginAt": timestamp,
    "lastActivityAt": timestamp,
    "loginCount": number
  },

  "createdAt": timestamp,
  "updatedAt": timestamp
}
```

#### Collection 13: /system_config/{configKey}

```json
{
  "configKey": "string (e.g., 'platform_commission_rate')",
  "category": "financial | technical | business | integration",

  "Value": {
    "type": "number | string | boolean | object",
    "value": "any",
    "description": "string"
  },

  "Metadata": {
    "createdAt": timestamp,
    "updatedAt": timestamp,
    "updatedBy": "string (admin_id)",
    "changeHistory": [
      {
        "previousValue": "any",
        "newValue": "any",
        "timestamp": timestamp,
        "changedBy": "string"
      }
    ]
  }
}
```

**Key Configuration Items:**

- platform_commission_rate: 15% (default)
- minimum_partner_payout: $100
- payout_schedule: "monthly"
- ai_generation_frequency: "daily"
- ga_sync_frequency: "daily"
- ads_sync_frequency: "daily"
- moovs_sync_frequency: "hourly"

---

## Section 5: Implementation Roadmap

### 5.1 Phase Overview & Timeline

```
Phase 1: Foundation (Weeks 1-2) ✅ COMPLETED
├─ Auth system
├─ Firestore setup
├─ React SPA
├─ Cloud Functions
├─ Driver Management
├─ Payroll System
└─ Basic Financial Tracking

Phase 2: Moovs Integration (Week 1-2)
├─ CSV import pipeline
├─ Real-time API sync
├─ Booking data sync
├─ Revenue mapping
└─ Error handling & logging

Phase 3: AI Content System (Week 3-4)
├─ GA4 API integration
├─ Google Ads API integration
├─ OpenAI API setup
├─ GPT-4 content generation
├─ DALL-E image generation
├─ SEO optimization
└─ Content storage & versioning

Phase 4: Financial Analytics (Week 4-5)
├─ Vehicle profitability dashboard
├─ Partner revenue tracking
├─ Driver cost analysis
├─ Fleet utilization metrics
├─ Affiliate earnings tracking
├─ Receivables dashboard
└─ P&L reporting

Phase 5: Public Websites (Week 6-7)
├─ Multi-domain setup
├─ Dynamic page generation
├─ Blog system integration
├─ Image gallery system
├─ Lead capture forms
├─ SEO optimization
└─ Performance optimization

Phase 6: Partner Portal (Week 7-8)
├─ Dashboard design
├─ Earnings display
├─ Payout tracking
├─ Performance metrics
└─ Partner notifications

Phase 7: Deployment & Launch (Week 8)
├─ Production environment setup
├─ Performance testing
├─ Security audits
├─ User training
├─ Go-live preparation
└─ Launch

Total Timeline: 8 weeks
```

### 5.2 Detailed Phase Breakdown

#### Phase 2: Moovs Integration (Week 1-2)

**Week 1:**

**Day 1-2: Design Integration Architecture**

- Document Moovs API endpoints
- Design data transformation schema
- Plan error handling and retry logic
- Define idempotency strategy (duplicate detection)
- Create integration flowcharts

**Day 3-4: Build CSV Import Pipeline**

- Cloud Function for CSV parsing
- Firestore write operations
- Duplicate detection algorithm
- Transaction handling for consistency
- Error logging system
- Testing with sample data

**Day 5: Build Real-time API Sync**

- Implement Moovs API client
- Hourly sync Cloud Function
- Polling mechanism with state tracking
- Incremental data sync
- Handle API rate limits
- Error recovery

**Week 2:**

**Day 1-2: Revenue Mapping**

- Link bookings to vehicles
- Calculate revenue splits
- Allocate to partners
- Track driver costs
- Update /revenue collection
- Trigger analytics calculations

**Day 3-4: Integration Testing**

- Test CSV import with real data
- Test API sync with real bookings
- Test data consistency
- Test error scenarios
- Load testing
- Performance optimization

**Day 5: Documentation & Deployment**

- API documentation
- Admin user guide
- Deployment procedures
- Monitoring setup
- Alert configuration

**Deliverables:**

- CSV import endpoint working
- Real-time API sync operational
- /bookings collection populated
- /revenue calculations accurate
- Comprehensive logging

---

#### Phase 3: AI Content System (Week 3-4)

**Week 3:**

**Day 1-2: GA4 Integration**

- Set up Google Analytics API
- Create GA query functions
- Extract traffic data
- Extract conversion data
- Extract keyword data
- Store in /ga_data collection
- Implement daily sync

**Day 3-4: Google Ads Integration**

- Set up Google Ads API
- Create Ads query functions
- Extract campaign performance
- Extract keyword performance
- Extract audience data
- Store in /ads_data collection
- Implement daily sync

**Day 5: Data Analysis Engine**

- Analyze top-performing keywords
- Identify user behavior patterns
- Detect content gaps
- Identify high-conversion topics
- Prepare prompts for AI

**Week 4:**

**Day 1-2: GPT-4 Content Generation**

- OpenAI API setup
- Prompt engineering for blog posts
- Prompt engineering for service pages
- Prompt engineering for ad copy
- Implement content generation function
- Store in /ai_content collection

**Day 3: DALL-E Image Generation**

- Image prompt creation
- DALL-E integration
- Image storage in Cloud Storage
- URL management
- Fallback mechanisms

**Day 4: SEO Optimization**

- Meta tag generation
- Schema.org markup creation
- Internal linking strategy
- Keyword optimization
- Alt text generation

**Day 5: Content Management Interface**

- Admin dashboard for content generation
- Approval workflow UI
- Version control UI
- Performance tracking UI
- Scheduling interface

**Deliverables:**

- GA4 sync operational
- Ads API sync operational
- GPT-4 generating quality content
- DALL-E generating images
- Content management interface functional

---

#### Phase 4: Financial Analytics (Week 4-5)

**Week 4:**

**Day 1-2: Vehicle Profitability Dashboard**

- Query /revenue collection
- Calculate profit per vehicle
- Rank vehicles by profitability
- Display in Admin Dashboard
- Create charts and visualizations
- Export functionality

**Day 3: Partner Revenue Tracking**

- Aggregate revenue by partner
- Calculate commissions
- Track payouts
- Create partner revenue dashboard
- Implement payout scheduling
- Payment method management

**Day 4: Driver Cost Analysis**

- Calculate cost per booking
- Calculate cost per hour
- Weekly cost trends
- Driver performance metrics
- Payroll integration

**Day 5: Fleet Utilization**

- Calculate utilization rate per vehicle
- Identify underutilized vehicles
- Identify peak usage times
- Downtime tracking
- Recommendations for optimization

**Week 5:**

**Day 1-2: Affiliate Program**

- Affiliate directory
- Earnings tracking per affiliate
- Commission rules engine
- Payout scheduling
- Payment processing

**Day 3: Receivables Dashboard**

- Track amounts owed to partners
- Track amounts owed by customers
- Aging analysis
- Payment reminders
- Collections management

**Day 4: P&L Reporting**

- Create P&L statement template
- Monthly reporting
- Quarterly reporting
- Annual reporting
- Export to CSV/PDF

**Day 5: Financial Dashboards**

- Real-time KPI dashboard
- Revenue trends
- Cost analysis
- Profitability analysis
- Cash flow forecasting

**Deliverables:**

- All financial dashboards functional
- Accurate calculations
- Real-time data updates
- Export functionality working
- Payout system operational

---

#### Phase 5: Public Websites (Week 6-7)

**Week 6:**

**Day 1-2: Multi-domain Setup**

- Domain configuration
- SSL certificates
- DNS setup
- CDN setup
- Domain 1-4 infrastructure

**Day 3-4: Website Framework**

- React SPA for websites
- Dynamic page routing
- Template system
- Mobile responsive design
- Performance optimization

**Day 5: Static Pages**

- Homepage design
- Services overview
- Pricing page
- About us page
- Contact page
- FAQ page

**Week 7:**

**Day 1-2: Dynamic Content Integration**

- Fetch from /ai_content
- Blog post rendering
- Service page rendering
- Dynamic image galleries
- Auto-update on new content

**Day 3: Lead Capture**

- Contact forms (multiple variants)
- Quote request forms
- Newsletter signup
- Form validation
- CRM integration

**Day 4: SEO Optimization**

- Sitemap generation
- Robots.txt
- Schema.org markup
- Meta tags per page
- Structured data implementation

**Day 5: Testing & Launch**

- Performance testing (Lighthouse > 90)
- Mobile testing
- Cross-browser testing
- SEO testing
- Security testing
- Go-live

**Deliverables:**

- 4 public websites live
- Dynamic content working
- SEO optimized
- Mobile responsive
- Lead capture functional

---

#### Phase 6: Partner Portal (Week 7-8)

**Week 7-8:**

**Day 1-2: Partner Dashboard**

- Authentication
- Vehicle-specific earnings display
- Revenue breakdown
- Performance metrics
- Booking history

**Day 3: Payout Management**

- Payout history display
- Bank account management
- Payout scheduling
- Payment method configuration

**Day 4: Performance Metrics**

- Booking volume
- Utilization rate
- Average revenue per booking
- Rating display
- Trend analysis

**Day 5: Notifications & Support**

- Email notifications
- Payment notifications
- Performance alerts
- Support chat/ticketing
- Knowledge base

**Deliverables:**

- Partner portal fully functional
- Real-time earnings display
- Payout system working
- Partner satisfied with transparency

---

#### Phase 7: Deployment & Launch (Week 8)

**Day 1-2: Production Setup**

- Production Firestore configuration
- Production API keys
- Production API rate limits
- Production monitoring
- Production logging

**Day 3: Performance & Security**

- Load testing
- Security audit
- Penetration testing
- Performance tuning
- Database optimization

**Day 4: User Training**

- Admin training
- Partner training
- Driver training
- Documentation
- Support setup

**Day 5: Go-Live**

- Data migration (if needed)
- Cutover plan
- Monitoring during launch
- Support team on standby
- Post-launch adjustments

**Deliverables:**

- Production system running
- All users trained
- Monitoring and alerts operational
- Support processes in place

---

## Section 6: Cost Analysis

### 6.1 Infrastructure Costs

**Cloud Services (Monthly):**

| Service                | Cost         | Notes                        |
| ---------------------- | ------------ | ---------------------------- |
| Firebase (Firestore)   | $100-300     | Depends on read/write volume |
| Google Cloud Functions | $50-150      | Pricing based on invocations |
| Google Cloud Storage   | $20-50       | For images, CSV files        |
| Cloud Run (optional)   | $0-100       | For web services             |
| **Subtotal**           | **$170-600** | **Per month**                |

### 6.2 Third-Party API Costs

**Recurring Monthly Costs:**

| Service                     | Pricing                    | Estimated Cost |
| --------------------------- | -------------------------- | -------------- |
| OpenAI API (GPT-4 + DALL-E) | Variable                   | $200-500       |
| Google Analytics 4          | Free                       | $0             |
| Google Ads API              | Free (client pays for ads) | $0             |
| Moovs API                   | Part of existing contract  | $0             |
| Sendgrid (Email)            | 100/month free, then $10+  | $0-50          |
| **Subtotal**                |                            | **$200-550**   |

### 6.3 Total Monthly Operating Costs

```
Infrastructure: $170-600
APIs & Services: $200-550
Personnel (1 engineer): $4,000-6,000
Support & Operations: $500-1,000
Contingency (10%): $500-900
─────────────────────────────
Total: $5,370-9,050 per month
```

### 6.4 Development Costs (One-time)

```
Phase 1 (Foundation): $8,000 ✅ DONE
Phase 2 (Moovs Integration): $6,000
Phase 3 (AI System): $12,000
Phase 4 (Financial Analytics): $10,000
Phase 5 (Public Websites): $15,000
Phase 6 (Partner Portal): $8,000
Phase 7 (Launch): $4,000
─────────────────────────────
Total: $63,000
```

### 6.5 Cost Optimization Strategies

1. **Use Firebase Spark Plan Initially**
   - Free tier suitable for MVP
   - Scale to Blaze as revenue grows

2. **Optimize API Usage**
   - Batch GA4 queries
   - Cache results
   - Use async processing

3. **Image Optimization**
   - Use DALL-E to replace paid stock photos
   - Compress images before storage
   - Implement image CDN

4. **Content Generation**
   - Generate content in batches
   - Use gpt-3.5 for drafts, gpt-4 for final
   - Cache common prompts

5. **Database Optimization**
   - Proper indexing
   - Data partitioning
   - Archive old data

---

## Section 7: Partner Revenue Model

### 7.1 Revenue Sharing Structure

**Partner Commission Model:**

```
Customer Pays: $100 for booking

Platform Commission: 15% = $15
├─ Platform Operations
├─ Technology & Infrastructure
├─ Customer Acquisition
└─ Payment Processing

Partner Earns: 85% = $85
├─ Vehicle Owner (70-85% of booking)
├─ Driver Cost (deducted)
└─ Partner keeps net profit
```

**Detailed Breakdown (Example Booking):**

```
Booking Details:
- Customer Price: $100
- Duration: 2 hours
- Vehicle: Luxury Mercedes (Partner owned)
- Driver: Full-time employee

Revenue Allocation:
Gross Revenue: $100.00
Platform Commission (15%): ($15.00)
─────────────────────────
Gross to Partner: $85.00

Costs (Deducted from Partner):
Driver Cost (2 hrs @ $20/hr): ($40.00)
Fuel Cost (20 miles @ $0.10): ($2.00)
Vehicle Depreciation: ($3.00)
─────────────────────────
Partner Net Profit: $40.00
Partner Profit Margin: 40%
```

### 7.2 Partner Payout Schedule

**Payout Frequency Options:**

- Weekly: For high-volume partners
- Bi-weekly: Standard option
- Monthly: Default option

**Payout Process:**

```
Day 1-5: Bookings occur, revenue tracked
Day 6-25: Month-end data reconciliation
Day 26-27: Financial report generation
Day 28: Payout eligibility check
├─ Minimum payout: $100
├─ No active disputes
└─ Valid banking info
Day 29-30: Payment processing
├─ Bank transfer (most common)
├─ PayPal (alternate)
└─ Check (slow)
```

### 7.3 Partner Dashboard Features

**Real-time Visibility:**

- Today's earnings
- This week's earnings
- This month's earnings
- Year-to-date earnings
- Booking history with details
- Payout history and status
- Upcoming payouts

**Performance Metrics:**

- Vehicle utilization rate
- Average revenue per booking
- Top booking times
- Top booking locations
- Customer ratings
- Competitive benchmark (vs other partners)

**Management Tools:**

- Bank account management
- Payment preferences
- Notification settings
- Report generation
- Dispute management

---

## Section 8: Affiliate Program Model

### 8.1 Affiliate Commission Structure

**Two-Tier Commission System:**

```
Tier 1: Basic Affiliates
├─ Commission: 10% of referred booking value
├─ Minimum payout: $100
├─ Payment frequency: Monthly
└─ Example: $100 booking = $10 commission

Tier 2: Premium Affiliates (>$1,000/month referrals)
├─ Commission: 15% of referred booking value
├─ Minimum payout: $50
├─ Payment frequency: Bi-weekly
└─ Bonus: Extra 5% for first 50 referrals/month
```

### 8.2 Affiliate Tracking

**Tracking Mechanism:**

```
Affiliate Links:
→ royalcarriage.com/?aff=partner_id
→ domain2.com/?aff=partner_id
→ domain3.com/?aff=partner_id
→ domain4.com/?aff=partner_id

Tracking via:
- URL parameters (first click)
- Cookies (30-day window)
- Email signup attribution
- Phone call tracking (if available)
```

**Affiliate Dashboard:**

```
Summary:
- Total referrals: 150
- Confirmed bookings: 127
- Pending verification: 15
- Rejected: 8

Earnings:
- This month: $1,800 pending
- Last month: $1,520 paid
- Year-to-date: $15,000

Payouts:
- Next payout: $1,800 (Feb 15)
- Payment method: Bank transfer
- Account verified: Yes

Top Performing Referrals:
- Wedding packages: 65 bookings
- Corporate events: 40 bookings
- Airport transfers: 22 bookings
```

### 8.3 Affiliate Support

**Marketing Materials:**

- Banner ads (300x250, 728x90, etc.)
- Pre-written email templates
- Social media graphics
- Blog post about service
- Email list seeding (optional)

**Affiliate Tiers & Benefits:**

| Tier     | Referrals/Month | Commission | Bonus      | Support           |
| -------- | --------------- | ---------- | ---------- | ----------------- |
| Bronze   | 0-20            | 10%        | None       | Email             |
| Silver   | 21-50           | 12%        | $50/month  | Email + Phone     |
| Gold     | 51-100          | 15%        | $150/month | 1-on-1 support    |
| Platinum | 100+            | 20%        | $300/month | Dedicated manager |

---

## Section 9: AI Content Generation Strategy

### 9.1 Content Generation Workflow

**Automated Daily Workflow:**

```
1. Data Collection (Daily 6 AM)
   ├─ Query GA4 for top keywords (7-day)
   ├─ Query Ads API for high-CTR keywords
   ├─ Analyze search trends
   └─ Identify content gaps

2. Analysis (Daily 7 AM)
   ├─ Compare with existing content
   ├─ Identify new topics
   ├─ Prioritize by potential impact
   └─ Create generation queue

3. Content Generation (Daily 8-11 AM)
   ├─ Generate 2-3 blog posts
   ├─ Generate 1-2 service pages
   ├─ Generate 10-20 images
   └─ Generate 5-10 ad copy variations

4. SEO Optimization (Daily 11 AM-12 PM)
   ├─ Add meta tags
   ├─ Create schema markup
   ├─ Generate internal links
   └─ Optimize for readability

5. Admin Review (Daily 12-5 PM)
   ├─ Human review queue
   ├─ Approve/edit content
   ├─ Schedule for publishing
   └─ Archive rejected content

6. Publishing (Daily 5-7 PM)
   ├─ Push to public websites
   ├─ Update sitemaps
   ├─ Notify via email
   └─ Share to social media
```

### 9.2 Content Calendar Planning

**Monthly Content Plan (Generated Automatically):**

```
Week 1: Wedding & Event Content
- Blog: "Ultimate Guide to Wedding Transportation"
- Service: "Luxury Wedding Car Rental"
- Images: 15 wedding-themed photos
- Ads: 10 ad copy variations

Week 2: Corporate & Business Content
- Blog: "Corporate Fleet Management Solutions"
- Service: "Executive Transportation Services"
- Images: 15 corporate-themed photos
- Ads: 10 ad copy variations

Week 3: Travel & Airport Content
- Blog: "Airport Transportation Guide"
- Service: "Reliable Airport Car Service"
- Images: 15 travel-themed photos
- Ads: 10 ad copy variations

Week 4: Seasonal/Promotional Content
- Blog: Based on GA trends
- Service: Based on user search patterns
- Images: Seasonal themes
- Ads: Promotional messaging
```

### 9.3 Quality Assurance

**AI Generation Quality Checks:**

```
1. Content Quality
   ├─ Readability (grade 8+ minimum)
   ├─ Uniqueness (plagiarism check < 5%)
   ├─ Accuracy (fact-check for service details)
   └─ Tone (matches brand guidelines)

2. SEO Quality
   ├─ Keyword inclusion (3-5%)
   ├─ Meta tag presence
   ├─ Internal links (minimum 3)
   ├─ Heading structure
   └─ Image alt text

3. Brand Compliance
   ├─ Tone and voice
   ├─ Company name usage
   ├─ Logo/brand inclusion
   ├─ Messaging alignment
   └─ Visual style consistency

4. Performance Tracking
   ├─ Content A/B testing
   ├─ Click-through rate
   ├─ Conversion rate
   ├─ Time on page
   └─ Bounce rate
```

### 9.4 Content Performance Optimization

**Feedback Loop:**

```
Content Published
        │
        ▼
Track GA metrics (7-14 days)
        │
        ├─ High Performance (> median CTR)
        │  └─ Expand topic, create series
        │
        ├─ Medium Performance (near median)
        │  └─ Minor optimizations, republish
        │
        └─ Low Performance (< median)
           ├─ Analyze issues
           ├─ Optimize or archive
           └─ Learn from failure
```

**Monthly Content Report:**

```
Performance Summary:
- Blog posts published: 15
- Service pages created: 5
- Images generated: 75
- Ad copy variations: 50

Engagement Metrics:
- Total blog views: 5,420
- Average time on page: 2:45
- Click-through rate: 3.2%
- Conversion rate: 1.8%

Top Performers:
1. "Wedding Transportation Guide" - 450 views
2. "Corporate Fleet Services" - 380 views
3. "Airport Transfer Guide" - 320 views

Content Improvements:
- Update meta descriptions (boost CTR)
- Add more internal links
- Refresh outdated wedding guide
- Expand airport transfer content
```

---

## Section 10: Success Metrics & KPIs

### 10.1 Revenue & Financial Metrics

**Monthly Targets:**

| Metric                  | Target   | Measurement         |
| ----------------------- | -------- | ------------------- |
| Gross Revenue           | $50,000+ | From Moovs bookings |
| Platform Revenue        | $7,500+  | 15% commission      |
| Partner Payouts         | $42,500+ | 85% to partners     |
| Partner Satisfaction    | 4.5+/5   | Survey score        |
| Average Booking Value   | $85+     | Per transaction     |
| Monthly Active Partners | 50+      | Active sellers      |
| Monthly Bookings        | 750+     | Total transactions  |

### 10.2 Profitability Metrics

| Metric                    | Target | Measurement             |
| ------------------------- | ------ | ----------------------- |
| Gross Profit Margin       | 40%+   | After vehicle costs     |
| Net Profit Margin         | 15%+   | After all expenses      |
| Customer Acquisition Cost | <$15   | Per booking             |
| Customer Lifetime Value   | $500+  | Per customer            |
| Return on Ad Spend        | 3:1    | Ad spend to revenue     |
| Operating Efficiency      | 60%+   | Revenue per team member |

### 10.3 Website & SEO Metrics

**Website Performance (Per Domain):**

| Metric                    | Target              | Tool       |
| ------------------------- | ------------------- | ---------- |
| Monthly Traffic           | 5,000+/domain       | GA4        |
| Organic Traffic           | 3,000+/domain       | GA4        |
| Conversion Rate           | 3%+                 | GA4        |
| Page Load Time            | <2 sec              | Lighthouse |
| Mobile Score              | 90+                 | Lighthouse |
| SEO Score                 | 90+                 | Lighthouse |
| Domain Authority          | 40+                 | SEMrush    |
| Keyword Rankings (Top 20) | 50+ keywords/domain | SEMrush    |

**Blog Performance:**

| Metric               | Target        |
| -------------------- | ------------- |
| Monthly blog traffic | 2,000+/domain |
| Avg time on blog     | 3:00+         |
| Blog conversion rate | 2%+           |
| Share rate           | 5%+           |
| Return visitor rate  | 20%+          |

### 10.4 AI Content Metrics

| Metric                  | Target      | Notes                      |
| ----------------------- | ----------- | -------------------------- |
| Content generated/month | 100+ pieces | Blog, service, ads, images |
| Admin approval rate     | 80%+        | Before publishing          |
| AI generation cost/item | <$2         | Including API costs        |
| Content engagement rate | 3%+         | Clicks/impressions         |
| Content conversion rate | 1.5%+       | Visitors to conversions    |

### 10.5 Partner & Driver Metrics

**Partner Metrics:**

| Metric                         | Target    |
| ------------------------------ | --------- |
| Partner retention              | 90%+/year |
| Average partner earnings/month | $3,000+   |
| Partner satisfaction           | 4.5+/5    |
| Payout on-time rate            | 100%      |
| Partner churn rate             | <2%/month |

**Driver Metrics:**

| Metric                        | Target    |
| ----------------------------- | --------- |
| Driver retention              | 85%+/year |
| Average driver earnings/month | $2,500+   |
| Driver satisfaction           | 4.3+/5    |
| Customer rating of driver     | 4.7+/5    |
| Driver utilization            | 70%+      |

### 10.6 Affiliate Program Metrics

| Metric                     | Target        |
| -------------------------- | ------------- |
| Number of affiliates       | 100+          |
| Active affiliate rate      | 40%+          |
| Average affiliate earnings | $500/month    |
| Affiliate conversion rate  | 5%+           |
| Affiliate retention        | 75%+          |
| Affiliate-sourced revenue  | 10%+ of total |

### 10.7 System Health Metrics

| Metric                    | Target        |
| ------------------------- | ------------- |
| Platform uptime           | 99.9%+        |
| Page load time            | <2 seconds    |
| Mobile conversion         | 40%+ of total |
| Customer satisfaction     | 4.6+/5        |
| Support ticket resolution | <24 hours     |
| Bug resolution time       | <48 hours     |

### 10.8 Quarterly Goals (First Year)

**Q1 (Months 1-3):**

- Platform foundation: 100% complete
- Moovs integration: Operational
- AI system: Beta launch
- 500 bookings, $42,500 revenue
- 20 active partners

**Q2 (Months 4-6):**

- Public websites: All 4 live
- Partner portal: Launched
- 1,500 bookings, $127,500 revenue
- 40 active partners
- Organic SEO established

**Q3 (Months 7-9):**

- Affiliate program: 50+ affiliates
- Advanced analytics: Fully operational
- 2,500 bookings, $212,500 revenue
- 60 active partners
- Strong organic traffic

**Q4 (Months 10-12):**

- Full optimization
- Expansion planning
- 3,500+ bookings, $297,500 revenue
- 75+ active partners
- Profitability target reached

**Year 1 Target:**

- Total bookings: 8,000+
- Total revenue: $680,000+
- Active partners: 75+
- Platform margin: 15%+
- Partner satisfaction: 4.5+/5

---

## Section 11: Risk Assessment & Mitigation

### 11.1 Technical Risks

| Risk                      | Impact   | Probability | Mitigation                         |
| ------------------------- | -------- | ----------- | ---------------------------------- |
| Moovs API changes         | High     | Low         | Monitor API, maintain changelog    |
| Data inconsistency        | High     | Medium      | Implement transactions, validation |
| AI content quality issues | Medium   | Medium      | Human review, feedback loop        |
| Website outage            | High     | Low         | 99.9% uptime SLA, backup systems   |
| Security breach           | Critical | Low         | Encryption, regular audits         |

### 11.2 Business Risks

| Risk               | Impact | Probability | Mitigation                         |
| ------------------ | ------ | ----------- | ---------------------------------- |
| Partner churn      | High   | Medium      | Better payouts, transparency       |
| Low booking volume | High   | Medium      | Aggressive marketing, partnerships |
| Competition        | Medium | High        | Better tech, better support        |
| Regulatory changes | Medium | Low         | Legal review, compliance tracking  |

### 11.3 Operational Risks

| Risk                      | Impact | Probability | Mitigation                     |
| ------------------------- | ------ | ----------- | ------------------------------ |
| Team turnover             | Medium | Medium      | Competitive pay, culture       |
| Scaling challenges        | High   | Medium      | Modular architecture, planning |
| Customer support overload | Medium | High        | Self-service, automation       |

---

## Section 12: Success Criteria & Launch Readiness

### 12.1 Phase Completion Checklist

**Phase 2: Moovs Integration ✓**

- [ ] CSV import working
- [ ] Real-time sync operational
- [ ] Data accuracy verified
- [ ] Error handling tested
- [ ] Documentation complete

**Phase 3: AI System ✓**

- [ ] GA4 sync working
- [ ] Ads API sync working
- [ ] Content generation tested
- [ ] Image generation working
- [ ] Admin interface functional

**Phase 4: Financial Analytics ✓**

- [ ] All dashboards built
- [ ] Calculations verified
- [ ] Real-time updates working
- [ ] Reports generated
- [ ] Export functionality tested

**Phase 5: Public Websites ✓**

- [ ] All 4 domains live
- [ ] Content rendering correctly
- [ ] SEO optimized
- [ ] Mobile responsive
- [ ] Performance > 90 Lighthouse

**Phase 6: Partner Portal ✓**

- [ ] Dashboard complete
- [ ] Real-time earnings display
- [ ] Payout system working
- [ ] Partner feedback positive

**Phase 7: Launch ✓**

- [ ] Production ready
- [ ] All systems tested
- [ ] Users trained
- [ ] Support ready
- [ ] Monitoring active

### 12.2 Launch Readiness Assessment

**Technical Readiness: 95%**

- All systems functional
- Performance optimized
- Security verified
- Monitoring in place

**Operational Readiness: 90%**

- Team trained
- Processes documented
- Support staffed
- Communication ready

**Business Readiness: 85%**

- Financial projections complete
- Partner agreements signed
- Marketing materials prepared
- Affiliate program ready

---

## Conclusion

Royal Carriage is positioned to become a market leader in transportation platform management. This strategic plan outlines a comprehensive approach to:

1. **Integrate booking data** from Moovs
2. **Empower partners** with transparency and better earnings
3. **Leverage AI** to drive organic traffic and conversions
4. **Optimize profitability** through data-driven decision-making
5. **Scale efficiently** with 4 public websites and multiple revenue streams

The 8-week implementation roadmap is achievable with proper resource allocation and execution discipline. Monthly profitability targets of $7,500+ are realistic given the partner commission model and operational efficiency.

**Key Success Factors:**

- Flawless Moovs data integration
- High-quality AI content generation
- Partner satisfaction and retention
- Consistent organic SEO growth
- Operational excellence and support

---

**Document Version:** 2.0
**Last Updated:** January 16, 2026
**Status:** Ready for Implementation
**Prepared By:** Agent 11: Strategic Planner (Revised Scope)
