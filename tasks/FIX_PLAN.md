# Royal Carriage - Implementation Fix Plan
**Target:** Production-Ready, Secure, Feature-Complete
**Timeline:** Staged rollout to avoid deployment risk
**Date:** January 16, 2026

---

## Implementation Sequence (Ordered by Dependency)

### Phase 1: CRITICAL SECURITY FIXES (No Breaking Changes)
**Timeline:** 2-4 hours
**Risk Level:** MINIMAL (only security improvements, no feature changes)
**Deployment:** `firebase deploy --only functions,firestore` (separate from hosting)

#### Step 1.1: Fix Firestore Role Lookup (No Database Reads)
**File:** `firestore.rules`
**Impact:** Eliminates ~90% of unnecessary Firestore reads
**Dependency:** None (independent)

**Changes:**
```
- Remove getRole() function completely
- Replace all getRole() calls with request.auth.token.role
- Add validation: if token.role is null → treat as 'viewer'
- Ensure syncUserRole() Cloud Function exists and works
```

**How to Verify:**
```bash
# 1. Run security rules emulator test
firebase emulators:start --only firestore

# 2. In another terminal, test token claims
gcloud functions call syncUserRole --data '{"uid":"test-user"}'

# 3. Deploy and check logs
firebase deploy --only firestore
firebase functions:log --limit 10

# 4. Check Firestore read quota (should drop immediately)
# In Firebase Console → Usage → Firestore → Read operations
```

**Acceptance:**
- ✅ Rules compile without errors
- ✅ Emulator tests pass (if test suite exists, otherwise manual test)
- ✅ syncUserRole function runs successfully for all user updates
- ✅ Firestore reads drop 80%+ (visible in Firebase metrics 30 min after deploy)

---

#### Step 1.2: Fix CORS Whitelist
**File:** `functions/src/index.ts` (line 22)
**Impact:** Blocks cross-origin API attacks
**Dependency:** Requires .env or Firebase Environment Config

**Changes:**
```typescript
// OLD: cors({ origin: true })

// NEW: Whitelist only these domains
const allowedOrigins = [
  'https://admin.royalcarriagelimo.com',
  'https://chicagoairportblackcar.com',
  'https://chicagoexecutivecarservice.com',
  'https://chicagoweddingtransportation.com',
  'https://chicago-partybus.com',
  'http://localhost:3000', // Dev only
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

**How to Verify:**
```bash
# 1. Build functions
cd functions && npm run build

# 2. Test locally (emulator)
firebase emulators:start --only functions

# 3. Test CORS from allowed origin (should work)
curl -H "Origin: https://admin.royalcarriagelimo.com" \
  http://localhost:5001/royalcarriagelimoseo/us-central1/api/auth/google

# 4. Test CORS from disallowed origin (should fail with CORS error)
curl -H "Origin: https://evil.com" \
  http://localhost:5001/royalcarriagelimoseo/us-central1/api/auth/google

# 5. Deploy and verify live
firebase deploy --only functions
curl -H "Origin: https://evil.com" \
  https://us-central1-royalcarriagelimoseo.cloudfunctions.net/api
```

**Acceptance:**
- ✅ Whitelisted origins get normal response
- ✅ Non-whitelisted origins get 403 or CORS error
- ✅ localhost:3000 works for development
- ✅ No errors in Cloud Functions logs after deploy

---

#### Step 1.3: Remove Emulator UI from Production Config
**File:** `firebase.json`
**Impact:** Prevents accidental emulator exposure
**Dependency:** None

**Changes:**
```json
// REMOVE entire "emulators" section from firebase.json
// Current lines 75-92

// Instead, create .firebaserc.local for development:
{
  "projects": { "default": "royalcarriagelimoseo" },
  "emulators": { "ui": { "enabled": true, "port": 4000 } }
}
```

**How to Verify:**
```bash
# 1. Check production config has no emulators
grep -i "emulator" firebase.json
# Should return: No matches

# 2. Create dev config
cat > .firebaserc.local << 'EOF'
{
  "projects": { "default": "royalcarriagelimoseo" },
  "emulators": { "ui": { "enabled": true, "port": 4000 } }
}
EOF

# 3. Deploy
firebase deploy --only firestore,storage

