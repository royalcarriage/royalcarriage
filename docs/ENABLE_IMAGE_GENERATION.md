# Quick Guide: Enable Image Generation

This guide provides step-by-step instructions to enable AI image generation in your admin dashboard.

## Prerequisites

- Google Cloud Project: `royalcarriagelimoseo`
- Firebase CLI installed
- gcloud CLI installed and authenticated
- Admin access to Google Cloud Console

## Step 1: Enable Vertex AI API (5 minutes)

### Option A: Using gcloud CLI (Recommended)

```bash
# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com --project=royalcarriagelimoseo

# Verify it's enabled
gcloud services list --enabled --project=royalcarriagelimoseo | grep aiplatform
```

### Option B: Using Google Cloud Console

1. Go to https://console.cloud.google.com/apis/library?project=royalcarriagelimoseo
2. Search for "Vertex AI API"
3. Click "Enable"
4. Wait for confirmation

## Step 2: Enable Cloud Storage API (2 minutes)

```bash
# Enable Cloud Storage API
gcloud services enable storage-api.googleapis.com --project=royalcarriagelimoseo

# Verify
gcloud services list --enabled --project=royalcarriagelimoseo | grep storage
```

## Step 3: Create Storage Bucket for Images (5 minutes)

```bash
# Create bucket
gsutil mb -p royalcarriagelimoseo \
  -c STANDARD \
  -l us-central1 \
  gs://royalcarriagelimoseo-ai-images/

# Set CORS for web access
cat > /tmp/cors.json << 'EOF'
[
  {
    "origin": ["https://royalcarriagelimoseo.web.app", "https://chicagoairportblackcar.com"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set /tmp/cors.json gs://royalcarriagelimoseo-ai-images/

# Make bucket publicly readable (for serving images)
gsutil iam ch allUsers:objectViewer gs://royalcarriagelimoseo-ai-images/

# Verify bucket was created
gsutil ls -p royalcarriagelimoseo
```

## Step 4: Configure IAM Permissions (5 minutes)

```bash
# Get the Firebase service account email
SERVICE_ACCOUNT=$(gcloud iam service-accounts list \
  --project=royalcarriagelimoseo \
  --filter="displayName:firebase-adminsdk" \
  --format="value(email)")

echo "Service Account: ${SERVICE_ACCOUNT}"

# Grant Vertex AI User role (for image generation)
gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user"

# Grant Storage Object Creator role (for uploading images)
gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/storage.objectCreator"

# Grant Storage Object Viewer role (for reading images)
gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/storage.objectViewer"

# Verify permissions
echo "Verifying permissions..."
gcloud projects get-iam-policy royalcarriagelimoseo \
  --flatten="bindings[].members" \
  --filter="bindings.members:${SERVICE_ACCOUNT}" \
  --format="table(bindings.role)"
```

Expected output should include:
- `roles/aiplatform.user`
- `roles/storage.objectCreator`
- `roles/storage.objectViewer`

## Step 5: Update Environment Variables (2 minutes)

Add these variables to your `.env` file:

```bash
# Image Generation Configuration
GOOGLE_CLOUD_STORAGE_BUCKET=royalcarriagelimoseo-ai-images
VERTEX_AI_LOCATION=us-central1
IMAGEN_MODEL=imagen-3.0-generate-001

# Image Generation Limits
MAX_IMAGES_PER_DAY=50
MAX_IMAGE_SIZE_MB=10
```

## Step 6: Update Dependencies (Optional)

If not already installed, add the Cloud Storage SDK:

```bash
npm install @google-cloud/storage
```

## Step 7: Verify Configuration (5 minutes)

### Test 1: Verify API is Enabled

```bash
gcloud services list --enabled --project=royalcarriagelimoseo | grep -E "aiplatform|storage"
```

Should show:
- `aiplatform.googleapis.com`
- `storage-api.googleapis.com`

### Test 2: Verify Bucket Access

```bash
# Test write access (using your credentials)
echo "test" | gsutil cp - gs://royalcarriagelimoseo-ai-images/test.txt

# Verify file was created
gsutil ls gs://royalcarriagelimoseo-ai-images/

# Clean up test file
gsutil rm gs://royalcarriagelimoseo-ai-images/test.txt
```

### Test 3: Check Service Account Permissions

```bash
# Verify the service account has required roles
gcloud projects get-iam-policy royalcarriagelimoseo \
  --flatten="bindings[].members" \
  --filter="bindings.members:firebase-adminsdk" \
  --format="table(bindings.role)" | grep -E "aiplatform|storage"
```

## Step 8: Deploy Updated Configuration (5 minutes)

If you made code changes:

```bash
# Rebuild the application
npm run build

# Deploy to Firebase
firebase deploy --only hosting,functions
```

## Step 9: Test Image Generation (5 minutes)

1. Go to your admin dashboard: https://royalcarriagelimoseo.web.app/admin
2. Navigate to the "Images" tab
3. Click "Generate Image"
4. Fill in the form:
   - Purpose: hero
   - Location: Chicago O'Hare Airport
   - Vehicle: Black Sedan
5. Click "Generate"
6. Wait for the image to be generated (~10-30 seconds)
7. Verify the image appears and is accessible

## Troubleshooting

### Error: "Vertex AI not initialized"

**Cause:** API not enabled or service account lacks permissions

**Solution:**
```bash
# Re-enable the API
gcloud services enable aiplatform.googleapis.com --project=royalcarriagelimoseo

# Re-grant permissions
SERVICE_ACCOUNT=$(gcloud iam service-accounts list \
  --project=royalcarriagelimoseo \
  --filter="displayName:firebase-adminsdk" \
  --format="value(email)")

gcloud projects add-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user"
```

### Error: "Permission denied" uploading to storage

**Solution:**
```bash
# Grant storage permissions
SERVICE_ACCOUNT=$(gcloud iam service-accounts list \
  --project=royalcarriagelimoseo \
  --filter="displayName:firebase-adminsdk" \
  --format="value(email)")

gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectCreator \
  gs://royalcarriagelimoseo-ai-images/
```

### Error: "Bucket not found"

**Solution:**
```bash
# Create the bucket
gsutil mb -p royalcarriagelimoseo \
  -c STANDARD \
  -l us-central1 \
  gs://royalcarriagelimoseo-ai-images/
```

### Error: "Model not found"

**Cause:** Incorrect model name or model not available in region

**Solution:**
```bash
# List available models
gcloud ai models list \
  --region=us-central1 \
  --project=royalcarriagelimoseo \
  --filter="displayName:imagen*"

# Use the correct model name from the output
```

### Images not loading in browser

**Cause:** CORS not configured or bucket not public

**Solution:**
```bash
# Set CORS
cat > /tmp/cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set /tmp/cors.json gs://royalcarriagelimoseo-ai-images/

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://royalcarriagelimoseo-ai-images/
```

## Cost Estimates

After enabling image generation:

| Usage | Images/Month | Estimated Cost |
|-------|--------------|----------------|
| Light | 50 | $1-2 |
| Medium | 200 | $4-8 |
| Heavy | 1000 | $20-40 |

**Recommendations:**
- Start with light usage to test
- Set up budget alerts (see main audit document)
- Monitor usage in Google Cloud Console

## Monitoring

### Check Vertex AI Usage

```bash
# View Vertex AI logs
gcloud logging read "resource.type=aiplatform.googleapis.com/Endpoint" \
  --project=royalcarriagelimoseo \
  --limit=10 \
  --format=json
```

### Check Storage Usage

```bash
# Check bucket size
gsutil du -sh gs://royalcarriagelimoseo-ai-images/

# List recent files
gsutil ls -l gs://royalcarriagelimoseo-ai-images/ | tail -10
```

### Monitor Costs

1. Go to https://console.cloud.google.com/billing
2. Select your billing account
3. Click "Reports"
4. Filter by:
   - Service: Vertex AI API
   - Service: Cloud Storage

## Security Checklist

After completing setup:

- [ ] Vertex AI API is enabled
- [ ] Cloud Storage bucket created
- [ ] Service account has minimum required permissions
- [ ] CORS configured for web access
- [ ] Bucket is publicly readable (but not writable)
- [ ] Environment variables configured
- [ ] Rate limiting in place
- [ ] Budget alerts configured
- [ ] Audit logging enabled
- [ ] Image generation tested successfully

## Next Steps

1. ✅ Complete all steps in this guide
2. 📚 Read the full [Google Cloud Security Audit](GOOGLE_CLOUD_SECURITY_AUDIT.md)
3. 🔒 Review security recommendations
4. 📊 Set up monitoring and alerts
5. 💰 Configure budget alerts
6. 👥 Train admin users on image generation

## Support

For detailed information, see:
- [Google Cloud Security Audit](GOOGLE_CLOUD_SECURITY_AUDIT.md) - Complete audit and recommendations
- [AI System Guide](AI_SYSTEM_GUIDE.md) - Full AI system documentation
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deployment instructions

---

**Estimated Time:** 30-40 minutes  
**Difficulty:** Intermediate  
**Prerequisites:** Admin access to Google Cloud and Firebase

**Last Updated:** January 15, 2026
