# Royal Carriage System Architecture

## System Overview

The Royal Carriage system is a multi-site limousine service platform built on Firebase, featuring AI-powered content generation, automated SEO analysis, and comprehensive business analytics.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  Admin Dashboard     Airport Site     Corporate Site            │
│  (Next.js)          (Astro)          (Astro)                    │
│                                                                   │
│  Wedding Site        Party Bus Site                             │
│  (Astro)            (Astro)                                     │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ HTTPS / Firebase Hosting
             │
┌────────────┴────────────────────────────────────────────────────┐
│                    Firebase Services Layer                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Cloud       │  │  Firestore   │  │  Firebase    │         │
│  │  Functions   │  │  Database    │  │  Storage     │         │
│  │  (Node.js 20)│  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         │                  │                  │                  │
│  ┌──────┴──────────────────┴──────────────────┴──────┐         │
│  │           Firebase Authentication                   │         │
│  │           (Email/Password + Custom Claims)         │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ API Calls
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                  Google Cloud Services                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐              ┌──────────────┐                │
│  │  Vertex AI   │              │  Cloud       │                │
│  │  - Gemini    │              │  Scheduler   │                │
│  │  - Imagen    │              │              │                │
│  └──────────────┘              └──────────────┘                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Application Architecture

### 1. Frontend Applications (5 Apps)

#### Admin Dashboard
- **Framework:** Next.js 14 (React 18)
- **Purpose:** Internal management interface
- **URL:** https://admin.royalcarriagelimo.com
- **Key Features:**
  - User management (RBAC)
  - CSV data imports (Moovs, Ads)
  - SEO monitoring and reports
  - Image library management
  - ROI analytics
  - Deployment logs
  - Self-audit tools