# 4. Verify: no emulator UI should be exposed
# Try accessing http://localhost:4000 - should not work unless running emulator
```

**Acceptance:**
- ✅ firebase.json has NO emulator settings
- ✅ .firebaserc.local created for local development
- ✅ Deploy succeeds without warnings
- ✅ DEPLOYMENT_GUIDE.md updated with local setup instructions

---

### Phase 2: FIX INCOMPLETE FEATURES (P1 Items)
**Timeline:** 3-5 days (can be parallelized)
**Risk Level:** LOW (adding missing features, not changing existing behavior)
**Deployment:** Feature-by-feature (can backout individual functions)

#### Step 2.1: Enable Vertex AI Image Generation
**File:** `functions/src/api/ai/image-generator.ts`
**Dependency:** Phase 1 complete (security stable)
**Prerequisites:**
- Google Cloud Console access
- Vertex AI API enabled
- Service account with `aiplatform.user` role

**Changes:**
1. Enable Vertex AI API in Google Cloud:
   ```bash
   gcloud services enable aiplatform.googleapis.com --project=royalcarriagelimoseo
   ```

2. Update Cloud Functions service account IAM role:
   ```bash
   gcloud projects add-iam-policy-binding royalcarriagelimoseo \
     --member=serviceAccount:royalcarriagelimoseo@appspot.gserviceaccount.com \
     --role=roles/aiplatform.user
   ```

3. Update image-generator.ts to use real Vertex AI:
   ```typescript
   // Replace placehold.co fallback with actual Vertex AI Imagen
   import { ImageGenerationServiceClient } from '@google-cloud/aiplatform';

   const client = new ImageGenerationServiceClient({
     apiEndpoint: 'us-central1-aiplatform.googleapis.com',
   });

   const response = await client.generateImages({
     parent: 'projects/royalcarriagelimoseo/locations/us-central1',
     instances: [{ prompt: userPrompt }],
     parameters: {
       sampleCount: 1,
       safetyFilterLevel: 'block_most',
     },
   });

   // Store in Firebase Storage instead of serving directly
   const bucket = admin.storage().bucket();
   const imageUrl = await bucket.file(`ai_images/${Date.now()}.png`)
     .save(response[0].imageBytes);

   return imageUrl;
   ```

4. Update Firestore collection to track generated images:
   ```firestore
   /ai_images/{imageId}
     - prompt: string
     - imageUrl: string
     - createdAt: timestamp
     - createdBy: uid
     - status: "success" | "failed"
   ```

**How to Verify:**
```bash
# 1. Verify API is enabled
gcloud services list --enabled | grep aiplatform

# 2. Test locally with emulator (may not work fully, but check for errors)
npm run build
firebase functions:shell

# 3. Call the function in the shell
const result = await generateImage({ prompt: "limousine in chicago" });
console.log(result);

# 4. Deploy
firebase deploy --only functions

# 5. Test live endpoint
curl -X POST https://us-central1-royalcarriagelimoseo.cloudfunctions.net/api/ai/generate-image \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt": "luxury limousine"}'

# 6. Check admin dashboard - image generation should show real images
# URL: https://admin.royalcarriagelimo.com/images/library
```

**Acceptance:**
- ✅ Vertex AI API enabled and accessible
- ✅ Service account has correct IAM role
- ✅ Image generation endpoint returns actual AI images (not placehold.co)
- ✅ Images stored in Firebase Storage with metadata
- ✅ Admin dashboard displays real generated images
- ✅ Cloud Functions logs show no errors
- ✅ 3+ test prompts generate different images

---

#### Step 2.2: Implement Scheduled Cloud Functions
**File:** `functions/src/index.ts`
**Dependency:** Firestore rules stable (Phase 1)
**Timeline:** 2 days

**Step 2.2a: Implement dailyPageAnalysis()**
```typescript
export const dailyPageAnalysis = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('America/Chicago')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();

      // 1. Fetch all pages
      const pagesSnapshot = await db.collection('pages').get();

      // 2. Analyze each page
      for (const pageDoc of pagesSnapshot.docs) {
        const page = pageDoc.data();

        // Call Gemini to analyze
        const analysis = await geminiClient.generateContent({
          contents: [{
            role: 'user',
            parts: [{
              text: `Analyze this page for SEO quality (0-100 score):\n
                Title: ${page.title}\n
                Description: ${page.description}\n
                Content: ${page.content.substring(0, 500)}...\n
                Return JSON: { score: number, issues: string[], suggestions: string[] }`,
            }],
          }],
        });

        const result = JSON.parse(analysis.response.text());

        // 3. Store analysis
        await db.collection('page_analyses').doc(pageDoc.id).set({
          pageId: pageDoc.id,
          score: result.score,
          issues: result.issues,
          suggestions: result.suggestions,
          analyzedAt: new Date(),
          status: 'complete',
        });

        // 4. Create alerts for low scores
        if (result.score < 60) {
          await db.collection('alerts').add({
            type: 'low_seo_score',
            pageId: pageDoc.id,
            score: result.score,
            severity: result.score < 40 ? 'high' : 'medium',
            createdAt: new Date(),
          });
        }
      }

      functions.logger.info(`Analyzed ${pagesSnapshot.size} pages`);
      return { success: true, pagesAnalyzed: pagesSnapshot.size };

    } catch (error) {
      functions.logger.error('Daily analysis failed:', error);
      return { success: false, error: error.message };
    }
  });
