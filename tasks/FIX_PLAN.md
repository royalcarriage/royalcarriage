# Fix Plan - Execution Roadmap

## Overview

Prioritized remediation plan addressing all issues from AUDIT_REPORT.md. Organized by dependency chains to maximize parallel work.

---

## Phase 1: Foundation (Weeks 1-2) - 70 Hours

### Week 1: Security & Database Setup

**Monday-Tuesday (16 hours) - Authentication**

```
Task 1.1: Firebase Auth Setup
- Enable providers: Email/Password, Google OAuth, Microsoft OAuth
- Create auth service module
- Implement password reset flow
- Add 2FA support
- Time: 8 hours
- Owner: Backend Lead

Task 1.2: User Collection & Roles
- Create /users collection schema
- Implement role system (Super Admin, Tenant Admin, Dispatcher, etc.)
- Add custom claims to Firebase Auth
- Create user service
- Time: 6 hours
- Owner: Backend Lead

Task 1.3: Session Management
- Implement token refresh logic
- Create session service
- Add session timeout (30 min default)
- Time: 2 hours
- Owner: Backend Lead
```

**Wednesday-Thursday (16 hours) - Firestore Security**

```
Task 1.4: Firestore Security Rules
- Write comprehensive security rules
- Implement tenant isolation
- Field-level access control
- Validate against auth patterns
- Test in emulator
- Time: 12 hours
- Owner: Security Engineer

Task 1.5: Firestore Collections
- Create all 19 base collections
- Set up Realtime DB structure
- Create indexes (14 required)
- Time: 4 hours
- Owner: Backend Lead
```

**Friday (8 hours) - Testing**

```
Task 1.6: Security Testing
- Test unauthenticated access (should be blocked)
- Test role-based access
- Test tenant isolation
- Test security rules with real data
- Time: 8 hours
- Owner: QA Engineer
```

### Week 2: Frontend Foundation & Critical Functions

**Monday-Wednesday (24 hours) - React Dashboard Scaffold**

```
Task 2.1: Create React SPA
- Initialize Vite project
- Set up routing (React Router v6)
- Install dependencies (Redux, React Hook Form, Tailwind, Recharts)
- Create basic layout (Sidebar, Top Nav, Main Content)
- Time: 8 hours
- Owner: Frontend Lead

Task 2.2: Authentication UI
- Create Login page
- Create Signup/Register page
- Add password reset flow
- Add 2FA UI
- Create protected route wrapper
- Time: 6 hours
- Owner: Frontend Dev

Task 2.3: Dashboard Skeleton
- Create Dashboard page
- Create menu stubs for all sections
- Add KPI card components
- Create basic chart components
- Time: 4 hours
- Owner: Frontend Dev

Task 2.4: Fix 404 Routes
- Update firebase.json rewrites
- Create 404 error page
- Fix all dead links (12 issues)
- Add proper route structure
- Time: 6 hours
- Owner: Frontend Dev
```

**Thursday-Friday (22 hours) - Critical Cloud Functions**

```
Task 2.5: Auth Functions (Part 1)
- onCreate: Initialize user profile
- onDelete: Archive user data
- Time: 6 hours
- Owner: Backend Lead

Task 2.6: Booking Functions (Part 1)
- createBooking: Validate and store
- getAvailableDrivers: Return list
- estimatePrice: Calculate fare
- Time: 8 hours
- Owner: Backend Dev

Task 2.7: Notification Functions
- sendEmail: Email delivery
- sendSMS: SMS via Twilio (stub)
- sendPushNotification: FCM (stub)
- Time: 8 hours
- Owner: Backend Dev
```

**Deliverables End of Phase 1**:

- ✅ Working login/logout
- ✅ Role-based access (can't bypass with URL)
- ✅ Firestore secured
- ✅ Dashboard home page (read-only metrics)
- ✅ No more 404s on main routes
- ✅ 5 Cloud Functions deployed

---

## Phase 2: Core Features (Weeks 3-6) - 240 Hours

### Week 3: Dispatch System

**Focus: Booking creation to completion flow**

```
Task 3.1: Booking UI (16 hours)
- Create booking form (pickup, dropoff, time, vehicle type)
- Google Maps integration (autocomplete, directions)
- Price estimation display
- Confirmation screen
- Owner: Frontend Dev

Task 3.2: Dispatch Board (16 hours)
- Real-time pending rides table
- Live update refresh (2 sec)
- Assign driver dialog
- Map view with pending rides
- Owner: Frontend Dev + Backend Dev

Task 3.3: Booking Functions (16 hours)
- processBooking: Validate, create record
- Auto-assign driver algorithm
- updateBookingStatus: State machine
- cancelBooking: Handle cancellations
- Owner: Backend Dev

Task 3.4: Testing (8 hours)
- E2E: Create booking → Assign driver
- Negative tests (invalid inputs)
- Performance (100+ pending rides)
- Owner: QA Engineer
```

### Weeks 4-5: Payment & Driver Systems

**Payment (Week 4 - 40 hours)**:

- Stripe integration
- Payment processing functions
- Refund handling
- Invoice generation

**Driver Management (Week 4-5 - 60 hours)**:

- Driver profile creation
- Document management
- Performance rating system
- Availability management

### Week 6: Financial System

**Focus: Basic financial operations**

```
Task 6.1: Invoice System (24 hours)
- Auto-generate after ride
- Send email with PDF
- Track payment status
- Time: 24 hours
- Owner: Backend Dev

Task 6.2: Payroll Calculation (20 hours)
- Calculate driver earnings per ride
- Apply deductions
- Generate pay stubs
- Time: 20 hours
- Owner: Backend Dev

Task 6.3: Financial Dashboard (16 hours)
- Revenue overview card
- Daily/weekly/monthly toggle
- Recent transactions table
- Time: 16 hours
- Owner: Frontend Dev
```

**Phase 2 Deliverables**:

- ✅ Complete booking flow (create → assign → track → pay → complete)
- ✅ Payment processing (Stripe integrated)
- ✅ Driver management basics
- ✅ Financial dashboard
- ✅ Invoice generation

---

## Phase 3: Public Sites & Content (Weeks 7-10) - 160 Hours

### Week 7-8: Website Content (80 hours)

**Static Page Creation**:

- Airport domain: 6 pages (home, services, pricing, fleet, reviews, contact)
- Corporate domain: 6 pages (similar structure)
- Wedding domain: 6 pages (specific wedding pages)
- Party Bus domain: 6 pages (party-focused)
- Total: 24 pages
- Rate: ~3 hours per page
- Owner: Frontend Dev + Content Writer

### Week 9: SEO & Meta Tags (40 hours)

```
Task 9.1: SEO Implementation (24 hours)
- Add meta tags to all pages
- Create sitemaps (4 domains + blog)
- Add structured data (JSON-LD)
- Create robots.txt
- Time: 24 hours
- Owner: Frontend Dev

Task 9.2: Analytics Setup (16 hours)
- Google Analytics 4 integration
- Google Search Console setup
- Track goal conversions
- Time: 16 hours
- Owner: DevOps
```

### Week 10: Image Management (40 hours)

```
Task 10.1: Image Upload & Library (16 hours)
- Cloud Storage integration
- Image upload UI
- Image library page
- Search/filter functionality
- Time: 16 hours
- Owner: Frontend Dev

Task 10.2: Image Optimization (16 hours)
- Create image variants (thumb, medium, large, webp)
- Lazy loading implementation
- Responsive images
- Time: 16 hours
- Owner: Backend Dev

Task 10.3: Photography/AI Generation (8 hours)
- Either: Commission professional photos
- Or: Set up DALL-E integration
- Time: varies
- Owner: Content/Design
```

**Phase 3 Deliverables**:

- ✅ 5 public websites with all pages
- ✅ SEO implemented (meta tags, sitemap, structured data)
- ✅ Image library with AI generation option
- ✅ All links working
- ✅ Lighthouse score > 70 on all domains

---

## Phase 4: Advanced Features (Weeks 11-16) - 160 Hours

### Week 11: Real-Time Features (40 hours)

```
Task 11.1: Live Tracking (24 hours)
- Realtime DB structure for live rides
- Driver location updates
- Map display with live location
- Customer tracking view
- Time: 24 hours
- Owner: Frontend Dev + Backend Dev

Task 11.2: Notifications (16 hours)
- FCM setup for mobile
- In-app notification system
- Email notification templates
- SMS notification templates
- Time: 16 hours
- Owner: Backend Dev
```

### Weeks 12-13: Analytics & Reporting (50 hours)

- Dashboard metrics (active rides, revenue, drivers)
- Financial reports (P&L, expense breakdown)
- Driver performance reports
- Custom report builder
- Export to PDF/CSV

### Weeks 14-16: Additional Systems (70 hours)

- Blog system (60 hours)
- Affiliate system (40 hours)
- Customer portal (30 hours)
- Advanced UI enhancements (20 hours)

**Phase 4 Deliverables**:

- ✅ Real-time ride tracking
- ✅ Comprehensive analytics
- ✅ Blog system with SEO
- ✅ Affiliate dashboard
- ✅ Customer self-service portal

---

## Dependency Chart

```
Week 1: Auth + Firestore (BLOCKER for everything)
  ↓
Week 2: Dashboard + React Scaffold
  ↓
Week 3: Dispatch System
  ├→ Week 4: Payment System
  ├→ Week 4-5: Driver Management
  └→ Week 6: Financial System
  ↓
Week 7-10: Public Websites
  ├→ SEO + Analytics
  └→ Image Management
  ↓
Week 11+: Advanced Features
```

---

## Parallel Work Streams

**Can Run in Parallel**:

- Week 2: React scaffold + Cloud Functions
- Week 3-4: Dispatch + Payment + Drivers
- Week 7-10: All 4 domain websites simultaneously
- Week 11+: Multiple features in parallel

**Must Be Sequential**:

- Auth → Dispatch (depends on user/permissions)
- Dispatch → Payment (depends on booking creation)
- Phase 1 → Everything (security foundation)

---

## Resource Allocation

### Team Composition Recommended

```
Full-Time (16 weeks):
- 1 Backend Lead (auth, database, functions)
- 2 Backend Developers (payment, financial, drivers)
- 1 Frontend Lead (UI architecture, design system)
- 2 Frontend Developers (pages, features)
- 1 DevOps Engineer (Firebase config, CI/CD)
- 1 QA Engineer (testing, quality)
- 1 Content Writer (website copy, blog)
- 1 Product Manager (coordination)
```

### Cost Estimate

```
Development: ~760 hours @ $100/hr = $76,000
Photography (alt): $5,000 - $15,000 (professional)
Tools/Licenses: ~$500/month = $8,000 (4 months)
Cloud Costs (Firebase): ~$200/month = $800
---
Total: $85,000 - $100,000 (4 months)
```

---

## Success Metrics

### Technical Metrics

- ✅ 0 critical security issues
- ✅ 99.9% uptime
- ✅ API response < 500ms (p95)
- ✅ Page load < 2s (p95)
- ✅ Lighthouse score > 90 all metrics
- ✅ 70%+ test coverage

### Business Metrics

- ✅ 100+ completed bookings
- ✅ 50+ registered drivers
- ✅ 1000+ daily site visits
- ✅ > 80% booking completion rate
- ✅ > 4.5/5 star rating

---

**Document Version**: 1.0
**Last Updated**: 2026-01-16
**Owner**: YOLO Autonomous Builder (Agent 7 - Fix Plan)
**Status**: Ready for Execution
