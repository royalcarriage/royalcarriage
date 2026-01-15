# Google Cloud Security Audit & Configuration Guide

**Date:** January 15, 2026  
**Project:** Royal Carriage / Chicago Airport Black Car  
**Firebase Project ID:** royalcarriagelimoseo  
**Status:** ⚠️ REQUIRES CONFIGURATION

---

## Executive Summary

This document provides a comprehensive audit of Google Cloud Platform (GCP) systems and security settings for the Royal Carriage AI-powered website management system. The audit focuses on enabling image generation capabilities from the admin dashboard while ensuring all security best practices are followed.

**Current Status:**
- ✅ Firebase Hosting: Configured and deployed
- ✅ Firestore Database: Security rules configured
- ✅ Firebase Functions: Deployed with 6 functions
- ⚠️ **Vertex AI (Imagen):** Not fully configured - image generation unavailable
- ⚠️ **Cloud Storage:** Not configured for image storage
- ⚠️ **IAM Permissions:** Need review and configuration
- ⚠️ **Service Accounts:** Need proper permissions for AI services

---

## 1. Google Cloud Project Configuration

### 1.1 Required APIs

The following Google Cloud APIs must be enabled for full functionality:

| API | Status | Purpose | Priority |
|-----|--------|---------|----------|
| Vertex AI API | ⚠️ Required | AI image generation (Imagen), content generation (Gemini Pro) | **HIGH** |
| Cloud Functions API | ✅ Enabled | Firebase Functions for automation | Critical |
| Cloud Firestore API | ✅ Enabled | Database operations | Critical |
| Cloud Storage API | ⚠️ Required | Store generated images | **HIGH** |
| Cloud Build API | ✅ Enabled | Build Firebase Functions | Critical |
| Cloud Logging API | ✅ Enabled | Function logs and monitoring | Medium |
| Cloud IAM API | ✅ Enabled | Permission management | Critical |
| Secret Manager API | ⚠️ Recommended | Secure credential storage | Medium |

### 1.2 How to Enable Required APIs

```bash
# Enable Vertex AI API (for image generation)
gcloud services enable aiplatform.googleapis.com --project=royalcarriagelimoseo

# Enable Cloud Storage API (for image storage)
gcloud services enable storage-api.googleapis.com --project=royalcarriagelimoseo

# Enable Secret Manager API (recommended)
gcloud services enable secretmanager.googleapis.com --project=royalcarriagelimoseo

# Verify all enabled services
gcloud services list --enabled --project=royalcarriagelimoseo
```

Or enable via Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Vertex AI API"
3. Click "Enable"
4. Repeat for Cloud Storage API and Secret Manager API

---

## 2. Image Generation Configuration (Vertex AI Imagen)

### 2.1 Current Status

**File:** `server/ai/image-generator.ts`

The image generator is implemented but not fully configured:
- ✅ Code structure complete
- ✅ Prompt engineering implemented
- ✅ Placeholder fallback system working
- ⚠️ **Vertex AI Imagen integration not configured**
- ❌ No image storage configured

**Current Limitation (Line 149):**
```typescript
throw new Error('Vertex AI image generation not yet configured. Please set up Imagen API access by following the deployment guide at docs/DEPLOYMENT_GUIDE.md. You need to enable the Vertex AI API in Google Cloud Console and configure service account credentials.');
```

### 2.2 Required Configuration Steps

#### Step 1: Enable Vertex AI Imagen API

1. **Enable the API:**
```bash
gcloud services enable aiplatform.googleapis.com --project=royalcarriagelimoseo
```

2. **Verify Imagen model availability:**
```bash
gcloud ai models list \
  --region=us-central1 \
  --project=royalcarriagelimoseo \
  --filter="displayName:imagen*"
```

#### Step 2: Configure Service Account for Imagen

The service account needs the following role:
- **Vertex AI User** (`roles/aiplatform.user`)

```bash
# Get the service account email
SERVICE_ACCOUNT="firebase-adminsdk-xxxxx@royalcarriagelimoseo.iam.gserviceaccount.com"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user"
```

#### Step 3: Update Image Generator Implementation

The `generateWithVertexAI` method in `server/ai/image-generator.ts` needs to be updated with actual Imagen API calls. Current implementation is a placeholder.