```

**Step 2.2b: Implement weeklySeoReport()**
```typescript
export const weeklySeoReport = functions.pubsub
  .schedule('0 9 * * 1')  // Monday 9 AM
  .timeZone('America/Chicago')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Aggregate analyses from past week
      const analyses = await db.collection('page_analyses')
        .where('analyzedAt', '>=', sevenDaysAgo)
        .orderBy('analyzedAt', 'desc')
        .get();

      const scores = analyses.docs.map(d => d.data().score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Top and bottom 10
      const sorted = analyses.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.score - a.score);

      const report = {
        weekEnding: new Date(),
        pagesAnalyzed: analyses.size,
        avgScore: avgScore.toFixed(2),
        topPages: sorted.slice(0, 10),
        bottomPages: sorted.slice(-10),
      };

      // Store report
      await db.collection('reports').add({
        type: 'weekly_seo',
        data: report,
        createdAt: new Date(),
      });

      functions.logger.info('Weekly SEO report generated', report);
      return { success: true, report };

    } catch (error) {
      functions.logger.error('Weekly report failed:', error);
      return { success: false, error: error.message };
    }
  });
```

**Step 2.2c: Implement autoAnalyzeNewPage()**
```typescript
export const autoAnalyzeNewPage = functions.firestore
  .document('pages/{pageId}')
  .onCreate(async (snap, context) => {
    try {
      const page = snap.data();
      const db = admin.firestore();

      // Same analysis as daily, but immediate
      const analysis = await geminiClient.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `Quick SEO analysis (0-100):\n
              Title: ${page.title}\n
              Description: ${page.description}\n
              Return JSON: { score: number, issues: string[] }`,
          }],
        }],
      });

      const result = JSON.parse(analysis.response.text());

      await db.collection('page_analyses').doc(context.params.pageId).set({
        pageId: context.params.pageId,
        score: result.score,
        issues: result.issues,
        analyzedAt: new Date(),
        status: 'auto_analyzed',
      });

      functions.logger.info(`Auto-analyzed page: ${context.params.pageId}`);

    } catch (error) {
      functions.logger.error('Auto-analysis failed:', error);
    }
  });
```

**How to Verify:**
```bash
# 1. Build and deploy
cd functions && npm run build
firebase deploy --only functions

# 2. Manually trigger dailyPageAnalysis (for testing)
gcloud functions call dailyPageAnalysis --gen-1

# 3. Check Firestore for page_analyses collection
firebase firestore --export --project=royalcarriagelimoseo

# 4. Check for alerts created (Firebase Console)

# 5. Wait for Monday 9 AM or manually trigger weeklySeoReport

# 6. Create test page in Firestore to trigger autoAnalyzeNewPage
firebase firestore:import --project=royalcarriagelimoseo
# (OR manually add doc in Firebase Console)

# 7. Verify analysis appears within 30 seconds
```

**Acceptance:**
- ✅ dailyPageAnalysis runs daily at 2 AM (visible in Cloud Functions logs)
- ✅ All pages analyzed and results stored in page_analyses collection
- ✅ Alerts created for low-scoring pages
- ✅ weeklySeoReport generates Monday 9 AM (or can be manually triggered for testing)
- ✅ autoAnalyzeNewPage triggers within 30 seconds of new page creation
- ✅ Admin dashboard shows analysis results and reports

---

#### Step 2.3: Implement CSV Import Pipeline
**Files:**
- `functions/src/api/routes/imports.ts` (NEW)
- `functions/src/lib/csv-parser.ts` (NEW)
- `functions/src/lib/moovs-schema.ts` (NEW)
- `functions/src/lib/ads-schema.ts` (NEW)

**Dependency:** Phase 1 stable
**Timeline:** 3-4 days

**Step 2.3a: Create CSV Parser Module**
```typescript
// functions/src/lib/csv-parser.ts
export interface ParseOptions {
  delimiter?: ',' | ';' | '\t';
  skipEmptyRows?: boolean;
  trimValues?: boolean;
}

