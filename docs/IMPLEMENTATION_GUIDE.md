# Google Cloud Setup - Implementation Guide

**Status:** Ready for execution  
**Estimated Time:** 30-60 minutes  
**Date:** January 15, 2026

---

## Prerequisites Verification

Before proceeding, ensure you have:

- [x] Google Cloud account with billing enabled
- [x] Project ID: `royalcarriagelimoseo`
- [x] gcloud CLI installed and authenticated
- [x] Firebase CLI installed
- [x] Admin access to Google Cloud Console
- [x] Admin access to Firebase Console

---

## Step-by-Step Implementation

### Phase 1: Execute Automated Setup (20 minutes)

#### 1.1 Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set the project
gcloud config set project royalcarriagelimoseo

# Verify authentication
gcloud auth list --filter=status:ACTIVE
```

**Expected Output:**

```
Credentialed Accounts
ACTIVE  ACCOUNT
*       your-email@example.com
```

#### 1.2 Run the Automated Setup Script

```bash
# Navigate to the repository
cd /home/runner/work/royalcarriage/royalcarriage

# Make the script executable (if not already)
chmod +x script/setup-gcloud-security.sh

# Run the setup script
./script/setup-gcloud-security.sh
```

**What the script does:**

1. ✅ Enables Vertex AI API
2. ✅ Enables Cloud Storage API
3. ✅ Enables Secret Manager API
4. ✅ Creates storage bucket: `royalcarriagelimoseo-ai-images`
5. ✅ Configures CORS for web access
6. ✅ Sets bucket to publicly readable
7. ✅ Grants IAM permissions to Firebase service account
8. ✅ Generates `.env.gcloud-config` file

**Expected Duration:** 15-20 minutes

#### 1.3 Merge Environment Configuration

After the script completes, merge the generated configuration:

```bash
# Review the generated config
cat .env.gcloud-config

# If you don't have a .env file yet, copy it
cp .env.gcloud-config .env

# If you already have a .env file, merge the configurations manually
# Copy relevant lines from .env.gcloud-config to your existing .env
```

#### 1.4 Generate Secure Session Secret

```bash
# Generate a cryptographically secure session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and add to your .env file:
# SESSION_SECRET=<generated-secret>
```

---

### Phase 2: Deploy Updated Configuration (10 minutes)

#### 2.1 Deploy Firestore Rules

```bash
# Deploy the enhanced security rules
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules get
```

**Expected Output:**

```
✔ Deploy complete!
```

#### 2.2 Verify Firestore Indexes

```bash
# Check if indexes need deployment
firebase deploy --only firestore:indexes

# Monitor index creation status
# Go to: https://console.firebase.google.com/project/royalcarriagelimoseo/firestore/indexes
```

#### 2.3 Redeploy Firebase Functions (Optional)

If you made changes to functions:

```bash
cd functions
npm run build
firebase deploy --only functions
cd ..
```

---

### Phase 3: Test Image Generation (15 minutes)

#### 3.1 Access Admin Dashboard

1. Open browser and navigate to: https://royalcarriagelimoseo.web.app/admin
2. Login with admin credentials
3. Navigate to the "Images" tab

#### 3.2 Generate Test Image

**Test Case 1: Hero Image**

- Purpose: hero
- Location: Chicago O'Hare International Airport
- Vehicle: Black Sedan
- Style: Professional, nighttime

Click "Generate" and wait for the image (10-30 seconds)

**Test Case 2: Service Card**

- Purpose: service_card
- Location: Downtown Chicago
- Vehicle: Luxury SUV
- Style: Daytime, clean

**Test Case 3: Fleet Image**

- Purpose: fleet
- Vehicle: Stretch Limousine
- Style: Studio photography

#### 3.3 Verify Image Storage

```bash
# Check that images are being stored in the bucket
gsutil ls gs://royalcarriagelimoseo-ai-images/

# Verify image is accessible
# Copy an image URL and open in browser
```

#### 3.4 Verify Firestore Metadata

1. Go to Firebase Console: https://console.firebase.google.com/project/royalcarriagelimoseo/firestore
2. Navigate to `ai_images` collection
3. Verify entries are being created with correct metadata:
   - imageUrl
   - purpose
   - prompt
   - createdAt
   - createdBy

#### 3.5 Test Rate Limiting

Try generating 51 images in one day to verify rate limiting works:

**Expected:** After 50 images, you should receive an error message about rate limit exceeded.

---

### Phase 4: Set Up Cost Monitoring (10 minutes)

#### 4.1 Create Budget Alert

```bash
# Get your billing account ID
gcloud billing accounts list

# Create budget alert (replace BILLING_ACCOUNT_ID)
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Vertex AI Budget Alert" \
  --budget-amount=50 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

Or via Console:

1. Go to: https://console.cloud.google.com/billing
2. Select your billing account
3. Click "Budgets & alerts"
4. Click "CREATE BUDGET"
5. Set budget amount: $50
6. Set threshold rules: 50%, 90%, 100%
7. Add email notification recipients

#### 4.2 Create Monitoring Dashboard

1. Go to: https://console.cloud.google.com/monitoring/dashboards
2. Click "CREATE DASHBOARD"
3. Name it: "AI Image Generation Monitoring"
4. Add the following charts:

**Chart 1: Vertex AI API Calls**

- Resource type: Vertex AI API
- Metric: Request count
- Aggregation: Sum

**Chart 2: Cloud Storage Usage**

- Resource type: Cloud Storage bucket
- Metric: Total bytes
- Bucket: royalcarriagelimoseo-ai-images

**Chart 3: Firebase Functions Invocations**

- Resource type: Cloud Function
- Metric: Execution count
- Function: generateImage