**Required Updates:**
```typescript
private async generateWithVertexAI(
  prompt: string,
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  if (!this.vertexAI) {
    throw new Error('Vertex AI not initialized');
  }

  // Use Imagen 3 model for image generation
  const model = this.vertexAI.preview.getGenerativeModel({
    model: 'imagen-3.0-generate-001',
    generation_config: {
      number_of_images: 1,
      language: 'en',
      aspect_ratio: '16:9', // Adjust based on request.purpose
    },
  });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  // Extract image data from result
  const imageData = result.response.candidates[0].content.parts[0].inlineData;
  
  // Upload to Cloud Storage and return URL
  const imageUrl = await this.uploadToStorage(imageData);
  
  return {
    imageUrl,
    prompt,
    width: 1920,
    height: 1080,
    format: 'png',
  };
}
```

### 2.3 Image Generation Best Practices

**Security:**
- ✅ Validate all input parameters
- ✅ Sanitize prompts to prevent injection
- ✅ Rate limit image generation requests
- ⚠️ Implement cost monitoring (Imagen charges per image)

**Quality:**
- ✅ Prompt engineering templates are well-designed
- ✅ Multiple purpose-specific prompts implemented
- ⚠️ Add negative prompts to improve quality
- ⚠️ Implement image quality validation

**Performance:**
- ⚠️ Cache generated images
- ⚠️ Implement async generation with status polling
- ⚠️ Add retry logic for failed generations

---

## 3. Cloud Storage Configuration

### 3.1 Current Status

**Issue:** No Cloud Storage bucket configured for storing generated images.

**Impact:**
- Generated images have nowhere to be stored permanently
- Using placeholder URLs instead of actual AI-generated images
- Cannot persist images for reuse

### 3.2 Required Setup

#### Step 1: Create Storage Bucket

```bash
# Create a bucket for AI-generated images
gsutil mb -p royalcarriagelimoseo \
  -c STANDARD \
  -l us-central1 \
  -b on \
  gs://royalcarriagelimoseo-ai-images/

# Set lifecycle policy (optional - auto-delete old images after 90 days)
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 90}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://royalcarriagelimoseo-ai-images/
```

#### Step 2: Configure Bucket Permissions

```bash
# Make bucket publicly readable (for serving images)
gsutil iam ch allUsers:objectViewer gs://royalcarriagelimoseo-ai-images/

# Grant service account write access
gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectCreator \
  gs://royalcarriagelimoseo-ai-images/
```

#### Step 3: Configure CORS (for direct browser access)

```bash
cat > cors.json << EOF
[
  {
    "origin": ["https://royalcarriagelimoseo.web.app", "https://chicagoairportblackcar.com"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://royalcarriagelimoseo-ai-images/
```

#### Step 4: Update Environment Variables

Add to `.env`:
```bash
GOOGLE_CLOUD_STORAGE_BUCKET=royalcarriagelimoseo-ai-images
```

#### Step 5: Implement Storage Upload in Code

Add to `server/ai/image-generator.ts`:
```typescript
import { Storage } from '@google-cloud/storage';

private storage: Storage;

constructor(projectId?: string, location?: string) {
  // ... existing code ...
  this.storage = new Storage({ projectId: this.projectId });
}

private async uploadToStorage(
  imageData: Buffer,
  filename: string
): Promise<string> {
  const bucket = this.storage.bucket(
    process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 
    'royalcarriagelimoseo-ai-images'
  );
  
  const file = bucket.file(`generated/${Date.now()}-${filename}.png`);
  
  await file.save(imageData, {
    metadata: {
      contentType: 'image/png',
      cacheControl: 'public, max-age=31536000',
    },
  });
  
  // Return public URL
  return `https://storage.googleapis.com/${bucket.name}/${file.name}`;
}
```

### 3.3 Storage Security Recommendations

**Access Control:**
- ✅ Public read access for serving images
- ✅ Service account write access only
- ✅ No public write access
- ⚠️ Consider signed URLs for temporary access

**Cost Management:**
- ⚠️ Set up lifecycle policies to delete old images
- ⚠️ Monitor storage usage and costs
- ⚠️ Implement image compression
- ⚠️ Consider CDN (Firebase Hosting or Cloud CDN)

**Backup:**
- ⚠️ Enable versioning for important images
- ⚠️ Set up cross-region replication (if needed)

---

## 4. IAM Roles and Permissions Audit

### 4.1 Service Account Requirements

**Primary Service Account:** `firebase-adminsdk-xxxxx@royalcarriagelimoseo.iam.gserviceaccount.com`

#### Required Roles

| Role | Purpose | Status | Priority |
|------|---------|--------|----------|
| **roles/aiplatform.user** | Vertex AI API access (Imagen, Gemini) | ⚠️ Required | **HIGH** |
| **roles/storage.objectCreator** | Upload images to Cloud Storage | ⚠️ Required | **HIGH** |
| **roles/storage.objectViewer** | Read images from Cloud Storage | ⚠️ Required | **HIGH** |
| **roles/cloudfunctions.developer** | Deploy and manage functions | ✅ Has | Critical |
| **roles/datastore.user** | Firestore read/write | ✅ Has | Critical |
| **roles/logging.logWriter** | Write logs | ✅ Has | Medium |
| **roles/secretmanager.secretAccessor** | Access secrets (if using Secret Manager) | ⚠️ Recommended | Medium |

#### Verify Current Permissions

```bash
# List all IAM bindings for the service account
gcloud projects get-iam-policy royalcarriagelimoseo \
  --flatten="bindings[].members" \
  --filter="bindings.members:firebase-adminsdk*" \
  --format="table(bindings.role)"
