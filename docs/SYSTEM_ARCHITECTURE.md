# System Architecture - Complete Integration Map

## Overview

Royal Carriage Platform is a multi-system integration connecting booking management, analytics, content generation, and financial operations through a unified data layer in Firestore.

## System Components

### 1. Frontend Systems

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACES                           │
├─────────────────────────────────────────────────────────────┤
│  Admin Dashboard      Driver Portal      Partner Portal      │
│  /admin/*             /driver/*          /partner/*          │
│  Analytics            Trip Management    Earnings Tracking   │
│  Payments             Documents          Payouts             │
└─────────────────────────────────────────────────────────────┘
        │                    │                    │
        └────────┬───────────┴───────────────────┘
                 │
          Unified Firebase Auth
          (portalAuth service)
                 │
┌─────────────────────────────────────────────────────────────┐
│                   FIRESTORE DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                               │
│  - bookings              (trips, customers)                 │
│  - drivers              (driver info, docs)                 │
│  - partners             (vehicle partners)                  │
│  - revenue              (transaction data)                  │
│  - ai_content           (generated posts/pages)             │
│  - portal_users         (auth info)                         │
│  - form_submissions     (lead data)                         │
│  - webhook_logs         (integration audit)                 │
└─────────────────────────────────────────────────────────────┘
```

### 2. External Integrations

```
┌──────────────────────────────────────────────────────────┐
│                EXTERNAL SYSTEMS                           │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  MOOVS (Booking Source)                                   │
│    └─> CSV Import Pipeline                               │
│         └─> [Deduplication] → [Validation]               │
│             └─> [Revenue Mapping] → [Firestore]           │
│                                                            │
│  STRIPE (Payments)                                        │
│    └─> Payment Webhooks                                   │
│         └─> [Charge Events] → [GA4 Conversion]           │
│             └─> [Revenue Tracking] → [Payroll]            │
│                                                            │
│  GA4 (Analytics)                                          │
│    ├─> Event Ingestion                                    │
│    │   └─> [Bookings] [Payments] [Forms]                 │
│    └─> Data Querying                                      │
│        └─> [GA4Service] → [Content Generation]            │
│                                                            │
│  GOOGLE ADS (Conversion Tracking)                         │
│    └─> Conversion Import                                  │
│         └─> [Payment Events] → [Conversion Label]         │
│             └─> [Reporting] → [Dashboard]                 │
│                                                            │
│  PUBLIC WEBSITES (Front-facing)                           │
│    ├─> Airport Service                                    │
│    ├─> Corporate Service                                  │
│    ├─> Wedding Service                                    │
│    └─> Party Bus Service                                  │
│         └─> [AI Content Loader] → [Dynamic Pages]         │
│             └─> [Forms] → [GA4 Events]                    │
│                                                            │
│  AI CONTENT SYSTEM                                        │
│    └─> Content Generator                                  │
│        ├─> Input: GA4 Data + Keywords                    │
│        ├─> Output: Blog Posts + Service Pages             │
│        └─> Publishing: Firestore → Websites               │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

### 3. Cloud Functions Architecture

```
SCHEDULED FUNCTIONS (Pub/Sub)
├─ dailyMoovsImport (8 AM)
│  └─ Fetch → Transform → Validate → Import → Log
│
├─ hourlyGA4Sync (Every hour)
│  └─ Fetch → Analyze → Store → Prepare for Content
│
├─ dailyAIContentGeneration (6 AM)
│  └─ Query GA4 → Generate Content → Publish → Track
│
├─ weeklyReconciliation (Sunday 2 AM)
│  └─ Verify Imports → Check Discrepancies → Report
│
└─ monthlyFinancialReport (1st @ 3 AM)
   └─ Calculate Revenue → Generate Report → Archive

WEBHOOK ENDPOINTS (HTTPS)
├─ POST /webhook/moovs
│  └─ Import Notifications → Trigger Import
│
├─ POST /webhook/payment
│  └─ Payment Events → Update Booking → GA4 Conversion
│
├─ POST /webhook/image-gen
│  └─ Image Ready → Update Content → Link to Posts
│
├─ POST /webhook/content
│  └─ Published → Update Status → Track Event
│
└─ POST /webhook/form
   └─ Form Submitted → Save Data → GA4 Lead
```

## Data Flow Diagram

```
┌─────────────┐
│ Moovs       │
│ (Bookings)  │
└──────┬──────┘
       │ CSV Export (daily)
       ▼
┌──────────────────────────┐
│ CSV Import Pipeline      │
│ (idempotent, validated)  │
└──────┬───────────────────┘
       │ Validated bookings
       ▼
┌──────────────────────────┐     ┌─────────────┐
│ Firestore                │────▶│ GA4 Events  │
│ - bookings               │     │ (booking    │
│ - customers              │     │  created)   │
│ - drivers                │     └─────────────┘
│ - revenue                │
└──────┬───────────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
    ┌────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐
    │Financial│  │Dashboard│  │Financial │  │Payroll   │
    │Tracking │  │Analytics│  │Reporting │  │System    │
    └────────┘  └─────────┘  └──────────┘  └──────────┘
       │                          │              │
       │              ┌───────────┴──────────────┘
       │              │
       ▼              ▼
    ┌──────────────────────────┐
    │ GA4 Data Analysis        │
    │ - Top Pages              │
    │ - Keywords               │
    │ - Content Gaps           │
    │ - Trending Topics        │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ AI Content Generator     │
    │ - Blog Posts             │
    │ - Service Pages          │
    │ - FAQs                   │
    │ - Image Descriptions     │
    └──────────┬───────────────┘
               │
               ├──────────────┬──────────────┐
               │              │              │
               ▼              ▼              ▼
            ┌────────┐   ┌──────────┐  ┌─────────────┐
            │Content │   │AI Image  │  │Image CDN    │
            │Storage │   │Generator │  │Delivery     │
            │(Firestore)│ │          │  │(Global)     │
            └────────┘   └──────────┘  └─────────────┘
               │              │              │
               └──────────────┼──────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Public Websites      │
                   │ - Airport            │
                   │ - Corporate          │
                   │ - Wedding            │
                   │ - Party Bus          │
                   └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ GA4 Event Tracking   │
                   │ - Page Views         │
                   │ - Form Submissions   │
                   │ - Click Events       │
                   │ - Conversions        │
                   └──────────┬───────────┘
                              │
                              └──────────────┐
                                             │
                       ┌─────────────────────┘
                       │
                       ▼
                   ┌──────────────────────┐
                   │ Dashboard            │
                   │ (Full Cycle)         │
                   │ - ROI Analysis       │
                   │ - Content Performance│
                   │ - Conversion Funnel  │
                   └──────────────────────┘
```

## Service Layer Architecture

### Firestore Sync Service

- Real-time data subscriptions
- Intelligent caching (5-10 min TTL)
- Offline support with sync queue
- Conflict resolution
- Performance monitoring

**Files:**

- `/src/services/integration/firestoreSync.ts`

### GA4 Integration Service

- Event sending (Measurement Protocol)
- Conversion tracking
- Custom dimensions
- Event logging for audit trail
- Batch processing

**Files:**

- `/src/services/integration/ga4Integration.ts`
- `/src/services/ai/ga4Service.ts`

### Portal Auth Service

- Unified Firebase Auth
- Role-based access control
- Multi-portal session management
- User profile management
- MFA support

**Files:**

- `/src/services/integration/portalAuth.ts`

### Webhook Manager

- Signature verification
- Event routing
- Audit logging
- Error handling and retry

**Files:**

- `/src/services/integration/webhookManager.ts`
- `/functions/webhookHandler.ts`

## Data Collections (Firestore)

```
tenants/
├─ {tenantId}/
│  ├─ bookings/
│  │  ├─ {bookingId}
│  │  │  ├─ pickupTime: timestamp
│  │  │  ├─ dropoffLocation: string
│  │  │  ├─ driverId: string
│  │  │  ├─ status: 'confirmed'|'completed'|'cancelled'
│  │  │  ├─ revenue: { total, platform, driver, partner }
│  │  │  └─ moovs_id: string (for reconciliation)
│  │
│  ├─ customers/
│  │  ├─ {customerId}
│  │  │  ├─ email: string
│  │  │  ├─ phone: string
│  │  │  ├─ totalBookings: number
│  │  │  └─ totalSpent: number
│  │
│  ├─ drivers/
│  │  ├─ {driverId}
│  │  │  ├─ email: string
│  │  │  ├─ name: string
│  │  │  ├─ status: 'active'|'inactive'
│  │  │  ├─ totalTrips: number
│  │  │  ├─ rating: number
│  │  │  └─ documentsVerified: boolean
│  │
│  ├─ revenue/
│  │  ├─ {revenueId}
│  │  │  ├─ bookingId: string
│  │  │  ├─ amount: number
│  │  │  ├─ date: timestamp
│  │  │  ├─ source: 'moovs'|'direct'
│  │  │  └─ allocations: { driver, partner, platform }
│
revenue/
├─ {revenueId} (global revenue tracking)
│  ├─ amount: number
│  ├─ currency: string
│  ├─ date: timestamp
│  └─ tenantId: string

moovs_bookings/ (imported from CSV)
├─ {bookingId}
│  ├─ moovs_id: string (unique in Moovs system)
│  ├─ import_id: string
│  ├─ booking_date: timestamp
│  ├─ pickup_time: timestamp
│  ├─ pickup_location: string
│  ├─ dropoff_location: string
│  ├─ revenue: { total, base, markup }
│  └─ imported_at: timestamp

moovs_imports/ (audit trail)
├─ {importId}
│  ├─ fileHash: string
│  ├─ fileName: string
│  ├─ uploadedAt: timestamp
│  ├─ uploadedBy: string
│  ├─ rowCount: number
│  ├─ successCount: number
│  ├─ errorCount: number
│  ├─ duplicateCount: number
│  ├─ status: 'completed'|'failed'
│  └─ errors: [{ rowNumber, error, value }]

ai_content/
├─ {contentId}
│  ├─ type: 'blog_post'|'service_page'|'faq'
│  ├─ title: string
│  ├─ content: string
│  ├─ imageUrl: string
│  ├─ ga4Keyword: { keyword, searchCount, position }
│  ├─ status: 'draft'|'published'
│  ├─ generatedAt: timestamp
│  ├─ publishedAt: timestamp
│  ├─ publishedUrl: string
│  └─ performance: { views, clicks, conversions }

form_submissions/
├─ {submissionId}
│  ├─ formId: string
│  ├─ formName: string
│  ├─ formData: object
│  ├─ userAgent: string
│  ├─ ipAddress: string
│  ├─ submittedAt: timestamp
│  └─ convertedToBooking: boolean

portal_users/ (auth profiles)
├─ {uid}
│  ├─ email: string
│  ├─ role: 'admin'|'driver'|'partner'|'customer'
│  ├─ portal: string
│  ├─ status: 'active'|'inactive'|'pending_verification'
│  ├─ createdAt: timestamp
│  ├─ lastLogin: timestamp
│  └─ metadata: object

webhook_logs/ (audit trail)
├─ {logId}
│  ├─ source: 'moovs'|'payment'|'image_gen'|'content'|'form'
│  ├─ eventType: string
│  ├─ status: 'success'|'failed'|'pending'
│  ├─ receivedAt: timestamp
│  ├─ processedAt: timestamp
│  ├─ payloadHash: string
│  └─ error: string

sync_logs/ (integration audit)
├─ {logId}
│  ├─ type: 'moovs_import'|'ga4_sync'|'content_generation'
│  ├─ status: 'success'|'failed'|'partial'
│  ├─ startTime: timestamp
│  ├─ completedAt: timestamp
│  ├─ recordsProcessed: number
│  ├─ recordsImported: number
│  ├─ errorSummary: string
│  └─ details: object

ga4_events/ (local event log)
├─ {eventId}
│  ├─ eventName: string
│  ├─ params: object
│  ├─ userId: string
│  ├─ timestamp: timestamp
│  └─ recordedAt: timestamp

ga4_hourly_snapshots/ (analytics data)
├─ {snapshotId}
│  ├─ hour: number
│  ├─ topPages: [{ path, title, views, bounceRate }]
│  ├─ topKeywords: [{ keyword, searchCount, position }]
│  ├─ trafficSources: [{ source, medium, users, sessions }]
│  └─ timestamp: timestamp

financial_reports/ (monthly analytics)
├─ {reportId}
│  ├─ month: number
│  ├─ year: number
│  ├─ totalRevenue: number
│  ├─ bookingCount: number
│  ├─ averageRevenuePerBooking: number
│  └─ createdAt: timestamp

reconciliation_reports/ (weekly audits)
├─ {reportId}
│  ├─ period: 'weekly'|'monthly'
│  ├─ weekOf: timestamp
│  ├─ importsChecked: number
│  ├─ totalRecords: number
│  ├─ discrepancies: number
│  ├─ status: 'passed'|'failed'
│  └─ completedAt: timestamp
```

## Security Architecture

### Firestore Rules

- Role-based access control
- Tenant isolation
- Collection-level permissions
- Real-time updates for authorized users only

### Firebase Auth

- Email/password authentication
- Multi-factor authentication (optional)
- Role-based authorization
- Session management

### Webhook Security

- HMAC signature verification
- Timestamp validation (5-minute window)
- IP whitelisting (optional)
- Rate limiting

## Performance Optimization

### Caching Strategy

- **Browser cache:** 5-10 minutes TTL
- **Firestore:** Real-time subscriptions with lazy loading
- **API responses:** Cached locally until invalidation

### Indexing

- Compound indexes on frequently filtered collections
- Auto-indexed by Firestore for simple queries
- Manual index management for complex queries

### Pagination

- Cursor-based pagination for large datasets
- Limit queries to 100 items by default
- Client-side lazy loading

## Monitoring & Logging

### Audit Trails

- All imports logged in `moovs_imports`
- All webhooks logged in `webhook_logs`
- All syncs logged in `sync_logs`
- All GA4 events logged locally

### Error Handling

- Failed operations queued for retry
- Exponential backoff for failed webhooks
- Error notifications to admin dashboard
- Detailed error logs in Firestore

### Metrics

- Sync success rate
- Average sync duration
- Webhook processing latency
- Content generation time
- GA4 event delivery rate

## Deployment

### Cloud Functions

```bash
firebase deploy --only functions
```

### Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

### Website Updates

```bash
firebase deploy --only hosting
```

## Testing & Validation

### Unit Tests

- Service layer functions
- Data transformation
- Validation logic

### Integration Tests

- End-to-end workflows
- Cross-service communication
- Data consistency

### E2E Tests

- User portal flows
- Booking creation to revenue tracking
- Content generation pipeline
- Payment processing

See `TESTING_CHECKLIST.md` for detailed test scenarios.
