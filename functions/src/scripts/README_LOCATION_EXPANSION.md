# Location Expansion - Quick Start Guide

## Overview

This module expands the Royal Carriage Limousine SEO system from 25 locations to **205 locations** covering the entire Chicago metropolitan area.

---

## Files Structure

```
functions/src/scripts/
├── expandLocations.ts           # 84 Chicago neighborhoods
├── expandLocationsData.ts       # 121 suburban locations (N, W, S)
├── expandLocationsFunction.ts   # Cloud Function wrapper
└── README_LOCATION_EXPANSION.md # This file
```

---

## Cloud Function

### Function Name
`initializeExpandedLocations`

### Configuration
- **Runtime:** Node.js (Firebase Functions v1)
- **Timeout:** 540 seconds (9 minutes)
- **Memory:** 1GB
- **Type:** HTTPS Callable

---

## Deployment

### 1. Build the Functions
```bash
cd /Users/admin/VSCODE/functions
npm run build
```

### 2. Deploy the Function
```bash
firebase deploy --only functions:initializeExpandedLocations
```

### 3. Verify Deployment
```bash
firebase functions:list | grep initializeExpandedLocations
```

---

## Execution

### Option 1: Direct HTTP Request

```bash
# Production
curl -X POST https://us-central1-royalcarriagelimoseo.cloudfunctions.net/initializeExpandedLocations

# With response formatting
curl -X POST https://us-central1-royalcarriagelimoseo.cloudfunctions.net/initializeExpandedLocations | jq
```

### Option 2: Firebase Console
1. Navigate to Firebase Console
2. Go to **Functions** section
3. Find `initializeExpandedLocations`
4. Click **Test** button
5. Click **Run Test**

### Option 3: Node.js Script

```javascript
const https = require('https');

const options = {
  hostname: 'us-central1-royalcarriagelimoseo.cloudfunctions.net',
  path: '/initializeExpandedLocations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => console.error(error));
req.end();
```

---

## Expected Response

### Success Response (200)

```json
{
  "success": true,
  "message": "Location expansion completed successfully",
  "stats": {
    "locationsInserted": 205,
    "mappingsCreated": 4100,
    "queuedTasks": 500,
    "durationSeconds": 67.5
  },
  "breakdown": {
    "chicagoNeighborhoods": 84,
    "northernSuburbs": 33,
    "westernSuburbs": 52,
    "southernSuburbs": 36
  }
}
```

### Error Response (500)

```json
{
  "success": false,
  "error": "Error message details"
}
```

---

## What Gets Created

### 1. Locations Collection
- **205 location documents** in `locations` collection
- Each with full metadata (coordinates, ZIP codes, airports, services)

### 2. Location-Service Subcollections
- **~4,100 mapping documents** in `locations/{locationId}/services` subcollections
- Maps each location to applicable services with relevance scores

### 3. Regeneration Queue
- **~500 content generation tasks** in `regeneration_queue` collection
- Prioritizes high-value locations (airport relevance ≥ 18)

---

## Monitoring Execution

### Cloud Functions Logs

```bash
# View real-time logs
firebase functions:log --only initializeExpandedLocations

# View last 100 lines
firebase functions:log --only initializeExpandedLocations --limit 100
```

### Expected Log Output

```
🚀 Starting Location Expansion to 173+ locations

📊 Total locations to insert: 205
  - Chicago neighborhoods: 84
  - Northern suburbs: 33
  - Western suburbs: 52
  - Southern suburbs: 36

✅ Inserted batch 1 (205 locations)
✅ Total locations inserted: 205

🗺️  Creating location-service mappings...
📋 Total mappings to create: 4100
✅ Created batch 1 (400 mappings)
✅ Created batch 2 (400 mappings)
...
✅ Total mappings created: 4100

📋 Creating content generation queue...
🎯 Priority locations for queue: 100
✅ Queued 500 content generation tasks

============================================================
✅ LOCATION EXPANSION COMPLETE
============================================================
📍 Locations inserted: 205
🗺️  Location-service mappings created: 4100
📋 Content generation tasks queued: 500
⏱️  Duration: 67.50s
============================================================
```

---

## Verification

### Check Firestore Collections

