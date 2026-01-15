# Complete Deployment Guide

**Date:** January 15, 2026  
**Project:** Royal Carriage AI Image Generation System  
**Status:** Ready for Deployment

---

## Quick Deployment

For immediate deployment, run these commands:

```bash
# 1. Check readiness
./script/check-deployment-readiness.sh

# 2. Deploy everything
./script/deploy.sh

# Or deploy specific components:
./script/deploy.sh --hosting-only
./script/deploy.sh --functions-only
./script/deploy.sh --firestore-only

# Dry run (test without deploying):
./script/deploy.sh --dry-run
```

---

## Full Deployment Process

### Phase 1: Pre-Deployment Checklist

#### 1.1 Environment Setup

- [ ] Node.js 20+ installed
- [ ] npm installed
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] gcloud CLI installed (optional but recommended)

#### 1.2 Authentication

```bash
# Login to Firebase
firebase login

# Login to Google Cloud (for GCP setup)
gcloud auth login
gcloud config set project royalcarriagelimoseo
```

#### 1.3 Install Dependencies

```bash
# Root project
npm install

# Firebase Functions
cd functions
npm install
cd ..
```

#### 1.4 Configuration Files

- [ ] `.env` file created (copy from `.env.example`)
- [ ] `SESSION_SECRET` generated and set
- [ ] `GOOGLE_CLOUD_PROJECT` set to `royalcarriagelimoseo`
- [ ] `.firebaserc` configured with project ID
- [ ] `firebase.json` present

---

### Phase 2: Google Cloud Setup (Optional but Recommended)

For full AI image generation functionality:

#### 2.1 Automated Setup

```bash
# Run the automated setup script
./script/setup-gcloud-security.sh
```

This script will:
- Enable required Google Cloud APIs
- Create Cloud Storage bucket
- Grant IAM permissions
- Generate environment configuration

#### 2.2 Manual Setup

If you prefer manual setup, follow: `docs/ENABLE_IMAGE_GENERATION.md`

#### 2.3 Verify Configuration

```bash
# Check system readiness
curl http://localhost:5000/api/ai/config-status

# Or after starting server:
npm run dev
# Then visit: http://localhost:5000/api/ai/config-status
```

---

### Phase 3: Build & Test Locally

#### 3.1 Build the Project

```bash
# Build client and server
npm run build
```

Expected output:
- `dist/` directory created
- Client assets generated
- Server bundle created

#### 3.2 Test Locally

```bash
# Start local server
npm start

# In another terminal, test endpoints:
curl http://localhost:5000/api/ai/health
curl http://localhost:5000/api/ai/config-status
```

#### 3.3 Test Firebase Functions Locally (Optional)

```bash
# Build functions
cd functions
npm run build
cd ..

# Start Firebase emulator
firebase emulators:start

# Test function endpoints:
curl http://localhost:5001/royalcarriagelimoseo/us-central1/generateImage \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"purpose":"hero","location":"Chicago OHare Airport"}'
```

---

### Phase 4: Deploy to Firebase

#### 4.1 Run Deployment Readiness Check

```bash
./script/check-deployment-readiness.sh
```

Fix any issues reported before proceeding.

#### 4.2 Deploy All Components

```bash
./script/deploy.sh
```

This will:
1. Check deployment readiness
2. Build the project
3. Build Firebase Functions
4. Deploy to Firebase (hosting, functions, firestore)
5. Show deployment summary

#### 4.3 Deploy Specific Components

```bash
# Deploy only hosting
./script/deploy.sh --hosting-only

# Deploy only functions
./script/deploy.sh --functions-only

# Deploy only Firestore rules
./script/deploy.sh --firestore-only
```

#### 4.4 Deployment Output

Expected output:
```
✓ Deployment readiness check passed
✓ Build completed successfully
✓ Functions build completed successfully
✓ Deployment completed successfully!

Hosting URL: https://royalcarriagelimoseo.web.app
Admin Dashboard: https://royalcarriagelimoseo.web.app/admin
Functions deployed to: https://us-central1-royalcarriagelimoseo.cloudfunctions.net/
```

---

### Phase 5: Post-Deployment Verification

#### 5.1 Verify Hosting

```bash
# Check if site is live
curl -I https://royalcarriagelimoseo.web.app

# Should return HTTP 200
```

Visit in browser:
- Main site: https://royalcarriagelimoseo.web.app
- Admin dashboard: https://royalcarriagelimoseo.web.app/admin

#### 5.2 Verify Firebase Functions

```bash
# List deployed functions
firebase functions:list

# Check function logs
firebase functions:log --only generateImage

# Test function endpoint
curl https://us-central1-royalcarriagelimoseo.cloudfunctions.net/generateImage \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "hero",
    "location": "Chicago OHare Airport",
    "vehicle": "Black Sedan"
  }'
```