export async function parseCSV(content: string, options?: ParseOptions) {
  const delimiter = options?.delimiter || ',';
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) throw new Error('CSV must have header + at least 1 data row');

  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim());
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || null;
    });
    rows.push(row);
  }

  return { headers, rows };
}

export function validateSchema(row: any, schema: Record<string, FieldValidator>) {
  const errors = [];

  for (const [field, validator] of Object.entries(schema)) {
    const value = row[field];

    if (validator.required && !value) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    if (value && validator.type) {
      if (validator.type === 'number' && isNaN(parseFloat(value))) {
        errors.push(`${field} must be a number, got: ${value}`);
      }
      if (validator.type === 'date') {
        if (isNaN(new Date(value).getTime())) {
          errors.push(`${field} must be a valid date, got: ${value}`);
        }
      }
    }

    if (validator.enum && value && !validator.enum.includes(value)) {
      errors.push(`${field} must be one of: ${validator.enum.join(', ')}, got: ${value}`);
    }
  }

  return errors.length > 0 ? errors : null;
}
```

**Step 2.3b: Create Moovs Schema & Validator**
```typescript
// functions/src/lib/moovs-schema.ts
export const MOOVS_SCHEMA = {
  trip_id: { required: true, type: 'string', unique: true },
  driver_id: { required: true, type: 'string' },
  vehicle_id: { required: true, type: 'string' },
  pickup_time: { required: true, type: 'date' },
  dropoff_time: { required: true, type: 'date' },
  pickup_location: { required: true, type: 'string' },
  dropoff_location: { required: true, type: 'string' },
  distance_miles: { required: true, type: 'number' },
  fare_cents: { required: true, type: 'number' },
  customer_id: { required: false, type: 'string' },
  notes: { required: false, type: 'string' },
};