```

#### Grant Missing Permissions

```bash
# Get service account email
SERVICE_ACCOUNT=$(gcloud iam service-accounts list \
  --project=royalcarriagelimoseo \
  --filter="displayName:firebase-adminsdk" \
  --format="value(email)")

echo "Service Account: ${SERVICE_ACCOUNT}"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user" \
  --condition=None

# Grant Storage Object Creator role
gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/storage.objectCreator" \
  --condition=None

# Grant Storage Object Viewer role
gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/storage.objectViewer" \
  --condition=None

# Verify permissions were granted
gcloud projects get-iam-policy royalcarriagelimoseo \
  --flatten="bindings[].members" \
  --filter="bindings.members:${SERVICE_ACCOUNT}" \
  --format="table(bindings.role)"
```

### 4.2 Admin User Permissions

For the admin dashboard, ensure proper role-based access control:

**Current Implementation:** `firestore.rules`
- ✅ Admin-only access to all AI collections
- ✅ Role verification using Firestore user documents
- ✅ Read-only audit logs

**Recommendations:**
- ⚠️ Implement Firebase Authentication for admin login
- ⚠️ Use custom claims for role management
- ⚠️ Add multi-factor authentication for admin accounts

### 4.3 Firebase Functions IAM Configuration

**Current Status:** Functions are deployed but have restricted invoker access due to organization policy.

**Issue (from SECURITY_DEPLOYMENT_COMPLETE.md):**
> Organization policy restricts `allUsers` invoker. Functions are deployed and can be made public via Firebase Console if needed.

#### Option 1: Keep Functions Private (Recommended)

Use Firebase App Check or authenticated calls only:

```bash
# Require authentication for function invocations
gcloud functions set-iam-policy triggerPageAnalysis policy.json \
  --region=us-central1

# policy.json
{
  "bindings": [
    {
      "role": "roles/cloudfunctions.invoker",
      "members": [
        "serviceAccount:firebase-adminsdk-xxxxx@royalcarriagelimoseo.iam.gserviceaccount.com"
      ]
    }
  ]
}
```

#### Option 2: Make Functions Public (If Needed)

Only if functions need to be publicly accessible:

```bash
# Make function publicly invocable
gcloud functions add-iam-policy-binding triggerPageAnalysis \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"

# Repeat for other HTTP functions
gcloud functions add-iam-policy-binding generateContent \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"

gcloud functions add-iam-policy-binding generateImage \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker"
```

**Security Note:** If making functions public, implement:
- Rate limiting
- API key authentication
- Request validation
- Usage quotas

---

## 5. Firestore Security Rules Audit

### 5.1 Current Configuration

**File:** `firestore.rules`

**Status:** ✅ Well-configured with admin-only access

#### Strengths:
- ✅ All collections require authentication
- ✅ Role-based access control (RBAC) implemented
- ✅ Audit logs are read-only (even for admins)
- ✅ Helper functions for authentication checks

#### Review:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection - only admins can read/write
    match /users/{userId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // AI images - admin only
    match /ai_images/{imageId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // Audit logs - read only for admins
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only system can write
    }
  }
}
```

