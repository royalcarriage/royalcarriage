# Content Generation Pipeline - Deployment Checklist

## Pre-Deployment Verification

### 1. Build Status
- [x] TypeScript compilation successful
- [x] No compilation errors
- [x] All functions exported in index.ts
- [x] Dependencies installed

**Command**: `cd /Users/admin/VSCODE/functions && npm run build`
**Status**: ✓ SUCCESS

---

## Environment Setup

### 2. Firebase Configuration
- [ ] Firebase project: `royalcarriagelimoseo` configured
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Logged in to Firebase: `firebase login`
- [ ] Project selected: `firebase use royalcarriagelimoseo`

### 3. Google Cloud API Setup
- [ ] Vertex AI API enabled
- [ ] Gemini API access confirmed
- [ ] Service account permissions configured
- [ ] API quotas reviewed (60/min, 1500/day)

### 4. Firestore Setup
- [ ] Firestore database created
- [ ] Collections initialized:
  - [ ] `services`
  - [ ] `locations`
  - [ ] `service_content`
  - [ ] `page_mappings`
  - [ ] `static_pages`
  - [ ] `batch_jobs`
- [ ] Indexes created (if needed)

---

## Data Initialization

### 5. Test Data
- [ ] Create test service:
  ```javascript
  db.collection('services').doc('test-service').set({
    name: 'Test Airport Transfer',
    description: 'Professional airport transfer for testing',
    keywords: ['airport', 'transfer', 'test'],
    searchVolume: 1000
  });
  ```

- [ ] Create test location:
  ```javascript
  db.collection('locations').doc('test-location').set({
    name: 'Test Location',
    description: 'Test location in Chicago area',
    landmarks: ['Test Landmark 1', 'Test Landmark 2']
  });
  ```

### 6. Production Data
- [ ] Import all services from CSV/source
- [ ] Import all locations from CSV/source
- [ ] Verify data integrity
- [ ] Confirm all required fields present

---

## Function Deployment

### 7. Deploy Functions
```bash
cd /Users/admin/VSCODE

# Deploy all pipeline functions
firebase deploy --only functions:generateLocationServiceContent
firebase deploy --only functions:batchGenerateContent
firebase deploy --only functions:pipelineApproveAndPublishContent
firebase deploy --only functions:pipelineGeneratePageMetadata
firebase deploy --only functions:pipelineBuildStaticPages
```

**Expected Output**:
```
✔  functions[generateLocationServiceContent]: Successful create operation
✔  functions[batchGenerateContent]: Successful create operation
✔  functions[pipelineApproveAndPublishContent]: Successful create operation
✔  functions[pipelineGeneratePageMetadata]: Successful create operation
✔  functions[pipelineBuildStaticPages]: Successful create operation
```

### 8. Verify Deployment
```bash
# List deployed functions
firebase functions:list

# Check function logs
firebase functions:log --limit 50
```

---

## Testing

### 9. Test Single Page Generation
```javascript
// In Firebase Console or Admin Dashboard
const generateContent = firebase.functions().httpsCallable('generateLocationServiceContent');

const result = await generateContent({
  locationId: 'test-location',
  serviceId: 'test-service',
  websiteId: 'airport'
});

console.log('Result:', result.data);
// Expected: { contentId: 'test-service-test-location', title: '...', status: 'pending' }
```

**Verify**:
- [ ] Function executes without errors
- [ ] Content created in `service_content` collection
- [ ] Title and meta description populated
- [ ] Status is "pending"
- [ ] Content structure is complete

### 10. Test Batch Generation (Small Scale)
```javascript
const batchGenerate = firebase.functions().httpsCallable('batchGenerateContent');

const result = await batchGenerate({
  websiteId: 'airport',
  locationIds: ['test-location'],
  serviceIds: ['test-service']
});

console.log('Result:', result.data);
// Expected: { totalGenerated: 1, errors: [], totalErrors: 0 }
```

**Verify**:
- [ ] Batch job created in `batch_jobs` collection
- [ ] Content generated successfully
- [ ] Progress tracking working
- [ ] No errors reported

