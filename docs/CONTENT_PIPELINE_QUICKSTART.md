# Content Generation Pipeline - Quick Start Guide

## Prerequisites

1. Firebase project configured (`royalcarriagelimoseo`)
2. Gemini API enabled in Google Cloud
3. Service and location data initialized in Firestore
4. Admin authentication set up

## Quick Start

### 1. Generate Single Page

```javascript
// Generate content for one location-service combination
const result = await firebase.functions().httpsCallable('generateLocationServiceContent')({
  locationId: 'naperville',
  serviceId: 'airport-ohare',
  websiteId: 'airport'
});

console.log(result.data);
// {
//   contentId: 'airport-ohare-naperville',
//   title: 'Airport Transfer to O\'Hare in Naperville | Royal Carriage',
//   status: 'pending'
// }
```

### 2. Batch Generate Multiple Pages

```javascript
// Generate content for multiple locations and services
const result = await firebase.functions().httpsCallable('batchGenerateContent')({
  websiteId: 'wedding',
  locationIds: ['naperville', 'wheaton', 'oak-brook', 'hinsdale'],
  serviceIds: ['wedding-bride', 'wedding-groom', 'wedding-guest']
});

console.log(result.data);
// {
//   totalGenerated: 12,
//   errors: [],
//   totalErrors: 0
// }
```

### 3. Approve and Publish Content

```javascript
// Approve multiple content pieces
const result = await firebase.functions().httpsCallable('pipelineApproveAndPublishContent')({
  contentIds: [
    'wedding-bride-naperville',
    'wedding-bride-wheaton',
    'wedding-bride-oak-brook'
  ]
});

console.log(result.data);
// {
//   approved: 3,
//   published: 3
// }
```

### 4. Generate Metadata

```javascript
// Generate comprehensive metadata for a page
const result = await firebase.functions().httpsCallable('pipelineGeneratePageMetadata')({
  contentId: 'wedding-bride-naperville'
});

console.log(result.data.metadata);
// {
//   metaTitle: '...',
//   metaDescription: '...',
//   ogImage: '...',
//   breadcrumbs: [...],
//   schema: {...}
// }
```

### 5. Build Static Pages

```javascript
// Build static pages for deployment
const result = await firebase.functions().httpsCallable('pipelineBuildStaticPages')({
  websiteId: 'wedding',
  limit: 500
});

console.log(result.data);
// {
//   pagesBuilt: 487
// }
```

## Complete Workflow

```javascript
// Full pipeline: Generate → Approve → Build

// Step 1: Batch generate content
const batchResult = await firebase.functions().httpsCallable('batchGenerateContent')({
  websiteId: 'airport',
  locationIds: ['naperville', 'wheaton', 'oak-brook'],
  serviceIds: ['airport-ohare', 'airport-midway']
});

console.log(`Generated ${batchResult.data.totalGenerated} pages`);

// Step 2: Review content in admin dashboard (manual)
// Navigate to: https://admin.royalcarriagelimo.com/content-approval

// Step 3: Bulk approve pending content
const db = firebase.firestore();
const pendingDocs = await db.collection('service_content')
  .where('websiteId', '==', 'airport')
  .where('approvalStatus', '==', 'pending')
  .get();

const contentIds = pendingDocs.docs.map(doc => doc.id);

const approveResult = await firebase.functions().httpsCallable('pipelineApproveAndPublishContent')({
  contentIds
});

console.log(`Approved ${approveResult.data.approved} pages`);

// Step 4: Generate metadata for all approved content
for (const contentId of contentIds) {
  await firebase.functions().httpsCallable('pipelineGeneratePageMetadata')({
    contentId
  });
}

console.log('Metadata generated');

// Step 5: Build static pages
const buildResult = await firebase.functions().httpsCallable('pipelineBuildStaticPages')({
  websiteId: 'airport',
  limit: 1000
});

console.log(`${buildResult.data.pagesBuilt} pages ready for deployment`);

// Step 6: Deploy (from terminal)
// firebase deploy --only hosting:airport
```

## Admin Dashboard Integration

### Approval Queue Component

```typescript
// components/ContentApprovalQueue.tsx

import { useEffect, useState } from 'react';
import { db, functions } from '@/lib/firebase';

export default function ContentApprovalQueue() {
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to pending content
    const unsubscribe = db.collection('service_content')
      .where('approvalStatus', '==', 'pending')
      .orderBy('generatedAt', 'desc')
      .onSnapshot(snapshot => {
        setPending(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });

    return unsubscribe;
  }, []);

  const handleApprove = async () => {
    const approveFunc = functions.httpsCallable('pipelineApproveAndPublishContent');
    const result = await approveFunc({ contentIds: selected });

    console.log(`Approved ${result.data.approved} items`);
    setSelected([]);
  };

  return (
    <div className="content-approval-queue">
      <h2>Pending Content ({pending.length})</h2>

      {pending.map(item => (
        <div key={item.id} className="content-item">
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelected([...selected, item.id]);
              } else {
                setSelected(selected.filter(id => id !== item.id));
              }
            }}
          />

          <div>
            <h3>{item.title}</h3>
            <p>{item.metaDescription}</p>
            <div className="preview">
              <strong>Hero:</strong> {item.content.hero}
            </div>
            <div className="meta">
              Service: {item.serviceId} | Location: {item.locationId}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleApprove}
        disabled={selected.length === 0}
      >
        Approve Selected ({selected.length})
      </button>
    </div>
  );
}
```