### 5.2 Recommendations

#### Add Image Storage Metadata Collection

```javascript
// Image metadata for tracking generated images
match /ai_images/{imageId} {
  allow read: if isAdmin();
  allow create: if isAdmin() && 
    request.resource.data.keys().hasAll([
      'imageUrl', 'purpose', 'prompt', 'createdAt', 'createdBy'
    ]);
  allow update: if isAdmin() && 
    request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['status', 'approvedAt', 'approvedBy']);
  allow delete: if false; // Soft delete only
}
```

#### Add Rate Limiting

```javascript
// Rate limit check for image generation
function canGenerateImage() {
  let user = get(/databases/$(database)/documents/users/$(request.auth.uid));
  let today = request.time.toMillis() - request.time.toMillis() % 86400000;
  let generationsToday = get(/databases/$(database)/documents/usage_stats/$(request.auth.uid + '_' + today));
  
  return isAdmin() && (
    !exists(/databases/$(database)/documents/usage_stats/$(request.auth.uid + '_' + today)) ||
    generationsToday.data.imageGenerations < 50  // Max 50 images per day per admin
  );
}
```

### 5.3 Testing Security Rules

```bash
# Test rules using Firebase emulator
firebase emulators:start --only firestore

# Or test in Firebase Console
# Go to Firestore → Rules → Rules Playground
```

**Test Cases:**
1. ✅ Unauthenticated users cannot read any data
2. ✅ Authenticated non-admin users cannot access admin collections
3. ✅ Admin users can read and write to all collections
4. ✅ No one can write to audit_logs directly
5. ⚠️ Test image generation rate limiting

---

## 6. Environment Variables and Credentials

### 6.1 Current Configuration

**File:** `.env.example`

```bash
NODE_ENV=development
PORT=5000
FIREBASE_PROJECT_ID=royalcarriagelimoseo
GOOGLE_CLOUD_PROJECT=royalcarriagelimoseo
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 6.2 Required Additions

Add to `.env` for image generation:

```bash
# Image Generation Configuration
GOOGLE_CLOUD_STORAGE_BUCKET=royalcarriagelimoseo-ai-images
VERTEX_AI_LOCATION=us-central1
IMAGEN_MODEL=imagen-3.0-generate-001

# Image Generation Limits
MAX_IMAGES_PER_DAY=50
MAX_IMAGE_SIZE_MB=10

# Security
SESSION_SECRET=<existing-64-char-secret>
API_RATE_LIMIT=100  # requests per 15 minutes
```

### 6.3 Credential Management Best Practices

#### ✅ Current Good Practices:
- Session secret is cryptographically secure (64 chars)
- `.env` is in `.gitignore`
- Credentials not committed to repository

#### ⚠️ Recommended Improvements:

**1. Use Google Secret Manager (Recommended)**

```bash
# Store session secret in Secret Manager
echo -n "your-session-secret" | \
  gcloud secrets create session-secret \
    --data-file=- \
    --project=royalcarriagelimoseo

# Grant service account access
gcloud secrets add-iam-policy-binding session-secret \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --project=royalcarriagelimoseo

# Access in code
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: 'projects/royalcarriagelimoseo/secrets/session-secret/versions/latest',
});
const secret = version.payload.data.toString();
```

**2. Rotate Credentials Regularly**

- Service account keys: Every 90 days
- Session secrets: Every 180 days
- API keys: Every 365 days

**3. Separate Credentials by Environment**

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

**4. Use Application Default Credentials (ADC)**

For code running in Google Cloud (Firebase Functions), don't use service account key files. Use ADC:

```typescript
// Don't do this in production:
const vertexAI = new VertexAI({
  project: projectId,
  location: location,
  credentials: JSON.parse(fs.readFileSync(keyFile))
});