#### 5.3 Verify Firestore Rules

1. Go to Firebase Console: https://console.firebase.google.com/project/royalcarriagelimoseo/firestore/rules
2. Verify rules are active
3. Check "Publish" status

#### 5.4 Test Image Generation

1. Access admin dashboard
2. Navigate to Images tab
3. Generate a test image
4. Verify:
   - Image generates successfully (or shows clear error)
   - Metadata saved to Firestore
   - Usage stats updated
   - Audit log created

---

### Phase 6: Monitoring & Maintenance

#### 6.1 Monitor Deployment

```bash
# Watch function logs in real-time
firebase functions:log --follow

# Check hosting traffic
firebase hosting:channel:list

# Monitor Firestore usage
# Visit: https://console.firebase.google.com/project/royalcarriagelimoseo/firestore/usage
```

#### 6.2 Set Up Monitoring

Follow: `docs/COST_MONITORING_SETUP.md`

- Create budget alerts
- Set up monitoring dashboard
- Configure alerting policies

#### 6.3 Regular Maintenance

Weekly:
- Check function logs for errors
- Review usage statistics
- Monitor costs

Monthly:
- Update dependencies
- Review security
- Optimize performance

---

## Troubleshooting

### Deployment Fails

**Issue:** `Error: HTTP Error: 403`

**Solution:**
```bash
# Re-authenticate
firebase login --reauth

# Verify project
firebase use --project royalcarriagelimoseo
```

### Build Fails

**Issue:** TypeScript errors

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### Functions Deployment Timeout

**Issue:** Functions take too long to deploy

**Solution:**
```bash
# Deploy functions one at a time
firebase deploy --only functions:generateImage
firebase deploy --only functions:triggerPageAnalysis
firebase deploy --only functions:generateContent
```

### Firestore Rules Rejected

**Issue:** Invalid syntax in firestore.rules

**Solution:**
```bash
# Validate rules locally
firebase firestore:rules get

# Test rules
firebase emulators:start --only firestore
```

### Site Returns 404

**Issue:** Hosting not updated

**Solution:**
```bash
# Force redeploy hosting
firebase deploy --only hosting --force
```

---

## Rollback Procedure

If deployment causes issues:

### Rollback Hosting

```bash
# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

### Rollback Functions

```bash
# List previous versions
gcloud functions list --project=royalcarriagelimoseo

# Deploy previous version (requires git)
git checkout <previous-commit>
firebase deploy --only functions
```

### Rollback Firestore Rules

```bash
# Get previous rules
firebase firestore:rules get --version <version-number>

# Restore from backup
git checkout <previous-commit> -- firestore.rules
firebase deploy --only firestore:rules
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Dependencies up to date
- [ ] Environment variables configured
- [ ] Firebase project configured
- [ ] Code reviewed and approved
- [ ] Documentation updated

### During Deployment
- [ ] Deployment readiness check passed
- [ ] Build successful
- [ ] Functions built successfully
- [ ] Firebase deploy successful
- [ ] No errors in deployment logs

### Post-Deployment
- [ ] Site accessible
- [ ] Admin dashboard loads
- [ ] Functions responding
- [ ] Firestore rules active
- [ ] Test image generation works
- [ ] Monitoring configured
- [ ] Team notified

---

## Additional Resources

### Documentation
- [Google Cloud Security Audit](GOOGLE_CLOUD_SECURITY_AUDIT.md)
- [Implementation Guide](IMPLEMENTATION_GUIDE.md)
- [Admin User Guide](ADMIN_USER_GUIDE.md)
- [Cost Monitoring Setup](COST_MONITORING_SETUP.md)

### Firebase Resources
- Firebase Console: https://console.firebase.google.com/project/royalcarriagelimoseo
- Firebase Documentation: https://firebase.google.com/docs

### Google Cloud Resources
- Cloud Console: https://console.cloud.google.com
- Vertex AI Documentation: https://cloud.google.com/vertex-ai/docs

### Support
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: [firebase] tag

---

## Success Criteria

Deployment is successful when:

1. ✅ Site loads at https://royalcarriagelimoseo.web.app
2. ✅ Admin dashboard accessible
3. ✅ All 6 Firebase Functions deployed
4. ✅ Firestore rules active
5. ✅ Image generation works (or shows clear error with setup instructions)
6. ✅ Usage tracking functional
7. ✅ Audit logging working
8. ✅ No critical errors in logs
9. ✅ Monitoring configured
10. ✅ Team can access and use system

---

**Deployment Status:** Ready  
**Next Step:** Run `./script/check-deployment-readiness.sh`  
**Estimated Time:** 15-30 minutes

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026
