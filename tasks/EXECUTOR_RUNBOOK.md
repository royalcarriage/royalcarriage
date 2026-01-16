# Executor Runbook for Gemini

This document provides exact, step-by-step instructions for executing deployment and maintenance tasks for the Royal Carriage Limo system.

## Prerequisites

All commands assume:
- Working directory: `/Users/admin/VSCODE`
- Firebase CLI authenticated
- Node.js 20+ installed
- pnpm package manager available

## Project Structure

```
/Users/admin/VSCODE/
├── apps/
│   ├── admin/          # Admin dashboard (Next.js)
│   ├── airport/        # Airport site (Astro)
│   ├── corporate/      # Corporate site (Astro)
│   ├── wedding/        # Wedding site (Astro)
│   └── partybus/       # Party bus site (Astro)
├── functions/          # Firebase Cloud Functions
├── firestore.rules     # Firestore security rules
├── storage.rules       # Storage security rules
├── firebase.json       # Firebase config
└── .firebaserc         # Firebase project aliases
```

## Firebase Project Configuration

**Project ID:** `royalcarriagelimoseo`

**Hosting Targets:**
- `admin` → `royalcarriagelimoseo`
- `airport` → `chicagoairportblackcar`
- `corporate` → `chicagoexecutivecarservice`
- `wedding` → `chicagoweddingtransportation`
- `partybus` → `chicago-partybus`

## Runbook 1: Deploy P0 Security Fixes

### Objective
Deploy critical security fixes for Firestore rules, CORS, and emulator configuration.

### Steps

1. **Verify git status**
   ```bash
   cd /Users/admin/VSCODE
   git status
   ```
   Expected: Modified files should include firestore.rules, firebase.json, functions/src/index.ts

2. **Build functions**
   ```bash
   cd /Users/admin/VSCODE/functions
   pnpm install
   pnpm run build
   ```
   Expected: No errors, build output in lib/ directory

3. **Deploy Firestore rules only**
   ```bash
   cd /Users/admin/VSCODE
   firebase deploy --only firestore:rules
   ```
   Expected: "Deploy complete!" message
   Stop condition: If errors, check firestore.rules syntax

4. **Deploy Storage rules**
   ```bash
   firebase deploy --only storage:rules
   ```
   Expected: "Deploy complete!" message

5. **Deploy Cloud Functions**
   ```bash
   firebase deploy --only functions
   ```
   Expected: All functions deployed successfully
   Stop condition: If function deployment fails, check logs with `firebase functions:log`

6. **Verify deployment**
   ```bash
   firebase functions:log --limit 10
   ```
   Expected: No errors in recent logs
   Look for: syncUserRole function logs

### Verification Checklist
- [ ] Firestore rules deployed (version incremented)
- [ ] Storage rules deployed
- [ ] All Cloud Functions active
- [ ] No errors in function logs
- [ ] CORS working (test with curl from allowed origin)

---

## Runbook 2: Deploy P1 Features

### Objective
Deploy Vertex AI image generation, scheduled SEO functions, and CSV import pipeline.

### Prerequisites
- P0 security fixes deployed
- Vertex AI API enabled in Google Cloud

### Steps

1. **Enable Vertex AI (one-time setup)**
   ```bash
   gcloud services enable aiplatform.googleapis.com --project=royalcarriagelimoseo
   gcloud projects add-iam-policy-binding royalcarriagelimoseo \
     --member=serviceAccount:royalcarriagelimoseo@appspot.gserviceaccount.com \
     --role=roles/aiplatform.user
   ```
   Expected: Services enabled message
   Stop condition: If permission denied, check GCP IAM permissions

2. **Install new dependencies**
   ```bash
   cd /Users/admin/VSCODE/functions
   pnpm install csv-parse
   ```
   Expected: Package added to node_modules

3. **Build functions**
   ```bash
   cd /Users/admin/VSCODE/functions
   pnpm run build
   ```
   Expected: No TypeScript errors
   Stop condition: Fix any type errors before proceeding

4. **Deploy functions incrementally**
   ```bash
   cd /Users/admin/VSCODE

   # Deploy scheduled functions
   firebase deploy --only functions:dailyPageAnalysis,functions:weeklySeoReport,functions:autoAnalyzeNewPage

   # Deploy API functions (includes imports)
   firebase deploy --only functions:api
   ```
   Expected: All functions deployed
   Stop condition: If timeout, increase function timeout in firebase.json

