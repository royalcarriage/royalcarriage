# Google Ads & Analytics Integration Plan

## Overview
This document outlines the integration setup for Google Ads and Google Analytics with the Royal Carriage SEO system.

## Current Status
- Google Ads API: **Enabled**
- BigQuery API: **Enabled**
- Analytics Hub: **Enabled**
- BigQuery Data Transfer: **Enabled**

## Required Configurations

### 1. Google Analytics 4 (GA4) Setup
```
Property ID: [To be configured]
Measurement ID: G-CC67CH86JR (configured in .env)
```

#### Websites to Track:
| Site | URL | GA4 Stream |
|------|-----|------------|
| Admin | royalcarriagelimoseo.web.app | Dashboard analytics |
| Airport | chicagoairportblackcar.web.app | Public site tracking |
| Corporate | chicagoexecutivecarservice.web.app | Public site tracking |
| Wedding | chicagoweddingtransportation.web.app | Public site tracking |
| Party Bus | chicago-partybus.web.app | Public site tracking |

### 2. Google Ads Configuration
```
Customer ID: [To be configured]
Manager Account: [If applicable]
```

#### Required Scopes:
- `https://www.googleapis.com/auth/adwords`
- Read campaign performance
- Read conversion data

### 3. BigQuery Data Export

#### GA4 to BigQuery Export (Recommended):
1. Go to GA4 Property > Admin > BigQuery Links
2. Link to project: `royalcarriagelimoseo`
3. Dataset: `analytics_export`
4. Enable streaming export for real-time data

#### Google Ads to BigQuery Transfer:
1. Go to BigQuery > Data Transfer
2. Create transfer: Google Ads
3. Customer ID: [Google Ads Customer ID]
4. Dataset: `google_ads_export`
5. Schedule: Daily at 4 AM UTC

### 4. Cloud Functions for Data Pull

#### Existing Functions:
- `importAdsCSV` - Manual CSV import
- `getMetricTrends` - Analytics data retrieval
- `getROIAnalysis` - ROI calculations

#### Planned Functions for Next Phase:
```typescript
// Auto-sync Google Ads data
export const syncGoogleAdsData = functions.pubsub
  .schedule('0 5 * * *') // Daily at 5 AM
  .timeZone('America/Chicago')
  .onRun(async () => {
    // Fetch from BigQuery or Ads API
    // Store in Firestore metrics collection
  });

// Auto-sync GA4 data
export const syncGA4Data = functions.pubsub
  .schedule('0 6 * * *') // Daily at 6 AM
  .timeZone('America/Chicago')
  .onRun(async () => {
    // Fetch from GA4 API or BigQuery
    // Calculate key metrics
    // Store in Firestore
  });
```

### 5. Service Account Permissions

Required roles for service account `royalcarriagelimoseo@appspot.gserviceaccount.com`:
- [x] `roles/aiplatform.user` - Vertex AI access
- [x] `roles/cloudfunctions.developer` - Deploy functions
- [ ] `roles/bigquery.dataViewer` - Read BigQuery data
- [ ] `roles/bigquery.jobUser` - Run BigQuery queries

### 6. Environment Variables Needed

Add to `.env`:
```
# Google Analytics
GA4_PROPERTY_ID=<property_id>
GA4_DATA_STREAM_ID=<stream_id>

# Google Ads
GOOGLE_ADS_CUSTOMER_ID=<customer_id>
GOOGLE_ADS_DEVELOPER_TOKEN=<dev_token>
GOOGLE_ADS_LOGIN_CUSTOMER_ID=<manager_id>

# BigQuery
BIGQUERY_DATASET_ANALYTICS=analytics_export
BIGQUERY_DATASET_ADS=google_ads_export
```

## Implementation Phases

### Phase 1 (Current) - Manual Import
- CSV import for Moovs data ✅
- CSV import for Ads data ✅
- Manual data entry in admin dashboard ✅

### Phase 2 (Next) - BigQuery Integration
- [ ] Set up GA4 to BigQuery export
- [ ] Set up Google Ads to BigQuery transfer
- [ ] Create scheduled functions to sync data

### Phase 3 (Future) - Real-time Dashboard
- [ ] Implement real-time GA4 data streaming
- [ ] Create ROI dashboard with live data
- [ ] Add campaign performance alerts

## API Endpoints for Data Access

### Current:
```
GET /api/metrics/trends - Time series data
GET /api/metrics/roi - ROI analysis
POST /api/imports/ads - Manual CSV import
POST /api/imports/moovs - Manual CSV import
```

### Planned:
```
GET /api/analytics/ga4/realtime - Real-time visitor data
GET /api/analytics/ads/campaigns - Campaign performance
GET /api/analytics/ads/conversions - Conversion data
POST /api/analytics/sync - Trigger manual sync
```

## Security Considerations

1. **OAuth2 for Google Ads API**: Use service account or OAuth2 flow
2. **BigQuery Access**: Restrict to read-only for sync functions
3. **Data Retention**: Configure BigQuery table expiration
4. **PII Handling**: Exclude user-identifiable data from exports

## Monitoring

1. Cloud Functions logs for sync errors
2. BigQuery query costs monitoring
3. Data freshness alerts in admin dashboard

---

*Document created: 2026-01-17*
*For CLI integration with Gemini*