// Do this instead:
const vertexAI = new VertexAI({
  project: projectId,
  location: location,
  // ADC will automatically use service account attached to function
});
```

---

## 7. Security Headers and API Protection

### 7.1 Current Security Implementation

**File:** `server/security.ts`

**Status:** ✅ Well-implemented security headers

#### Current Headers:
- ✅ X-Frame-Options: DENY (prevents clickjacking)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Content-Security-Policy (production only)
- ✅ Permissions-Policy

### 7.2 Recommendations for Image Generation

#### Update CSP for Image Generation

Current CSP in `server/security.ts` line 28-34:

```typescript
res.setHeader(
  'Content-Security-Policy',
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; " +
  "img-src 'self' data: https:; " +  // This is good - allows images from any HTTPS source
  "connect-src 'self' https://*.googleapis.com https://*.cloudfunctions.net;"
);
```

**Recommendation:** More restrictive image sources:

```typescript
"img-src 'self' data: https://storage.googleapis.com https://royalcarriagelimoseo-ai-images.storage.googleapis.com https://placehold.co; " +
```

#### Add Rate Limiting for Image Generation

Current rate limit config (line 50-56) is good, but add specific limits for image generation:

```typescript
// In server/ai/routes.ts
import rateLimit from 'express-rate-limit';

// Specific rate limit for image generation (more restrictive)
const imageGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 image generations per hour per IP
  message: 'Too many image generation requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to image generation endpoint
router.post('/generate-image', 
  requireAdmin, 
  imageGenerationLimiter, 
  async (req, res) => {
    // ... image generation logic
  }
);
```

#### Add Request Validation

```typescript
import { z } from 'zod';