### 11. Test Approval Workflow
```javascript
const approve = firebase.functions().httpsCallable('pipelineApproveAndPublishContent');

const result = await approve({
  contentIds: ['test-service-test-location']
});

console.log('Result:', result.data);
// Expected: { approved: 1, published: 1 }
```

**Verify**:
- [ ] Content status changed to "approved"
- [ ] Page mapping created
- [ ] `readyForPublish` flag set to true
- [ ] Approval timestamp recorded

### 12. Test Metadata Generation
```javascript
const generateMeta = firebase.functions().httpsCallable('pipelineGeneratePageMetadata');

const result = await generateMeta({
  contentId: 'test-service-test-location'
});

console.log('Result:', result.data);
// Expected: { metadata: { metaTitle, ogImage, breadcrumbs, ... } }
```

**Verify**:
- [ ] Metadata object complete
- [ ] Breadcrumbs array populated
- [ ] OG tags present
- [ ] Schema markup included

### 13. Test Static Page Build
```javascript
const buildPages = firebase.functions().httpsCallable('pipelineBuildStaticPages');

const result = await buildPages({
  websiteId: 'airport',
  limit: 10
});

console.log('Result:', result.data);
// Expected: { pagesBuilt: 1 }
```

**Verify**:
- [ ] Static pages created in `static_pages` collection
- [ ] Build status is "ready"
- [ ] All required fields populated
- [ ] Page path is correct

---

## Production Rollout

### 14. Small-Scale Production Test (10 pages)
```javascript
// Generate 10 pages for production
const result = await firebase.functions().httpsCallable('batchGenerateContent')({
  websiteId: 'airport',
  locationIds: ['naperville', 'wheaton'], // 2 locations
  serviceIds: ['airport-ohare', 'airport-midway', 'corporate-downtown'] // 3 services (but filter by website)
});

// Total: 2 locations × relevant services = ~6-10 pages
```

**Monitor**:
- [ ] Check Cloud Functions logs
- [ ] Monitor Gemini API usage
- [ ] Review batch job status
- [ ] Verify content quality

### 15. Review and Approve
- [ ] Review generated content in admin dashboard
- [ ] Check for quality and accuracy
- [ ] Verify SEO optimization
- [ ] Approve selected content
- [ ] Generate metadata for approved content

### 16. Build and Deploy Pages
- [ ] Build static pages
- [ ] Verify page data in Firestore
- [ ] Deploy to Firebase Hosting
  ```bash
  firebase deploy --only hosting:airport
  ```
- [ ] Verify pages live on site
- [ ] Check page rendering
- [ ] Test internal links

---

## Full-Scale Production

### 17. Generate All Content (Staged)
```javascript
// Stage 1: Airport website (example: 50 locations × 5 services = 250 pages)
const stage1 = await firebase.functions().httpsCallable('batchGenerateContent')({
  websiteId: 'airport',
  locationIds: [...airportLocations],
  serviceIds: [...airportServices]
});

// Wait for completion, review, approve

// Stage 2: Corporate website
const stage2 = await firebase.functions().httpsCallable('batchGenerateContent')({
  websiteId: 'corporate',
  locationIds: [...corporateLocations],
  serviceIds: [...corporateServices]
});

// Stage 3: Wedding website
// Stage 4: Party bus website
```

**Strategy**:
- [ ] Generate in stages (250-500 pages at a time)
- [ ] Allow time for review between stages
- [ ] Monitor API quotas
- [ ] Track batch job progress
- [ ] Handle errors incrementally

### 18. Bulk Approval Process
```javascript
// Approve all pending content for a website
const db = firebase.firestore();
const pending = await db.collection('service_content')
  .where('websiteId', '==', 'airport')
  .where('approvalStatus', '==', 'pending')
  .get();

const contentIds = pending.docs.map(doc => doc.id);

// Approve in batches of 100
for (let i = 0; i < contentIds.length; i += 100) {
  const batch = contentIds.slice(i, i + 100);
  await firebase.functions().httpsCallable('pipelineApproveAndPublishContent')({
    contentIds: batch
  });
}
```

