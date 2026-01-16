# Google Cloud Configuration Checklist

Use this checklist to track your progress in configuring Google Cloud for AI image generation.

## Quick Start

**Estimated Time:** 30-40 minutes  
**Difficulty:** Intermediate

---

## Prerequisites ✓

- [ ] Google Cloud account with billing enabled
- [ ] Project: `royalcarriagelimoseo`
- [ ] gcloud CLI installed
- [ ] Firebase CLI installed
- [ ] Admin access to Google Cloud Console
- [ ] Admin access to Firebase Console

---

## Phase 1: API Configuration (10 minutes)

### Required APIs to Enable

- [ ] **Vertex AI API** (`aiplatform.googleapis.com`)
  - Used for: Image generation (Imagen), content generation (Gemini Pro)
  - Command: `gcloud services enable aiplatform.googleapis.com --project=royalcarriagelimoseo`

- [ ] **Cloud Storage API** (`storage-api.googleapis.com`)
  - Used for: Storing generated images
  - Command: `gcloud services enable storage-api.googleapis.com --project=royalcarriagelimoseo`

- [ ] **Secret Manager API** (`secretmanager.googleapis.com`) - Optional but recommended
  - Used for: Secure credential storage
  - Command: `gcloud services enable secretmanager.googleapis.com --project=royalcarriagelimoseo`

### Verification

- [ ] Run: `gcloud services list --enabled --project=royalcarriagelimoseo | grep -E "aiplatform|storage"`
- [ ] Confirm all APIs show as enabled

---

## Phase 2: Cloud Storage Setup (10 minutes)

### Create Storage Bucket

- [ ] Create bucket: `royalcarriagelimoseo-ai-images`
  - Command: `gsutil mb -p royalcarriagelimoseo -c STANDARD -l us-central1 gs://royalcarriagelimoseo-ai-images/`

### Configure Bucket Permissions

- [ ] Set CORS policy (allows web access)
  - See: `docs/ENABLE_IMAGE_GENERATION.md` for CORS config

- [ ] Make bucket publicly readable
  - Command: `gsutil iam ch allUsers:objectViewer gs://royalcarriagelimoseo-ai-images/`

- [ ] Verify bucket exists
  - Command: `gsutil ls -p royalcarriagelimoseo`

---

## Phase 3: IAM Permissions (10 minutes)

### Identify Service Account

- [ ] Get Firebase service account email
  - Command: `gcloud iam service-accounts list --project=royalcarriagelimoseo --filter="displayName:firebase-adminsdk" --format="value(email)"`
  - Email: `___________________________`

### Grant Required Roles

- [ ] **Vertex AI User** (`roles/aiplatform.user`)
  - Allows: Image generation with Imagen
  - Command: `gcloud projects add-iam-policy-binding royalcarriagelimoseo --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" --role="roles/aiplatform.user"`

- [ ] **Storage Object Creator** (`roles/storage.objectCreator`)
  - Allows: Upload images to bucket
  - Command: `gcloud projects add-iam-policy-binding royalcarriagelimoseo --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" --role="roles/storage.objectCreator"`

- [ ] **Storage Object Viewer** (`roles/storage.objectViewer`)
  - Allows: Read images from bucket
  - Command: `gcloud projects add-iam-policy-binding royalcarriagelimoseo --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" --role="roles/storage.objectViewer"`

### Grant Bucket-Specific Permissions

- [ ] Grant write access to bucket
  - Command: `gsutil iam ch serviceAccount:SERVICE_ACCOUNT_EMAIL:objectCreator gs://royalcarriagelimoseo-ai-images/`

### Verification

- [ ] Verify all roles granted
  - Command: `gcloud projects get-iam-policy royalcarriagelimoseo --flatten="bindings[].members" --filter="bindings.members:SERVICE_ACCOUNT_EMAIL" --format="table(bindings.role)"`
  - Should see: `roles/aiplatform.user`, `roles/storage.objectCreator`, `roles/storage.objectViewer`

---

## Phase 4: Environment Configuration (5 minutes)

### Update .env File

Add these variables to your `.env` file:

- [ ] `GOOGLE_CLOUD_STORAGE_BUCKET=royalcarriagelimoseo-ai-images`
- [ ] `VERTEX_AI_LOCATION=us-central1`
- [ ] `IMAGEN_MODEL=imagen-3.0-generate-001`
- [ ] `MAX_IMAGES_PER_DAY=50`
- [ ] `MAX_IMAGE_SIZE_MB=10`
- [ ] `API_RATE_LIMIT=100`

### Generate Session Secret (if not already done)

- [ ] Generate secure secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Add to `.env`: `SESSION_SECRET=<generated-secret>`

---

## Phase 5: Security Configuration (5 minutes)

### Firestore Security Rules

- [ ] Review enhanced security rules in `firestore.rules`
  - Includes rate limiting (50 images/day per admin)
  - Includes input validation
  - Includes usage tracking

