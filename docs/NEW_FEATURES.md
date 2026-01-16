# New Features - Scripts & Admin Components

This document describes the newly created skeleton implementations for Royal Carriage Limousine's admin system.

## 📊 Scripts

### 1. Weekly ROI Report Generator

**File:** `/scripts/generate-weekly-report.mjs`

Generates comprehensive weekly ROI reports in markdown format.

**Features:**

- Revenue, spend, and profit proxy analysis
- Week-over-week change calculations
- Top performing pages from GSC data
- Automated issue detection
- ROAS tracking

**Usage:**

```bash
npm run report:weekly
# or
node scripts/generate-weekly-report.mjs
```

**Output:** `/reports/weekly-roi-YYYY-MM-DD.md`

**Data Sources:**

- `bookings` collection (revenue data)
- `ads_imports` collection (ad spend data)
- `gsc_pages` collection (page performance)

**TODO:**

- Configure Firebase Admin with service account credentials
- Replace mock data with actual Firestore queries
- Add email notification for generated reports
- Implement alert webhooks for critical issues

---

### 2. Firestore Backup Script

**File:** `/scripts/backup-firestore.mjs`

Exports all Firestore collections to JSON and stores backups in Firebase Storage.

**Features:**

- Exports 8 core collections
- Creates backup manifest with metadata
- Stores locally and in Firebase Storage
- Timestamp-based organization

**Usage:**

```bash
npm run backup:firestore
# or
node scripts/backup-firestore.mjs
```

**Output:**

- Local: `/backups/YYYY-MM-DD/`
- Cloud: `gs://bucket/backups/YYYY-MM-DD/`

**Collections Backed Up:**

- `bookings`
- `ads_imports`
- `seo_topics`
- `seo_drafts`
- `image_metadata`
- `audit_logs`
- `gsc_pages`
- `settings`

**TODO:**

- Configure Firebase Storage bucket
- Add scheduled backup via Cloud Scheduler
- Implement backup retention policy
- Add restore functionality

---

## 🎨 Admin Components

### 3. Seasonal Switch

**File:** `/client/src/pages/admin/settings/SeasonalSwitch.tsx`

Control seasonal hero images across all marketing sites.

**Features:**

- Toggle between 4 seasons (winter, spring, summer, fall)
- Preview hero images for each site
- Shows active season
- Admin+ role required
- Saves to Firestore: `settings/seasonal`

**Seasons:**

- **Winter** (Dec-Feb): Snowy and festive imagery
- **Spring** (Mar-May): Fresh and blooming imagery
- **Summer** (Jun-Aug): Bright and sunny imagery
- **Fall** (Sep-Nov): Warm autumn colors

**Sites Affected:**

- Airport site
- Corporate site
- Wedding site
- Party Bus site

**TODO:**

- Connect to actual Firestore `settings/seasonal` document
- Implement hero image switching in marketing sites
- Add image upload functionality
- Add preview modal with actual images

---

### 4. GSC Import Tool

**File:** `/client/src/pages/admin/seo/GSCImport.tsx`

Import and analyze Google Search Console data.

**Features:**

- CSV upload and parsing
- Date range selector
- Automatic issue detection
- Data preview table
- Stores in `gsc_pages` collection

**Detected Issues:**

- Low CTR (< 2%)
- Poor position (> 20)
- High impressions but low clicks
- Declining click trends

**CSV Format:**

```csv
page,clicks,impressions,ctr,position
/page-url,123,4567,0.027,3.2
```

**TODO:**

- Connect to Firestore `gsc_pages` collection
- Add batch write implementation
- Implement historical trend analysis
- Add chart visualization for trends

---

### 5. Uptime Monitor

**File:** `/client/src/pages/admin/settings/UptimeMonitor.tsx`

Monitor availability and performance of all marketing sites.

**Features:**

- Tracks 5 URLs (admin + 4 marketing sites)
- Shows 24-hour uptime percentage
- Status indicators (up/down)
- Response time chart
- Auto-refresh every 5 minutes
- Alerts when sites are down

**Monitored Sites:**

- Admin Dashboard (royalcarriagelimoseo.web.app)
- Airport Site (chicagoairportblackcar.com)
- Corporate Site (chicagocorporatelimo.com)
- Wedding Site (chicagoweddinglimo.com)
- Party Bus Site (chicagopartybus.com)

**Metrics:**

- Overall uptime percentage
- Sites online count
- Average response time
- Last check timestamp
- Failure count per site

**TODO:**

- Implement actual HTTP health checks
- Add health check endpoints to sites
- Store uptime data in Firestore
- Add alert notifications (email/SMS)
- Add historical uptime tracking

---

## 🔧 Implementation Notes

### Firebase Admin SDK Patterns

All scripts use Firebase Admin SDK with this pattern:

```javascript
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "royalcarriagelimoseo",
  });
}

const db = admin.firestore();
```

### Component Patterns

All admin components follow these patterns:

1. **Authentication**: Use `useAuth()` hook for user data
2. **Role Checking**: Check for Admin+ roles before allowing actions
3. **Mock Data**: Include realistic mock data for development
4. **TODO Comments**: Mark Firebase integration points
5. **Error Handling**: Graceful error handling with user feedback
6. **Loading States**: Show loading indicators for async operations
7. **UI Components**: Use shadcn/ui components consistently

### Common Imports

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/admin/buttons";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/firebase";
import { db } from "@/lib/firebase";
```

---

## 📦 Package.json Scripts

Added npm scripts:

```json
{
  "scripts": {
    "report:weekly": "node ./scripts/generate-weekly-report.mjs",
    "backup:firestore": "node ./scripts/backup-firestore.mjs"
  }
}
```

---

## 🔐 Security Considerations

1. **Role-Based Access**: All admin components check for Admin+ role
2. **Input Validation**: CSV parsing includes error handling
3. **Rate Limiting**: Uptime monitor uses 5-minute intervals
4. **Data Sanitization**: All user inputs should be sanitized
5. **Audit Logging**: Consider logging all admin actions

---

## 🚀 Next Steps

To complete these implementations:

1. **Configure Firebase Credentials**
   - Set up service account for Firebase Admin SDK
   - Configure environment variables

2. **Connect to Firestore**
   - Replace all mock data with actual Firestore queries
   - Implement batch writes for bulk operations

3. **Add Route Handlers**
   - Add routes to admin app router
   - Implement proper navigation

4. **Test with Real Data**
   - Import sample GSC data
   - Create test bookings and ads data
   - Verify report generation

5. **Deploy Cloud Functions**
   - Set up scheduled backup function
   - Add health check endpoints

6. **Configure Monitoring**
   - Set up uptime monitoring alerts
   - Add error tracking

---

## 📝 Example Usage

### Generate Weekly Report

```bash
npm run report:weekly
```

Output: `/reports/weekly-roi-2026-01-16.md`

### Backup Firestore

```bash
npm run backup:firestore
```

Output: `/backups/2026-01-16/` (9 files)

### Access Admin Components

```
Admin Dashboard > Settings > Seasonal Switch
Admin Dashboard > Settings > Uptime Monitor
Admin Dashboard > SEO > GSC Import
```

---

## 📚 Related Documentation

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Recharts Documentation](https://recharts.org/)