**Chart 4: Error Rate**

- Resource type: Cloud Function
- Metric: Error count
- All AI-related functions

#### 4.3 Set Up Alerting Policies

```bash
# Example: Alert when error rate exceeds 5%
gcloud alpha monitoring policies create \
  --notification-channels=EMAIL_CHANNEL_ID \
  --display-name="High AI Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s
```

Or via Console:

1. Go to: https://console.cloud.google.com/monitoring/alerting
2. Click "CREATE POLICY"
3. Add conditions for:
   - Error rate > 5%
   - Vertex AI quota usage > 80%
   - Storage bucket size > 10GB

---

### Phase 5: Team Training (15 minutes)

#### 5.1 Create Admin User Guide

A separate document has been created: `docs/ADMIN_USER_GUIDE.md`

Key topics covered:

- How to access admin dashboard
- How to generate images
- Understanding cost implications
- Best practices
- Troubleshooting

#### 5.2 Schedule Team Training Session

**Recommended Training Agenda:**

1. **Introduction (5 min)**
   - Overview of AI image generation capability
   - Business benefits

2. **Hands-on Demo (10 min)**
   - Login to admin dashboard
   - Generate test images
   - Review generated images
   - Understand metadata

3. **Cost Awareness (5 min)**
   - Cost per image
   - Monthly budget
   - Rate limits

4. **Best Practices (10 min)**
   - When to use AI-generated images vs stock photos
   - Writing effective prompts
   - Quality assessment
   - Approval workflow

5. **Troubleshooting (5 min)**
   - Common issues
   - Who to contact
   - Where to find logs

6. **Q&A (10 min)**

#### 5.3 Document Key Contacts

**For Technical Issues:**

- Primary: DevOps Team
- Escalation: Development Team

**For Cost/Billing Questions:**

- Primary: Finance Team
- Secondary: DevOps Team

**For Content/Quality Questions:**

- Primary: Marketing Team
- Secondary: Development Team

---

## Verification Checklist

After completing all phases, verify:

### APIs and Services

- [ ] Vertex AI API is enabled
- [ ] Cloud Storage API is enabled
- [ ] Service account has all required roles

### Storage

- [ ] Bucket `royalcarriagelimoseo-ai-images` exists
- [ ] Bucket is publicly readable
- [ ] CORS is configured
- [ ] Images can be uploaded

### Security

- [ ] Firestore rules deployed
- [ ] Rate limiting works (tested with 51 images)
- [ ] Input validation works
- [ ] Audit logs are being created

### Monitoring

- [ ] Budget alert created at $50
- [ ] Monitoring dashboard created
- [ ] Alerting policies configured
- [ ] Email notifications set up

### Testing

- [ ] Hero image generation works
- [ ] Service card image generation works
- [ ] Fleet image generation works
- [ ] Images are accessible via URL
- [ ] Metadata is stored in Firestore

### Documentation

- [ ] Team has access to user guide
- [ ] Training session scheduled
- [ ] Key contacts documented
- [ ] Troubleshooting guide reviewed

---

## Post-Implementation

### Week 1 Tasks

- [ ] Monitor daily usage and costs
- [ ] Review first batch of generated images
- [ ] Collect feedback from team
- [ ] Adjust rate limits if needed
- [ ] Document any issues encountered

### Month 1 Tasks

- [ ] Analyze total costs vs budget
- [ ] Review image quality and usage patterns
- [ ] Optimize prompts based on results
- [ ] Consider adjusting budget if needed
- [ ] Conduct team feedback session

### Ongoing Tasks

- [ ] Monthly cost review
- [ ] Quarterly security audit
- [ ] Update documentation as needed
- [ ] Review and update rate limits
- [ ] Monitor for new Vertex AI features

---

## Rollback Plan

If issues are encountered, you can rollback changes:

### Disable Image Generation

```bash
# Remove IAM permissions (this disables image generation)
SERVICE_ACCOUNT=$(gcloud iam service-accounts list \
  --project=royalcarriagelimoseo \
  --filter="displayName:firebase-adminsdk" \
  --format="value(email)")

gcloud projects remove-iam-policy-binding royalcarriagelimoseo \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/aiplatform.user"
```

### Revert Firestore Rules

```bash
# Checkout previous version of firestore.rules
git checkout <previous-commit> -- firestore.rules

# Deploy old rules
firebase deploy --only firestore:rules
```

### Delete Storage Bucket (if needed)

```bash
# WARNING: This deletes all images
gsutil -m rm -r gs://royalcarriagelimoseo-ai-images/
```

---

## Success Metrics

After 1 month, evaluate success based on:

1. **Usage Metrics**
   - Number of images generated
   - Number of active users
   - Average images per user

2. **Cost Metrics**
   - Actual cost vs budget
   - Cost per image
   - Cost trend over time

3. **Quality Metrics**
   - Image approval rate
   - User satisfaction score
   - Number of issues/bugs

4. **Performance Metrics**
   - Average generation time
   - Error rate
   - System uptime

---

## Support Resources

- **Technical Documentation:** `docs/GOOGLE_CLOUD_SECURITY_AUDIT.md`
- **Quick Reference:** `docs/ENABLE_IMAGE_GENERATION.md`
- **Checklist:** `docs/GCLOUD_CONFIG_CHECKLIST.md`
- **User Guide:** `docs/ADMIN_USER_GUIDE.md` (new)
- **Google Cloud Console:** https://console.cloud.google.com
- **Firebase Console:** https://console.firebase.google.com

---

**Implementation Status:** Ready to execute  
**Next Step:** Run `./script/setup-gcloud-security.sh`  
**Estimated Completion:** 1 hour total

---

**Last Updated:** January 15, 2026  
**Version:** 1.0