- [ ] Deploy Firestore rules
  - Command: `firebase deploy --only firestore:rules`

### API Security

- [ ] Verify rate limiting is configured in `server/security.ts`
- [ ] Verify CORS is properly configured
- [ ] Verify CSP headers include storage.googleapis.com

---

## Phase 6: Monitoring & Cost Control (5 minutes)

### Set Up Budget Alerts

- [ ] Create budget alert for $50/month
  - Console: https://console.cloud.google.com/billing
  - Set thresholds at 50%, 90%, 100%

### Set Up Monitoring Dashboard

- [ ] Create Cloud Monitoring dashboard
  - Console: https://console.cloud.google.com/monitoring
  - Add Vertex AI API metrics
  - Add Cloud Storage metrics

### Usage Tracking

- [ ] Verify `usage_stats` collection in Firestore rules
- [ ] Plan to monitor image generation costs

---

## Phase 7: Testing (10 minutes)

### Test Configuration

- [ ] Test bucket write access
  - Command: `echo "test" | gsutil cp - gs://royalcarriagelimoseo-ai-images/test.txt`
  - Command: `gsutil rm gs://royalcarriagelimoseo-ai-images/test.txt`

- [ ] Test Vertex AI access
  - Command: `gcloud ai models list --region=us-central1 --project=royalcarriagelimoseo | head -5`

### Test Image Generation Flow

- [ ] Deploy application
  - Command: `firebase deploy`

- [ ] Access admin dashboard
  - URL: https://royalcarriagelimoseo.web.app/admin

- [ ] Navigate to Images tab

- [ ] Generate test image
  - Purpose: hero
  - Location: Chicago O'Hare Airport
  - Vehicle: Black Sedan

- [ ] Verify image appears and is accessible

- [ ] Check Firestore for image metadata in `ai_images` collection

- [ ] Check Cloud Storage for image file

### Test Security

- [ ] Attempt to access image generation without admin login (should fail)
- [ ] Verify rate limiting works (try generating 51+ images in one day)
- [ ] Check audit logs are being created in Firestore

---

## Phase 8: Documentation (5 minutes)

### Review Documentation

- [ ] Read: `docs/GOOGLE_CLOUD_SECURITY_AUDIT.md` (comprehensive audit)
- [ ] Read: `docs/ENABLE_IMAGE_GENERATION.md` (quick guide)
- [ ] Bookmark for reference

### Update Team Documentation

- [ ] Share checklist with team
- [ ] Document any project-specific configurations
- [ ] Note any issues encountered and solutions

---

## Optional: Advanced Configuration

### Secret Manager (Recommended)

- [ ] Migrate SESSION_SECRET to Secret Manager
- [ ] Update code to read from Secret Manager
- [ ] Remove SESSION_SECRET from .env

### Enhanced Monitoring

- [ ] Set up Cloud Logging queries for errors
- [ ] Create alerting policies for high error rates
- [ ] Set up uptime checks for Firebase Functions

### Performance Optimization

- [ ] Enable Cloud CDN for image serving
- [ ] Configure image compression in storage bucket
- [ ] Set up lifecycle policies for old images

---

## Troubleshooting

### Common Issues Checklist

If image generation fails:

- [ ] Verify Vertex AI API is enabled
- [ ] Check service account has all required roles
- [ ] Confirm bucket exists and is accessible
- [ ] Review Firebase Functions logs
- [ ] Check browser console for errors
- [ ] Verify environment variables are set correctly

### Support Resources

- [ ] Documentation: `docs/GOOGLE_CLOUD_SECURITY_AUDIT.md`
- [ ] Quick Guide: `docs/ENABLE_IMAGE_GENERATION.md`
- [ ] Google Cloud Console: https://console.cloud.google.com
- [ ] Firebase Console: https://console.firebase.google.com
- [ ] Cloud Status: https://status.cloud.google.com

---

## Automated Setup

### Use Setup Script

Instead of manual steps, you can use the automated script:

- [ ] Review script: `script/setup-gcloud-security.sh`
- [ ] Make executable: `chmod +x script/setup-gcloud-security.sh`
- [ ] Run script: `./script/setup-gcloud-security.sh`
- [ ] Review output and follow any additional instructions

---

## Completion

### Final Verification

- [ ] All APIs enabled and verified
- [ ] Storage bucket created and configured
- [ ] IAM permissions granted
- [ ] Environment variables configured
- [ ] Security rules deployed
- [ ] Budget alerts configured
- [ ] Image generation tested successfully
- [ ] Team documentation updated

### Sign-off

- **Configured by:** ************\_\_\_************
- **Date:** ************\_\_\_************
- **Verified by:** ************\_\_\_************
- **Production ready:** ☐ Yes ☐ No

### Notes

---

---

---

---

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026  
**Next Review:** February 15, 2026