export async function processMoovRow(row: any, db: admin.firestore.Firestore) {
  // Validate
  const errors = validateSchema(row, MOOVS_SCHEMA);
  if (errors) return { success: false, errors, row };

  // Check for duplicate (idempotency)
  const existing = await db.collection('trips')
    .where('externalId', '==', row.trip_id)
    .limit(1)
    .get();

  if (!existing.empty) {
    return { success: false, skipped: true, reason: 'duplicate_trip_id' };
  }

  // Normalize and store
  const tripData = {
    externalId: row.trip_id,
    driverId: row.driver_id,
    vehicleId: row.vehicle_id,
    pickupTime: new Date(row.pickup_time),
    dropoffTime: new Date(row.dropoff_time),
    pickupLocation: row.pickup_location,
    dropoffLocation: row.dropoff_location,
    distanceMiles: parseFloat(row.distance_miles),
    fareCents: parseInt(row.fare_cents),
    customerId: row.customer_id || null,
    notes: row.notes || null,
    importedAt: new Date(),
    source: 'moovs_import',
  };

  const tripRef = await db.collection('trips').add(tripData);

  return { success: true, id: tripRef.id, ...tripData };
}
```

**Step 2.3c: Create Import API Endpoint**
```typescript
// functions/src/api/routes/imports.ts
export async function handleImport(req, res) {
  try {
    // Get CSV file from request
    const csvContent = req.body.csvContent || '';
    const importType = req.body.type; // 'moovs' or 'ads'

    if (!csvContent || !importType) {
      return res.status(400).json({ error: 'Missing csvContent or type' });
    }

    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    // 1. Store original file for audit trail
    const fileName = `imports/${importType}/${Date.now()}.csv`;
    const fileHash = crypto.createHash('md5').update(csvContent).digest('hex');

    await bucket.file(fileName).save(csvContent);

    // 2. Create import record
    const importRecord = await db.collection('imports').add({
      type: importType,
      fileName: fileName,
      fileHash: fileHash,
      status: 'processing',
      totalRows: 0,
      successRows: 0,
      failedRows: 0,
      errors: [],
      createdAt: new Date(),
      createdBy: req.user.uid,
    });

    // 3. Parse CSV
    const { headers, rows } = await parseCSV(csvContent);

    // 4. Process each row
    const results = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      let result;

      if (importType === 'moovs') {
        result = await processMoovRow(row, db);
      } else if (importType === 'ads') {
        result = await processAdsRow(row, db);
      }

      if (result.success) {
        results.push(result);
      } else {
        errors.push({
          rowNumber: i + 2, // +2 for header + 1-indexed
          error: result.errors || result.reason,
          data: row,
        });
      }
    }

    // 5. Update import record with results
    await importRecord.update({
      status: errors.length > 0 ? 'completed_with_errors' : 'completed',
      totalRows: rows.length,
      successRows: results.length,
      failedRows: errors.length,
      errors: errors.slice(0, 100), // Cap error list
    });

    // 6. Create audit log entries
    await db.collection('auditLogs').add({
      action: 'import',
      resource: 'trips', // or 'metrics' for ads
      importId: importRecord.id,
      rowsProcessed: results.length,
      errors: errors.length,
      timestamp: new Date(),
      userId: req.user.uid,
    });

    return res.json({
      importId: importRecord.id,
      totalRows: rows.length,
      successRows: results.length,
      failedRows: errors.length,
      errors: errors,
    });

  } catch (error) {
    functions.logger.error('Import failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

**Step 2.3d: Update Admin Dashboard**
```tsx
// apps/admin/src/pages/imports/moovs.tsx
export default function MoovsImport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    setLoading(true);
    const csvContent = await file.text();

    const response = await fetch('/api/imports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'moovs', csvContent }),
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div>
      <h1>Moovs Import</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Importing...' : 'Upload CSV'}
      </button>

      {result && (
        <div>
          <p>✅ {result.successRows} rows imported</p>
          {result.failedRows > 0 && (
            <details>
              <summary>❌ {result.failedRows} errors</summary>
              {result.errors.map((e, i) => (
                <div key={i}>
                  Row {e.rowNumber}: {e.error.join('; ')}
                </div>
              ))}
            </details>
          )}
          <a href={`/api/imports/${result.importId}/errors.csv`}>
            Download Error Report
          </a>
        </div>
      )}
    </div>
  );
}
```

**How to Verify:**
```bash
# 1. Build and deploy
firebase deploy --only functions

# 2. Create test CSV file (moovs format)
cat > test-moovs.csv << 'EOF'
trip_id,driver_id,vehicle_id,pickup_time,dropoff_time,pickup_location,dropoff_location,distance_miles,fare_cents
TRIP001,DRV001,VEH001,2026-01-16T10:00:00Z,2026-01-16T11:00:00Z,Chicago Downtown,ORD Airport,20,5000
TRIP002,DRV002,VEH002,2026-01-16T11:00:00Z,2026-01-16T12:00:00Z,Lincoln Park,Midway Airport,25,6000
EOF

# 3. Test import endpoint
curl -X POST http://localhost:5001/royalcarriagelimoseo/us-central1/api/imports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @- << 'EOF'
{
  "type": "moovs",
  "csvContent": "$(cat test-moovs.csv | jq -Rs '.')"
}
EOF

# 4. Check Firestore for trips collection
firebase firestore:export --project=royalcarriagelimoseo

# 5. Test idempotency - upload same file again
# Should see: "skipReason": "duplicate_trip_id" for all rows

# 6. Test error handling - upload CSV with missing required field
cat > test-bad.csv << 'EOF'
trip_id,driver_id
TRIP003,DRV003
EOF

# Should see errors in response

# 7. Test admin dashboard
# Navigate to: https://admin.royalcarriagelimo.com/imports/moovs
# Upload CSV, verify success message
```

**Acceptance:**
- ✅ CSV parsing works correctly (correct headers, rows)
- ✅ Schema validation provides clear error messages
- ✅ Valid rows stored in trips collection
- ✅ Idempotency: same file uploaded twice = no new rows added
- ✅ Error rows NOT stored, but logged with row numbers
- ✅ Admin dashboard shows import summary
- ✅ Error report downloadable as CSV
- ✅ Audit logs created for all imports

---

### Phase 3: VALIDATION & ROLLOUT
**Timeline:** 1-2 days
**Risk Level:** LOW (testing and documentation only)

#### Step 3.1: Security Review
```bash
# 1. Verify all Firestore rules use token.role (no getRole() calls)
grep -r "getRole()" firestore.rules
# Should return: No matches

# 2. Verify CORS whitelist
grep -A 5 "allowedOrigins" functions/src/index.ts
# Should show 5 production domains + localhost

# 3. Verify no emulator in firebase.json
grep -i "emulator" firebase.json
# Should return: No matches

# 4. Check IAM roles for Cloud Functions service account
gcloud projects get-iam-policy royalcarriagelimoseo \
  --flatten="bindings[].members" \
  --filter="bindings.members:royalcarriagelimoseo@appspot.gserviceaccount.com"
# Should show: aiplatform.user role
```

**Acceptance:**
- ✅ All security checks pass
- ✅ No hardcoded secrets in code
- ✅ Environment variables used for config
- ✅ IAM roles correctly assigned

---

#### Step 3.2: Smoke Test All Apps
```bash
# 1. Verify admin dashboard loads
curl -s https://admin.royalcarriagelimo.com | grep -i "dashboard"

# 2. Verify all hosting targets deployed
firebase hosting:channels:list

# 3. Test each marketing site loads
for site in chicagoairportblackcar.com chicagoexecutivecarservice.com chicagoweddingtransportation.com chicago-partybus.com; do
  curl -s https://$site | grep -i "<title>"
done

# 4. Test API endpoints respond
curl -H "Origin: https://admin.royalcarriagelimo.com" \
  https://us-central1-royalcarriagelimoseo.cloudfunctions.net/api/health

# 5. Check Cloud Functions logs for errors
firebase functions:log --limit 50
```

**Acceptance:**
- ✅ All 5 apps load without errors
- ✅ No 404 or 500 errors in logs
- ✅ API endpoints respond with correct CORS headers
- ✅ No security warnings in browser console

---

#### Step 3.3: Feature Smoke Tests
```bash
# 1. Test image generation
curl -X POST https://us-central1-royalcarriagelimoseo.cloudfunctions.net/api/ai/generate-image \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt": "chicago limousine"}'

# Expected: Real image URL (not placehold.co)

# 2. Trigger daily page analysis manually
gcloud functions call dailyPageAnalysis --gen-1

# Expected: Logs show "Analyzed X pages", page_analyses collection populated

# 3. Test CSV import with valid file
# Upload test-moovs.csv via admin dashboard
# Expected: "2 rows imported" message

# 4. Test CSV import with invalid file
# Upload CSV with missing required field
# Expected: Error rows listed with clear messages
```

**Acceptance:**
- ✅ Image generation returns real images
- ✅ Scheduled functions execute without errors
- ✅ CSV import succeeds for valid data
- ✅ CSV import shows errors for invalid data

---

## Deployment Steps (Production)

### Safe Rollout Sequence

**Step 1: Security Fixes (No Feature Impact)**
```bash
# Deploy security fixes only
firebase deploy --only firestore,storage

# Wait 5 minutes for propagation
sleep 300

# Verify in Firebase Console: Check quota metrics
# Firestore reads should drop 70%+ compared to baseline
```

**Step 2: Function Updates (Staged)**
```bash
# Build functions
cd functions && npm run build

# Deploy functions (can be rolled back independently)
firebase deploy --only functions

# Monitor logs for 10 minutes
firebase functions:log --limit 100 | tail -50
```

**Step 3: Hosting Updates (If Any)**
```bash
# Deploy all apps
firebase deploy --only hosting

# Verify each app loads
# Admin: https://admin.royalcarriagelimo.com/
# Airport: https://chicagoairportblackcar.com/
# All other sites
```

**Step 4: Verification**
```bash
# Run smoke tests from Step 3.2
# Check:
# - No errors in Cloud Functions logs
# - Firestore read metrics stable
# - All apps load
# - APIs respond correctly
```

---

## Rollback Plan

If any issue detected:

```bash
# Option 1: Rollback individual functions
firebase deploy --only functions --version <previous-version-id>

# Option 2: Rollback entire deploy
gcloud run services update-traffic <service> --to-revisions LATEST=0,<previous>=100

# Option 3: Revert Firestore rules to previous version
# Manually in Firebase Console → Firestore → Rules → Rollback to previous

# Verify:
firebase functions:log | head -20
curl https://admin.royalcarriagelimo.com  # Should load
```

---

## Definition of Done - Fix Plan

- ✅ All P0 security issues fixed
- ✅ All P1 features implemented
- ✅ Smoke tests pass for all apps
- ✅ No errors in Cloud Functions logs after deploy
- ✅ Firestore read quota improved 70%+
- ✅ Image generation working end-to-end
- ✅ CSV import tested with valid and invalid data
- ✅ Scheduled functions running on schedule
- ✅ Deployment doc updated with new commands
- ✅ Rollback tested and documented

---

## Next: Implementation Tickets

See `TICKETS.md` for Jira-style tickets with:
- Title
- Acceptance criteria
- Verification steps
- Story points (estimate)