```bash
# Count locations
firebase firestore:get locations | wc -l

# Sample location
firebase firestore:get locations/lincoln-park

# Check mappings
firebase firestore:get locations/lincoln-park/services
```

### Query via Admin SDK

```javascript
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Count all locations
db.collection('locations').get().then(snapshot => {
  console.log(`Total locations: ${snapshot.size}`);
});

// Get locations by type
db.collection('locations')
  .where('type', '==', 'neighborhood')
  .get()
  .then(snapshot => {
    console.log(`Chicago neighborhoods: ${snapshot.size}`);
  });

// Check queue
db.collection('regeneration_queue')
  .where('status', '==', 'pending')
  .get()
  .then(snapshot => {
    console.log(`Pending content tasks: ${snapshot.size}`);
  });
```

---

## Troubleshooting

### Issue: Function Times Out

**Solution:** Function is configured for 540 seconds (9 minutes). If it times out:
1. Check Firestore write limits
2. Verify network connectivity
3. Review Firebase quota limits

### Issue: Partial Data Insertion

**Solution:** The function uses batching. If interrupted:
1. Check how many locations were inserted
2. Manually delete partial data if needed
3. Re-run the function

### Issue: Duplicate Locations

**Solution:** The function uses `.set()` which overwrites existing data:
1. Safe to re-run multiple times
2. No duplicate documents will be created
3. Existing locations will be updated

### Issue: Missing Service Mappings

**Solution:** Mappings are created based on `applicableServices`:
1. Verify service IDs exist in `services` collection
2. Check that service mapping object is correct
3. Review logs for specific errors

---

## Data Modification

### To Add New Locations

1. Edit `/functions/src/scripts/expandLocationsData.ts`
2. Add location objects to appropriate array:
   - `NORTHERN_SUBURBS`
   - `WESTERN_SUBURBS`
   - `SOUTHERN_SUBURBS`

3. Rebuild and redeploy:
```bash
npm run build
firebase deploy --only functions:initializeExpandedLocations
```

### To Update Existing Locations

1. Edit the location data in source files
2. Rebuild: `npm run build`
3. Redeploy function
4. Re-run function (will overwrite existing)

### To Remove Locations

1. Remove from source arrays
2. Rebuild and redeploy
3. Manually delete from Firestore if needed

---

## Performance Characteristics

### Batch Processing
- **Batch Size:** 400 documents per batch
- **Total Batches:** ~1 batch for locations, ~11 batches for mappings
- **Write Operations:** ~4,305 writes total

### Execution Time
- **Locations:** ~10 seconds
- **Mappings:** ~50 seconds
- **Queue:** ~5 seconds
- **Total:** ~65-70 seconds

### Cost Estimation
- **Firestore Writes:** 4,305 writes (~$0.02)
- **Function Invocation:** 1 invocation (<$0.01)
- **Function Runtime:** ~70 seconds (<$0.01)
- **Total Cost:** ~$0.04 per execution

---

## Integration with Existing System

### Content Generation
The queued tasks will be processed by:
- `processRegenerationQueue` (on-demand)
- `scheduledDailyRegeneration` (daily at 2 AM CT)

### Page Building
Generated content will be used by:
- `buildStaticPages` (creates HTML files)
- `publishPages` (deploys to Firebase Hosting)

### Quality Scoring
Content will be scored by:
- `calculateContentQuality` (7-metric system)
- `bulkScoreContent` (batch processing)

---

## Data Cleanup (If Needed)

### Delete All Locations

```javascript
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function deleteAllLocations() {
  const batch = db.batch();
  const snapshot = await db.collection('locations').get();

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Deleted ${snapshot.size} locations`);
}

deleteAllLocations();
```

### Delete Queue Items

```javascript
async function clearQueue() {
  const batch = db.batch();
  const snapshot = await db.collection('regeneration_queue')
    .where('status', '==', 'pending')
    .get();

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Cleared ${snapshot.size} queue items`);
}

clearQueue();
```

---

## Support

For issues or questions:
1. Check `/Users/admin/VSCODE/LOCATION_EXPANSION_SUMMARY.md`
2. Review Cloud Functions logs
3. Verify Firestore data structure
4. Check Firebase quota limits

---

**Last Updated:** 2026-01-16
**Version:** 1.0
**Status:** Production Ready ✅