5. **Build admin dashboard**
   ```bash
   cd /Users/admin/VSCODE/apps/admin
   pnpm install
   pnpm run build
   ```
   Expected: Build output in out/ directory
   Stop condition: Fix any build errors

6. **Deploy admin dashboard**
   ```bash
   cd /Users/admin/VSCODE
   firebase deploy --only hosting:admin
   ```
   Expected: Admin site deployed to admin.royalcarriagelimo.com

7. **Test scheduled functions manually**
   ```bash
   # Trigger dailyPageAnalysis manually
   gcloud functions call dailyPageAnalysis --region=us-central1 --gen=1

   # Check logs
   firebase functions:log --only dailyPageAnalysis --limit 20
   ```
   Expected: Function executes, analyses stored in Firestore
   Stop condition: If errors, check Gemini API access

8. **Test image generation**
   ```bash
   # Get auth token
   TOKEN=$(firebase auth:export --format=json | jq -r '.users[0].idToken')

   # Call image generation API
   curl -X POST https://us-central1-royalcarriagelimoseo.cloudfunctions.net/api/ai/generate-image \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"purpose":"hero","location":"Chicago O'\''Hare Airport","vehicle":"sedan"}'
   ```
   Expected: JSON response with imageUrl
   Stop condition: If 500 error, check Vertex AI permissions

9. **Test CSV import**
   - Open https://admin.royalcarriagelimo.com/imports/moovs
   - Upload test CSV file
   - Verify import completes successfully
   - Check Firestore `trips` collection for data
   Stop condition: If import fails, check function logs

### Verification Checklist
- [ ] Vertex AI API enabled
- [ ] Service account has aiplatform.user role
- [ ] All functions deployed and active
- [ ] Admin dashboard deployed and accessible
- [ ] dailyPageAnalysis runs without errors
- [ ] Image generation returns valid URLs
- [ ] CSV import works for Moovs data
- [ ] CSV import works for Ads data

---

## Runbook 3: Deploy All Hosting Sites

### Objective
Build and deploy all 5 hosting targets (admin + 4 public sites).

### Steps

1. **Build airport site**
   ```bash
   cd /Users/admin/VSCODE/apps/airport
   pnpm install
   pnpm run build
   ```
   Expected: Build output in dist/ directory

2. **Build corporate site**
   ```bash
   cd /Users/admin/VSCODE/apps/corporate
   pnpm install
   pnpm run build
   ```
   Expected: Build output in dist/ directory

3. **Build wedding site**
   ```bash
   cd /Users/admin/VSCODE/apps/wedding
   pnpm install
   pnpm run build
   ```
   Expected: Build output in dist/ directory

4. **Build party bus site**
   ```bash
   cd /Users/admin/VSCODE/apps/partybus
   pnpm install
   pnpm run build
   ```
   Expected: Build output in dist/ directory

5. **Deploy all hosting targets**
   ```bash
   cd /Users/admin/VSCODE
   firebase deploy --only hosting
   ```
   Expected: All 5 sites deployed
   Stop condition: If any site fails, check build output

6. **Verify each site**
   ```bash
   # Test each URL
   curl -I https://admin.royalcarriagelimo.com/
   curl -I https://chicagoairportblackcar.com/
   curl -I https://chicagoexecutivecarservice.com/
   curl -I https://chicagoweddingtransportation.com/
   curl -I https://chicago-partybus.com/
   ```
   Expected: All return 200 OK
   Stop condition: If 404, check hosting target configuration

### Verification Checklist
- [ ] All 5 sites build successfully
- [ ] All 5 sites deploy without errors
- [ ] All 5 URLs return 200 OK
- [ ] No broken images on home pages
- [ ] No console errors in browser

---

## Runbook 4: Firestore Schema Setup

### Objective
Ensure all required Firestore collections and indexes exist.

### Collections Required

Execute in Firebase Console → Firestore:

1. **users** - User profiles and roles
   - Create with sample document:
     ```json
     {
       "email": "admin@example.com",
       "role": "superadmin",
       "displayName": "Admin User",
       "createdAt": "2026-01-16T00:00:00Z"
     }
     ```

2. **settings/master_spec/pages** - Page configurations
   - Subcollection under settings document

3. **page_analyses** - SEO analysis results
   - Auto-created by dailyPageAnalysis

4. **reports** - Weekly reports and alerts
   - Auto-created by weeklySeoReport