#### Airport Site
- **Framework:** Astro 4.x
- **Purpose:** Airport transportation services
- **URL:** https://chicagoairportblackcar.com
- **Key Features:**
  - Service listings (O'Hare, Midway)
  - Fleet showcase
  - Booking integration
  - Location-specific content
  - SEO-optimized pages

#### Corporate Site
- **Framework:** Astro 4.x
- **Purpose:** Executive car services
- **URL:** https://chicagoexecutivecarservice.com
- **Key Features:**
  - Corporate packages
  - Account management
  - Professional driver bios
  - Business testimonials

#### Wedding Site
- **Framework:** Astro 4.x
- **Purpose:** Wedding transportation
- **URL:** https://chicagoweddingtransportation.com
- **Key Features:**
  - Wedding packages
  - Vehicle gallery
  - Venue partnerships
  - Wedding planning integration

#### Party Bus Site
- **Framework:** Astro 4.x
- **Purpose:** Party bus rentals
- **URL:** https://chicago-partybus.com
- **Key Features:**
  - Party bus fleet
  - Event packages
  - Route planning
  - Group booking

### 2. Backend Services (Cloud Functions)

#### API Functions

**Main API Router** (`functions/src/index.ts`)
- Express.js application
- CORS protection with whitelist
- Bearer token authentication
- Route registration

**Authentication Routes** (`/api/auth`)
- User login/logout
- Token refresh
- Custom claims management

**User Management Routes** (`/api/users`)
- CRUD operations
- Role management
- Profile updates

**AI Routes** (`/api/ai`)
- Content generation
- Image generation
- Page analysis
- SEO suggestions

**Import Routes** (`/api/imports`)
- CSV upload processing
- Data validation
- Duplicate detection
- Audit trail creation

#### Scheduled Functions

**dailyPageAnalysis**
- Schedule: Daily at 2:00 AM Chicago time
- Cron: `0 2 * * *`
- Purpose: Analyze all pages for SEO quality
- Actions:
  1. Fetch all pages from Firestore
  2. Send to Gemini for analysis
  3. Generate SEO score (0-100)
  4. Store results in `page_analyses`
  5. Create alerts for low scores

**weeklySeoReport**
- Schedule: Monday at 9:00 AM Chicago time
- Cron: `0 9 * * 1`
- Purpose: Generate weekly SEO summary
- Actions:
  1. Aggregate past 7 days of analyses
  2. Calculate average scores
  3. Identify top/bottom 10 pages
  4. Find common issues
  5. Store report in `reports`

#### Firestore Triggers

**autoAnalyzeNewPage**
- Trigger: onCreate on `settings/master_spec/pages/{pageId}`
- Purpose: Immediate analysis of new pages
- Actions:
  1. Extract page data
  2. Analyze with Gemini
  3. Store results immediately
  4. No waiting for daily batch

**syncUserRole**
- Trigger: onWrite on `users/{userId}`
- Purpose: Sync Firestore roles to Auth custom claims
- Actions:
  1. Detect role changes
  2. Update Firebase Auth custom claims
  3. Enable token-based authorization
  4. Eliminate N+1 Firestore reads in security rules

### 3. Data Layer (Firestore)

See [DATA_MODEL.md](./DATA_MODEL.md) for complete schema.

**Key Collections:**
- `users` - User profiles and roles
- `settings/master_spec/pages` - Page configurations
- `page_analyses` - SEO analysis results
- `reports` - Weekly reports and alerts
- `ai_images` - Generated image metadata
- `trips` - Moovs trip data
- `metrics` - Advertising metrics
- `imports` - Import audit trail

### 4. Storage Layer (Firebase Storage)

**Bucket Structure:**
```
gs://royalcarriagelimoseo.appspot.com/
├── ai-generated/
│   ├── hero/           # Hero images
│   ├── service_card/   # Service card images
│   ├── fleet/          # Fleet photos
│   ├── location/       # Location images
│   └── testimonial/    # Testimonial photos
├── uploads/
│   ├── images/         # User-uploaded images
│   └── documents/      # User-uploaded documents
└── exports/
    └── reports/        # Generated reports
```

**Access Control:**
- Public read for ai-generated/ and specific uploads/
- Authenticated write for uploads/
- Admin-only for exports/

### 5. AI Integration Layer

#### Gemini AI (Content & Analysis)
- **Model:** gemini-1.5-flash (default)
- **Model:** gemini-1.5-pro (complex tasks)
- **Client:** `functions/src/shared/gemini-client.ts`
- **Use Cases:**
  - SEO page analysis
  - Content generation (FAQs, descriptions)
  - Sentiment analysis
  - Translation

#### Imagen AI (Image Generation)
- **Model:** imagegeneration@006
- **Client:** `functions/src/api/ai/image-generator.ts`
- **Use Cases:**
  - Hero images
  - Service card visuals
  - Fleet photography placeholders
  - Location-specific imagery

## Security Architecture

### Authentication Flow

```
1. User enters credentials
   ↓
2. Firebase Auth validates
   ↓
3. Returns ID token (JWT)
   ↓
4. Frontend stores token
   ↓
5. Backend validates token
   ↓
6. Checks custom claims (role)
   ↓
7. Grants/denies access
```

### Role-Based Access Control (RBAC)

**Roles (hierarchical):**
1. **viewer** - Read-only access
2. **editor** - Create/edit content
3. **admin** - Manage users, deployments
4. **superadmin** - Full system access

**Role Storage:**
- Primary: Firebase Auth custom claims (`token.role`)
- Secondary: Firestore `users/{uid}.role`
- Sync: Automatic via `syncUserRole` trigger

**Security Rules Pattern:**
```javascript
// Firestore rules
function getRole() {
  return request.auth.token.role != null ? request.auth.token.role : 'viewer';
}

function hasRole(role) {
  return isAuthenticated() && getRole() == role;
}
```

### API Security

**CORS Whitelist:**
- Production domains only
- Localhost for development
- Reject unauthorized origins

**Authentication:**
- Bearer token in Authorization header
- Token validation on every request
- Custom claims checked for role

**Rate Limiting:**
- Firebase Functions automatic scaling
- Cold start optimization
- Concurrency limits

## Deployment Architecture

### Hosting Configuration

**Firebase Hosting Targets:**
```json
{
  "admin": "royalcarriagelimoseo",
  "airport": "chicagoairportblackcar",
  "corporate": "chicagoexecutivecarservice",
  "wedding": "chicagoweddingtransportation",
  "partybus": "chicago-partybus"
}
```

**Deployment Zones:**
- us-central1 (primary)
- Global CDN edge locations

**Build Pipeline:**
1. Local build (Next.js/Astro)
2. Generate static files
3. Deploy to Firebase Hosting
4. Automatic CDN distribution
5. Zero-downtime deployment

### Function Deployment

**Runtime:** Node.js 20
**Region:** us-central1
**Memory:** 512MB (default), 1GB (AI functions)
**Timeout:** 60s (default), 300s (scheduled)

**Deployment Strategy:**
1. Build TypeScript to JavaScript
2. Deploy to Cloud Functions
3. Gradual rollout (automatic)
4. Health checks
5. Rollback on failure

## Data Flow Examples

### 1. CSV Import Flow

```
User uploads CSV
   ↓
Admin UI reads file
   ↓
POST /api/imports/moovs
   ↓
Parse CSV with auto-delimiter detection
   ↓
Map columns to schema
   ↓
Validate each row
   ↓
Check for duplicates (by ID)
   ↓
Batch write to Firestore
   ↓
Create audit record
   ↓
Return results to UI
```

### 2. Scheduled SEO Analysis Flow

```
Cloud Scheduler triggers (2 AM)
   ↓
dailyPageAnalysis function invoked
   ↓
Fetch all pages from Firestore
   ↓
For each page:
   ├─ Build analysis prompt
   ├─ Call Gemini API
   ├─ Parse JSON response
   ├─ Calculate SEO score
   └─ Store in page_analyses
   ↓
Check for low scores (<50)
   ↓
Create alerts in reports
   ↓
Function completes
```

### 3. Image Generation Flow

```
Admin UI requests image
   ↓
POST /api/ai/generate-image
   ↓
Build prompt based on purpose
   ↓
Call Vertex AI Imagen
   ↓
Receive base64 image data
   ↓
Upload to Firebase Storage
   ↓
Generate public URL
   ↓
Store metadata in Firestore
   ↓
Return URL to client
```

## Monitoring and Observability

### Logging
- Cloud Functions logs (stdout/stderr)
- Firestore audit trail
- Import records
- Deployment logs

### Metrics
- Function execution count/duration
- Firestore read/write operations
- Storage bandwidth
- API response times
- SEO score trends

### Alerts
- Function errors (>1% error rate)
- Firestore quota warnings
- Low SEO scores (<50)
- Failed imports

## Scalability Considerations

### Current Scale
- 5 hosting sites
- ~100 pages across all sites
- ~50 daily function invocations
- <10k Firestore reads/day (optimized)
- <100 images generated/month

### Growth Strategy
1. Horizontal scaling via Firebase
2. Caching with CDN
3. Batch processing for large imports
4. Database indexes for query performance
5. Image CDN for faster delivery

### Bottlenecks and Mitigations
- **Gemini API rate limits:** Batch analysis, use Flash model
- **Firestore reads:** Custom claims, caching
- **Function cold starts:** Keep functions warm with monitoring
- **Image generation costs:** Cache generated images, reuse

## Technology Stack

### Frontend
- Next.js 14 (Admin)
- Astro 4.x (Public sites)
- React 18
- TailwindCSS
- TypeScript

### Backend
- Firebase Cloud Functions (Gen 1)
- Express.js
- TypeScript
- Node.js 20

### Database
- Firestore (NoSQL)
- Firebase Storage (blob)

### AI/ML
- Google Vertex AI
- Gemini 1.5 (text)
- Imagen (images)

### DevOps
- Firebase CLI
- pnpm (package manager)
- Git (version control)

### Monitoring
- Cloud Functions logs
- Firebase Console
- GCP Console

## Future Architecture Considerations

1. **Migration to Gen 2 Functions**
   - Better cold start performance
   - More memory options
   - Enhanced monitoring

2. **Caching Layer**
   - Redis for frequently accessed data
   - CDN caching headers
   - Browser caching strategies

3. **Background Job Queue**
   - Cloud Tasks for async processing
   - Retry logic for failed jobs
   - Priority queues

4. **Advanced Analytics**
   - BigQuery integration
   - Real-time dashboards
   - Predictive analytics

5. **Multi-Region Deployment**
   - Failover strategy
   - Regional data compliance
   - Lower latency globally