## Firestore Queries

### Get All Pending Content
```javascript
const pending = await db.collection('service_content')
  .where('approvalStatus', '==', 'pending')
  .get();
```

### Get Approved Content for Website
```javascript
const approved = await db.collection('service_content')
  .where('websiteId', '==', 'airport')
  .where('approvalStatus', '==', 'approved')
  .get();
```

### Get Batch Job Status
```javascript
const batchJob = await db.collection('batch_jobs')
  .doc(jobId)
  .get();

console.log(batchJob.data());
// {
//   type: 'content_generation',
//   status: 'running',
//   progress: 150,
//   totalCombinations: 500
// }
```

### Get Static Pages Ready for Deploy
```javascript
const ready = await db.collection('static_pages')
  .where('websiteId', '==', 'wedding')
  .where('buildStatus', '==', 'ready')
  .get();
```

## CLI Commands

### Deploy Functions
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific pipeline functions
firebase deploy --only functions:generateLocationServiceContent
firebase deploy --only functions:batchGenerateContent
firebase deploy --only functions:pipelineApproveAndPublishContent
firebase deploy --only functions:pipelineGeneratePageMetadata
firebase deploy --only functions:pipelineBuildStaticPages
```

### View Logs
```bash
# View all function logs
firebase functions:log

# View specific function logs
firebase functions:log --only generateLocationServiceContent

# Follow logs in real-time
firebase functions:log --follow
```

### Test Functions Locally
```bash
# Start emulators
firebase emulators:start

# Call function
curl -X POST http://localhost:5001/royalcarriagelimoseo/us-central1/generateLocationServiceContent \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "locationId": "naperville",
      "serviceId": "airport-ohare",
      "websiteId": "airport"
    }
  }'
```

## Performance Tips

### Batch Processing
- Process 50-100 pages at a time for optimal performance
- Allow 1-2 minutes per batch of 10 pages
- Monitor batch job progress in `batch_jobs` collection

### Rate Limiting
- Gemini API: 60 requests/minute, 1500/day
- Current settings: 5 concurrent requests with 1-second delays
- Adjust in `contentGenerationPipeline.ts` if needed

### Memory Management
- `batchGenerateContent`: Uses 1GB memory, 9-minute timeout
- `buildStaticPages`: Uses 2GB memory, 9-minute timeout
- Split large batches if hitting limits

## Troubleshooting

### "Permission denied" Error
```javascript
// Ensure user is authenticated
const user = firebase.auth().currentUser;
if (!user) {
  await firebase.auth().signInWithEmailAndPassword(email, password);
}
```

### "Content not found" Error
```javascript
// Verify service and location exist
const serviceExists = await db.collection('services').doc(serviceId).get();
const locationExists = await db.collection('locations').doc(locationId).get();

if (!serviceExists.exists) console.error('Service not found');
if (!locationExists.exists) console.error('Location not found');
```

### "Function timeout" Error
```javascript
// Reduce batch size
const result = await firebase.functions().httpsCallable('batchGenerateContent')({
  websiteId: 'airport',
  locationIds: locations.slice(0, 20), // Process 20 at a time
  serviceIds: services
});
```

## Data Validation

### Before Generation
```javascript
// Validate input data exists
async function validateBeforeGeneration(locationId, serviceId) {
  const db = firebase.firestore();

  const [location, service] = await Promise.all([
    db.collection('locations').doc(locationId).get(),
    db.collection('services').doc(serviceId).get()
  ]);

  if (!location.exists) {
    throw new Error(`Location ${locationId} not found`);
  }

  if (!service.exists) {
    throw new Error(`Service ${serviceId} not found`);
  }

  return { location: location.data(), service: service.data() };
}
```

### After Generation
```javascript
// Verify content quality
async function verifyContentQuality(contentId) {
  const db = firebase.firestore();
  const content = await db.collection('service_content').doc(contentId).get();

  const data = content.data();

  const checks = {
    hasTitle: !!data.title && data.title.length <= 60,
    hasMetaDesc: !!data.metaDescription && data.metaDescription.length <= 155,
    hasContent: !!data.content && !!data.content.hero,
    hasKeywords: data.keywords?.length > 0,
    hasSchema: !!data.schema
  };

  const passed = Object.values(checks).every(v => v);

  return { passed, checks };
}
```

## Next Steps

1. **Initialize Data**: Ensure services and locations are populated
2. **Test Single Page**: Generate one page to verify pipeline
3. **Batch Generate**: Generate content for all combinations
4. **Review & Approve**: Use admin dashboard to approve content
5. **Build & Deploy**: Generate static pages and deploy to hosting

## Support Resources

- **Documentation**: `/docs/CONTENT_GENERATION_PIPELINE.md`
- **Function Logs**: Firebase Console > Functions > Logs
- **Firestore Data**: Firebase Console > Firestore Database
- **API Status**: Google Cloud Console > Vertex AI

---

**Last Updated**: 2026-01-16