5. **ai_images** - Generated image metadata
   - Auto-created by image generation

6. **trips** - Moovs trip data
   - Auto-created by CSV import

7. **metrics** - Advertising metrics
   - Auto-created by CSV import

8. **imports** - Import audit trail
   - Auto-created by CSV import

### Index Creation

If queries fail with "requires an index" error:

```bash
cd /Users/admin/VSCODE
firebase deploy --only firestore:indexes
```

Common indexes needed:
- `page_analyses`: analyzedAt (desc), seoScore (desc)
- `reports`: createdAt (desc), type (asc)
- `imports`: uploadedAt (desc), importType (asc)

---

## Runbook 5: Rollback Procedure

### Objective
Rollback to previous deployment if critical issues discovered.

### Steps

1. **List recent deployments**
   ```bash
   firebase hosting:channel:list
   ```

2. **Rollback functions**
   ```bash
   # Redeploy previous version
   git log --oneline -10  # Find previous commit
   git checkout <commit-hash>
   cd functions && pnpm run build && cd ..
   firebase deploy --only functions
   git checkout main  # Return to main branch
   ```

3. **Rollback hosting**
   ```bash
   # Each site has version history in Firebase Console
   # Manual rollback via Console → Hosting → Release History
   ```

4. **Rollback Firestore rules**
   ```bash
   # View rule history
   firebase firestore:rules get

   # Restore from git
   git checkout <commit-hash> -- firestore.rules
   firebase deploy --only firestore:rules
   ```

### Stop Conditions
- DO NOT rollback if user data has been modified
- DO NOT rollback Firestore rules if new data structure in use
- Coordinate with users before rolling back admin dashboard

---

## Runbook 6: Monitor and Debug

### Objective
Monitor system health and debug issues.

### Commands

1. **View function logs**
   ```bash
   # All functions
   firebase functions:log --limit 50

   # Specific function
   firebase functions:log --only dailyPageAnalysis --limit 20

   # Follow in real-time
   firebase functions:log --follow
   ```

2. **Check Firestore usage**
   ```bash
   # Via Firebase Console
   # Navigate to: Firestore → Usage tab
   # Check: Reads, Writes, Deletes per day
   ```

3. **Test scheduled functions**
   ```bash
   # Manually trigger
   gcloud functions call dailyPageAnalysis --region=us-central1 --gen=1
   gcloud functions call weeklySeoReport --region=us-central1 --gen=1
   ```

4. **Check function status**
   ```bash
   gcloud functions list --region=us-central1 --project=royalcarriagelimoseo
   ```

5. **View hosting analytics**
   ```bash
   # Via Firebase Console
   # Navigate to: Hosting → Each site → Usage
   # Check: Requests, Bandwidth
   ```

### Common Issues and Solutions

**Issue:** Function timeout
- Solution: Increase timeout in firebase.json (max 540s for gen 1)

**Issue:** Firestore permission denied
- Solution: Check firestore.rules, verify custom claims set

**Issue:** CORS error in admin dashboard
- Solution: Verify origin in CORS whitelist in functions/src/index.ts

**Issue:** Image generation fails
- Solution: Check Vertex AI API enabled, service account permissions

**Issue:** CSV import validation errors
- Solution: Check CSV format, column names, data types

---

## Emergency Contacts

- Firebase Console: https://console.firebase.google.com/project/royalcarriagelimoseo
- GCP Console: https://console.cloud.google.com/home/dashboard?project=royalcarriagelimoseo
- Admin Dashboard: https://admin.royalcarriagelimo.com/

## Success Metrics

Monitor these metrics post-deployment:

1. **Function Execution Success Rate:** >99%
2. **Average Function Duration:** <5s
3. **Firestore Read Operations:** <100k/day (optimized with custom claims)
4. **Image Generation Success Rate:** >95%
5. **CSV Import Success Rate:** >99%
6. **SEO Score Average:** >70
7. **Zero security incidents:** CORS violations, unauthorized access

---

## Post-Deployment Checklist

After any deployment:

- [ ] All functions executing without errors
- [ ] Function logs show expected activity
- [ ] All hosting sites return 200 OK
- [ ] Admin dashboard loads and is functional
- [ ] No broken images on any site
- [ ] CSV import tested and working
- [ ] Scheduled functions will run at next scheduled time
- [ ] Firestore usage within expected limits
- [ ] No security alerts in GCP Console
- [ ] Team notified of deployment completion