### 19. Generate All Metadata
```javascript
// Generate metadata for all approved content
const approved = await db.collection('service_content')
  .where('approvalStatus', '==', 'approved')
  .where('metadata', '==', null) // Or doesn't exist
  .get();

for (const doc of approved.docs) {
  await firebase.functions().httpsCallable('pipelineGeneratePageMetadata')({
    contentId: doc.id
  });
}
```

### 20. Build All Static Pages
```javascript
// Build static pages for each website
const websites = ['airport', 'corporate', 'wedding', 'partybus'];

for (const websiteId of websites) {
  const result = await firebase.functions().httpsCallable('pipelineBuildStaticPages')({
    websiteId,
    limit: 2000
  });

  console.log(`${websiteId}: ${result.data.pagesBuilt} pages built`);
}
```

---

## Monitoring & Maintenance

### 21. Set Up Monitoring
- [ ] Configure Cloud Functions alerts
- [ ] Monitor Gemini API usage
- [ ] Track error rates
- [ ] Set up uptime monitoring
- [ ] Configure budget alerts

### 22. Regular Maintenance
- [ ] Review pending approvals weekly
- [ ] Monitor batch job failures
- [ ] Check API quota usage
- [ ] Update content periodically
- [ ] Regenerate low-performing pages

---

## Troubleshooting Guide

### Common Issues

#### "Permission denied"
**Solution**:
```javascript
// Ensure user is authenticated
await firebase.auth().signInWithEmailAndPassword(email, password);
```

#### "Function timeout"
**Solution**:
- Reduce batch size
- Process in smaller chunks
- Increase function timeout (max 9 minutes)

#### "Gemini API rate limit exceeded"
**Solution**:
- Wait for rate limit reset (1 minute)
- Reduce concurrent requests
- Increase batch delay

#### "Content not found"
**Solution**:
- Verify service exists: `db.collection('services').doc(serviceId).get()`
- Verify location exists: `db.collection('locations').doc(locationId).get()`
- Check document IDs are correct

#### "Build status: failed"
**Solution**:
- Check Cloud Functions logs: `firebase functions:log`
- Verify data structure
- Check for missing fields
- Review error messages

---

## Rollback Procedure

### If Issues Arise

1. **Stop Batch Jobs**
   ```javascript
   // Update running batch jobs to failed
   const runningJobs = await db.collection('batch_jobs')
     .where('status', '==', 'running')
     .get();

   runningJobs.docs.forEach(doc => {
     doc.ref.update({ status: 'failed' });
   });
   ```

2. **Revert Function Deployment**
   ```bash
   # Deploy previous version
   git checkout <previous-commit>
   cd functions
   npm run build
   firebase deploy --only functions
   ```

3. **Clean Up Test Data**
   ```javascript
   // Delete test content
   const testContent = await db.collection('service_content')
     .where('serviceId', '==', 'test-service')
     .get();

   testContent.docs.forEach(doc => doc.ref.delete());
   ```

---

## Success Criteria

### Deployment Success
- [x] All 5 functions deployed
- [x] No deployment errors
- [x] Functions listed in Firebase Console

### Functionality Success
- [ ] Single page generation works
- [ ] Batch generation completes
- [ ] Approval workflow functional
- [ ] Metadata generation successful
- [ ] Static pages built correctly

### Quality Success
- [ ] SEO titles ≤ 60 chars
- [ ] Meta descriptions ≤ 155 chars
- [ ] Content structure complete
- [ ] Schema markup valid
- [ ] Internal links working

### Performance Success
- [ ] 3-5 seconds per page
- [ ] 30-50 pages/minute batch
- [ ] No timeout errors
- [ ] Memory usage acceptable

---

## Sign-Off Checklist

- [ ] Pre-deployment verification complete
- [ ] Environment setup verified
- [ ] Test data created and verified
- [ ] Functions deployed successfully
- [ ] Small-scale testing passed
- [ ] Production rollout plan reviewed
- [ ] Monitoring configured
- [ ] Rollback procedure documented
- [ ] Success criteria met

---

**Deployment Date**: __________
**Deployed By**: __________
**Sign-Off**: __________

---

**Last Updated**: 2026-01-16
**Version**: 1.0.0