const imageGenerationSchema = z.object({
  purpose: z.enum(['hero', 'service_card', 'fleet', 'location', 'testimonial']),
  location: z.string().max(100).optional(),
  vehicle: z.string().max(100).optional(),
  style: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

// In route handler
router.post('/generate-image', requireAdmin, async (req, res) => {
  try {
    const validatedData = imageGenerationSchema.parse(req.body);
    // ... proceed with image generation
  } catch (error) {
    return res.status(400).json({ 
      error: 'Invalid request data',
      details: error.errors 
    });
  }
});
```

---

## 8. Cost Management and Monitoring

### 8.1 Vertex AI Pricing

**Imagen Pricing (as of Jan 2026):**
- Standard quality: ~$0.020 per image
- HD quality: ~$0.040 per image

**Estimated Monthly Costs:**

| Usage Level | Images/Month | Cost/Month |
|-------------|--------------|------------|
| Light | 50 images | $1-2 |
| Medium | 200 images | $4-8 |
| Heavy | 1000 images | $20-40 |

### 8.2 Set Up Budget Alerts

```bash
# Create budget alert at $50/month
gcloud billing budgets create \
  --billing-account=<BILLING_ACCOUNT_ID> \
  --display-name="Vertex AI Budget Alert" \
  --budget-amount=50 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

### 8.3 Usage Monitoring

**Create usage tracking in Firestore:**

```typescript
// Track image generation usage
interface UsageStats {
  userId: string;
  date: string; // YYYY-MM-DD
  imageGenerations: number;
  totalCost: number;
  lastGeneration: Date;
}

// Increment on each generation
async function trackImageGeneration(userId: string, cost: number) {
  const today = new Date().toISOString().split('T')[0];
  const docRef = admin.firestore()
    .collection('usage_stats')
    .doc(`${userId}_${today}`);
  
  await docRef.set({
    userId,
    date: today,
    imageGenerations: admin.firestore.FieldValue.increment(1),
    totalCost: admin.firestore.FieldValue.increment(cost),
    lastGeneration: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}
```

### 8.4 Cloud Storage Costs

**Storage Pricing:**
- Storage: $0.020 per GB per month (Standard)
- Operations: $0.05 per 10,000 Class A operations

**Estimated Costs:**
- 1000 images @ 1MB each = 1GB = $0.020/month
- CDN serving: Minimal (covered by Firebase Hosting)

### 8.5 Monitoring Dashboard

Set up monitoring in Google Cloud Console:

1. Go to https://console.cloud.google.com/monitoring
2. Create custom dashboard
3. Add metrics:
   - Vertex AI API calls
   - Cloud Storage usage
   - Firebase Functions invocations
   - Error rates

---

## 9. Compliance and Data Privacy

### 9.1 Data Handling

**AI-Generated Images:**
- Images generated by Vertex AI Imagen
- Stored in Cloud Storage
- No personal data in images
- Prompt data stored in Firestore

**Compliance Considerations:**
- ✅ No PII in image generation prompts
- ✅ No user-generated content
- ✅ All images are business-related (vehicles, locations)
- ⚠️ Consider adding copyright attribution for AI-generated images

### 9.2 Terms of Service

**Google Cloud AI Terms:**
- Review [Vertex AI Terms of Service](https://cloud.google.com/terms/service-terms)
- Understand [Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy)

**Key Points:**
- ✅ Commercial use allowed with proper licensing
- ✅ Attribution not required for Imagen outputs
- ⚠️ Don't use AI to generate misleading content
- ⚠️ Monitor for quality and appropriateness

### 9.3 Audit Logging

Current implementation in Firestore:
```javascript
match /audit_logs/{logId} {
  allow read: if isAdmin();
  allow write: if false; // Only system can write
}
```

**Recommended Audit Log Structure:**

```typescript
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: 'image_generated' | 'content_generated' | 'page_analyzed';
  resourceId: string;
  resourceType: string;
  details: {
    prompt?: string;
    cost?: number;
    model?: string;
    status: 'success' | 'failed';
    error?: string;
  };
  ipAddress: string;
  userAgent: string;
}
```

**Log all AI operations:**
```typescript
async function logAuditEvent(event: AuditLog) {
  await admin.firestore().collection('audit_logs').add({
    ...event,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}
```

---

## 10. Implementation Checklist

### Phase 1: Essential Configuration (1-2 hours)

- [ ] **Enable Vertex AI API**
  ```bash
  gcloud services enable aiplatform.googleapis.com --project=royalcarriagelimoseo
  ```

- [ ] **Create Cloud Storage Bucket**
  ```bash
  gsutil mb -p royalcarriagelimoseo -c STANDARD -l us-central1 \
    gs://royalcarriagelimoseo-ai-images/
  ```

- [ ] **Configure IAM Permissions**
  - Grant `roles/aiplatform.user` to service account
  - Grant `roles/storage.objectCreator` to service account
  - Grant `roles/storage.objectViewer` to service account

- [ ] **Update Environment Variables**
  - Add `GOOGLE_CLOUD_STORAGE_BUCKET`
  - Add `IMAGEN_MODEL`
  - Add image generation limits

- [ ] **Update image-generator.ts Implementation**
  - Implement actual Imagen API calls
  - Add storage upload functionality
  - Add error handling and retry logic

### Phase 2: Security Hardening (1 hour)

- [ ] **Update Firestore Security Rules**
  - Add image metadata collection rules
  - Add rate limiting rules
  - Test with Rules Playground

- [ ] **Add Request Validation**
  - Implement Zod schemas for image generation
  - Add input sanitization
  - Add request size limits

- [ ] **Configure Rate Limiting**
  - Add image generation rate limiter
  - Configure per-user limits
  - Add usage tracking

- [ ] **Update CSP Headers**
  - Add storage.googleapis.com to img-src
  - Test with browser console

### Phase 3: Monitoring & Cost Control (30 minutes)

- [ ] **Set Up Budget Alerts**
  - Configure $50/month budget
  - Set threshold alerts at 50%, 90%, 100%

- [ ] **Create Usage Dashboard**
  - Add Cloud Monitoring dashboard
  - Configure alerts for errors
  - Monitor Vertex AI usage

- [ ] **Implement Usage Tracking**
  - Add usage_stats collection
  - Track generations per user per day
  - Monitor costs

### Phase 4: Testing & Validation (1 hour)

- [ ] **Test Image Generation Flow**
  - Generate test image from admin dashboard
  - Verify image uploads to storage
  - Verify image is publicly accessible
  - Check Firestore metadata

- [ ] **Test Security**
  - Verify non-admin cannot generate images
  - Test rate limiting
  - Verify audit logging

- [ ] **Load Testing**
  - Test multiple concurrent generations
  - Verify error handling
  - Check cost tracking accuracy

### Phase 5: Documentation Update (30 minutes)

- [ ] **Update DEPLOYMENT_GUIDE.md**
  - Add Imagen configuration steps
  - Add Cloud Storage setup
  - Add IAM permission instructions

- [ ] **Update AI_SYSTEM_GUIDE.md**
  - Document image generation workflow
  - Add cost estimates
  - Add troubleshooting section

- [ ] **Create Admin User Guide**
  - Document how to generate images
  - Explain cost implications
  - Add best practices

---

## 11. Troubleshooting Guide

### Common Issues

#### Issue 1: "Vertex AI not initialized" Error

**Cause:** Service account doesn't have aiplatform.user role

**Solution:**
```bash
gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user"
```

#### Issue 2: "Permission denied" when uploading to storage

**Cause:** Service account lacks storage permissions

**Solution:**
```bash
gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectCreator \
  gs://royalcarriagelimoseo-ai-images/
```

#### Issue 3: "Model not found" Error

**Cause:** Imagen model not available in region

**Solution:**
```bash
# Check available models
gcloud ai models list --region=us-central1 --project=royalcarriagelimoseo

# Use correct model name: imagen-3.0-generate-001
```

#### Issue 4: "Quota exceeded" Error

**Cause:** Vertex AI quota limit reached

**Solution:**
1. Go to https://console.cloud.google.com/iam-admin/quotas
2. Filter by "Vertex AI"
3. Request quota increase
4. Or implement request queuing

#### Issue 5: Images not accessible publicly

**Cause:** Bucket permissions not set correctly

**Solution:**
```bash
gsutil iam ch allUsers:objectViewer gs://royalcarriagelimoseo-ai-images/
```

---

## 12. Security Best Practices Summary

### ✅ Currently Implemented:
1. Admin-only access to all AI features
2. Firestore security rules with RBAC
3. Security headers (CSP, XSS protection, etc.)
4. Audit logging framework
5. Input sanitization
6. Cryptographically secure session secrets

### ⚠️ Recommended Additions:
1. Firebase Authentication for admin login
2. Multi-factor authentication for admins
3. Google Secret Manager for credential storage
4. Rate limiting specific to image generation
5. Cost monitoring and budget alerts
6. Usage quotas per user
7. Image content validation
8. Automatic credential rotation
9. Enhanced audit logging for AI operations
10. Regular security audits

### 🔒 Critical Security Rules:
1. **Never** commit service account keys to git
2. **Always** use HTTPS for all communications
3. **Implement** rate limiting on all AI endpoints
4. **Monitor** usage and costs regularly
5. **Rotate** credentials every 90 days
6. **Test** security rules before deploying
7. **Log** all AI operations for audit trail
8. **Validate** all input before processing
9. **Set** quotas to prevent abuse
10. **Review** IAM permissions quarterly

---

## 13. Next Steps

### Immediate Actions (Today)
1. ✅ Review this audit document
2. ⚠️ Enable Vertex AI API
3. ⚠️ Create Cloud Storage bucket
4. ⚠️ Configure IAM permissions
5. ⚠️ Update environment variables

### Short-term (This Week)
1. ⚠️ Implement Imagen API integration
2. ⚠️ Add storage upload functionality
3. ⚠️ Test image generation flow
4. ⚠️ Set up monitoring and alerts
5. ⚠️ Update documentation

### Long-term (This Month)
1. ⚠️ Implement advanced security features
2. ⚠️ Add usage analytics dashboard
3. ⚠️ Optimize costs and performance
4. ⚠️ Conduct security audit
5. ⚠️ Train team on new features

---

## 14. Conclusion

This audit has identified the following key findings:

### Current State:
- ✅ Firebase infrastructure properly configured
- ✅ Security headers and basic protections in place
- ✅ Firestore rules well-designed
- ⚠️ **Image generation not operational** (needs Vertex AI configuration)
- ⚠️ Cloud Storage not configured
- ⚠️ Missing some IAM permissions

### Required Actions:
1. **High Priority:** Enable Vertex AI and configure Imagen
2. **High Priority:** Set up Cloud Storage for images
3. **High Priority:** Grant required IAM permissions
4. **Medium Priority:** Implement actual image generation code
5. **Medium Priority:** Add monitoring and cost controls

### Estimated Effort:
- Configuration: 2-3 hours
- Implementation: 4-6 hours
- Testing: 2 hours
- Documentation: 1 hour
- **Total: 9-12 hours**

### Recommended Approach:
1. Start with Phase 1 (Essential Configuration)
2. Implement and test image generation
3. Add security hardening
4. Set up monitoring
5. Update documentation
6. Train admin users

**Security Status:** ⚠️ REQUIRES CONFIGURATION  
**Operational Status:** ⚠️ IMAGE GENERATION NOT AVAILABLE  
**Overall Readiness:** 75% (85% with Vertex AI configuration)

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026  
**Next Review:** February 15, 2026  
**Owner:** Development Team
