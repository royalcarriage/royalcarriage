# Firebase Deployment Runbook

**Repository:** royalcarriage/royalcarriage  
**Last Updated:** January 14, 2026  
**Version:** 1.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Manual Deployment](#manual-deployment)
3. [CI/CD Deployment](#cicd-deployment)
4. [Rollback Procedures](#rollback-procedures)
5. [Troubleshooting](#troubleshooting)
6. [Emergency Procedures](#emergency-procedures)
7. [Post-Deployment Validation](#post-deployment-validation)

---

## Prerequisites

### Required Tools

- **Node.js**: v20.x LTS
- **npm**: v10.x or higher
- **Firebase CLI**: Latest version
- **Git**: Latest version

### Installation

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### Required Access

- Firebase project access (Editor or Owner role)
- GitHub repository access (for CI/CD)
- Firebase service account credentials

---

## Manual Deployment

Use manual deployment for:
- Emergency hotfixes
- Testing new Firebase configurations
- When CI/CD is unavailable

### Step 1: Authenticate with Firebase

```bash
# Login to Firebase
firebase login

# Verify authentication
firebase projects:list
```

### Step 2: Select Project

```bash
# List available projects
firebase use --add

# Or use default project from .firebaserc
firebase use default
```

### Step 3: Build the Application

```bash
# Navigate to repository root
cd /path/to/royalcarriage

# Install dependencies (if not already installed)
npm ci

# Run TypeScript type checking
npm run check

# Build for production
npm run build
```

**Expected Output:**
```
building client...
✓ 1702 modules transformed.
✓ built in 4s

building server...
✓ Done in 85ms
```

### Step 4: Verify Build Output

```bash
# Check build artifacts exist
ls -la dist/public/index.html
ls -la dist/index.cjs
ls -la dist/public/assets/

# Optional: Test locally
npm start
```

### Step 5: Deploy to Firebase

```bash
# Deploy to production (live channel)
firebase deploy --only hosting

# Or deploy to preview channel for testing
firebase hosting:channel:deploy preview-test
```

**Expected Output:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/YOUR_PROJECT_ID/overview
Hosting URL: https://YOUR_PROJECT_ID.web.app
```

### Step 6: Verify Deployment

1. Visit production URL
2. Check all major pages load
3. Verify assets load correctly
4. Check browser console for errors
5. Test on mobile devices

---

## CI/CD Deployment

Automated deployments via GitHub Actions.

### Production Deployment

**Trigger:** Push to `main` branch

**Process:**
1. Developer merges PR to `main` branch
2. GitHub Actions workflow triggers automatically
3. Build job runs (TypeScript check, build, smoke tests)
4. Deploy job runs (deploys to Firebase Hosting)
5. Deployment summary posted to GitHub Actions

**Monitoring:**
- Check GitHub Actions: https://github.com/royalcarriage/royalcarriage/actions
- View workflow run status
- Review build logs if errors occur

### Preview Deployment

**Trigger:** Pull request to `main` branch

**Process:**
1. Developer opens PR
2. GitHub Actions workflow triggers
3. Build job runs
4. Preview deploy job runs
5. Preview URL posted as PR comment

**Benefits:**
- Test changes before merging
- Share preview with stakeholders
- Validate functionality in production-like environment

---

## Rollback Procedures

### Method 1: Firebase Console (Fastest)

**Use for:** Quick rollback of bad deployment

1. Open Firebase Console: https://console.firebase.google.com
2. Navigate to Hosting section
3. Click "Release history"
4. Find previous working version
5. Click "Rollback" button
6. Confirm rollback

**Time to rollback:** ~30 seconds

### Method 2: Deploy Previous Version

**Use for:** Specific version rollback

```bash
# View deployment history
firebase hosting:releases

# Note the version ID of desired release
# Format: sites/YOUR_SITE_ID/versions/VERSION_ID

# Rollback to specific version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION SITE_ID
```

### Method 3: Git Revert and Redeploy

**Use for:** Permanent revert of changes

```bash
# Find commit to revert
git log --oneline

# Revert the commit
git revert <commit-sha>

# Push to main (triggers CI/CD)
git push origin main
```

**Time to rollback:** ~5-10 minutes (includes build time)

### Rollback Checklist

- [ ] Identify issue causing rollback
- [ ] Document rollback reason
- [ ] Notify team of rollback
- [ ] Perform rollback
- [ ] Verify site is working
- [ ] Test critical functionality
- [ ] Document lessons learned
- [ ] Create issue for fix

---

## Troubleshooting

### Build Failures

#### Issue: TypeScript Errors

```bash
# Run type check
npm run check

# Fix reported errors
# Then rebuild
npm run build
```

#### Issue: Module Not Found

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### Issue: Out of Memory

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Deployment Failures

#### Issue: Authentication Failed

```bash
# Re-authenticate
firebase logout
firebase login

# Try deployment again
firebase deploy --only hosting
```

#### Issue: Permission Denied

**Cause:** Insufficient Firebase project permissions

**Solution:**
1. Contact project owner
2. Request "Editor" or "Owner" role
3. Or provide your service account key

#### Issue: Deployment Timeout

```bash
# Deploy with debug logging
firebase deploy --only hosting --debug

# Check for network issues
# Retry deployment
```

### GitHub Actions Failures

#### Issue: Missing Secrets

**Symptoms:** Workflow fails with authentication error

**Solution:**
1. Go to repository Settings → Secrets and variables → Actions
2. Verify `FIREBASE_SERVICE_ACCOUNT` exists
3. Verify secret is valid base64-encoded JSON
4. Regenerate if needed

#### Issue: Build Fails in CI

**Symptoms:** Build passes locally but fails in CI

**Possible Causes:**
- Node version mismatch
- Missing environment variables
- Platform-specific issues

**Solution:**
```bash
# Match CI environment locally
nvm use 20
npm ci
npm run build
```

---

## Emergency Procedures

### Complete Site Outage

**Immediate Actions:**

1. **Check Firebase Status**
   - Visit: https://status.firebase.google.com
   - Check for known outages

2. **Quick Rollback**
   - Use Firebase Console rollback (fastest method)
   - See [Method 1](#method-1-firebase-console-fastest)

3. **Verify Rollback**
   - Test production URL
   - Check multiple pages
   - Test on different devices

4. **Notify Stakeholders**
   - Post status update
   - Estimate time to resolution
   - Provide updates every 30 minutes

5. **Investigate Root Cause**
   - Check Firebase logs
   - Review recent changes
   - Test locally with production build

### Data Loss or Corruption

**Note:** This site uses Firebase Hosting only (no database), so data loss is not applicable. If you add Firestore or Storage in the future, implement backup/restore procedures.

### Security Breach

**Immediate Actions:**

1. **Rotate Credentials**
   ```bash
   # Generate new Firebase service account
   # Update GitHub secrets
   # Revoke old service account
   ```

2. **Review Recent Changes**
   ```bash
   git log --since="1 day ago" --oneline
   ```

3. **Deploy Security Patch**
   ```bash
   # Fix vulnerability
   git commit -m "Security fix: [description]"
   git push origin main
   ```

4. **Audit Access**
   - Review Firebase project members
   - Check deployment history
   - Review GitHub Actions logs

---

## Post-Deployment Validation

### Automated Checks

Run after every deployment:

```bash
#!/bin/bash
# post-deploy-check.sh

URL="https://chicagoairportblackcar.com"

echo "🔍 Running post-deployment checks..."

# Check homepage loads
echo "Checking homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
if [ "$STATUS" == "200" ]; then
  echo "✅ Homepage: OK"
else
  echo "❌ Homepage: Failed (Status: $STATUS)"
  exit 1
fi

# Check key pages
PAGES=("ohare-airport-limo" "midway-airport-limo" "fleet" "contact")
for PAGE in "${PAGES[@]}"; do
  echo "Checking /$PAGE..."
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/$PAGE")
  if [ "$STATUS" == "200" ]; then
    echo "✅ /$PAGE: OK"
  else
    echo "❌ /$PAGE: Failed (Status: $STATUS)"
  fi
done

# Check security headers
echo "Checking security headers..."
HEADERS=$(curl -s -I "$URL")

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
  echo "✅ X-Frame-Options header present"
else
  echo "⚠️  X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
  echo "✅ X-Content-Type-Options header present"
else
  echo "⚠️  X-Content-Type-Options header missing"
fi

echo "✅ Post-deployment checks complete"
```

### Manual Validation Checklist

- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Images display properly
- [ ] Forms submit successfully
- [ ] Mobile responsive design works
- [ ] No console errors in browser
- [ ] Security headers present
- [ ] HTTPS working
- [ ] Page load time < 3 seconds
- [ ] All routes work (SPA routing)

### Performance Validation

```bash
# Run Lighthouse audit (requires Lighthouse CLI)
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=https://chicagoairportblackcar.com

# Check scores:
# - Performance: > 90
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 90
```

---

## Deployment Schedule

### Recommended Times

**Best:** Tuesday-Thursday, 10 AM - 2 PM EST
- Allows time to monitor and fix issues
- Team available for support
- Lower traffic periods

**Avoid:** 
- Fridays after 2 PM (limited weekend support)
- Monday mornings (high traffic)
- Late nights/weekends (limited team availability)

### Deployment Windows

| Window | Type | Approval Required |
|--------|------|-------------------|
| Business Hours | Standard | Team Lead |
| After Hours | Emergency Only | On-call Engineer |
| Weekends | Critical Issues Only | Engineering Manager |

---

## Monitoring and Alerts

### Firebase Console

**Check regularly:**
- Hosting usage and quota
- Deployment history
- Request counts
- Error rates

**URL:** https://console.firebase.google.com

### GitHub Actions

**Monitor:**
- Workflow run status
- Build times
- Test results
- Deployment success rate

**URL:** https://github.com/royalcarriage/royalcarriage/actions

### Recommended Alerts

Set up alerts for:
- Deployment failures (email/Slack)
- High error rates (Firebase)
- Quota approaching limit (Firebase)
- Security vulnerabilities (Dependabot)

---

## Contacts

### Escalation Path

1. **Level 1:** Development Team
2. **Level 2:** Team Lead
3. **Level 3:** Engineering Manager
4. **Level 4:** Firebase Support

### Support Resources

- **Firebase Support:** https://firebase.google.com/support
- **GitHub Support:** https://support.github.com
- **Internal Documentation:** /docs directory
- **Team Slack:** #dev-royalcarriage (if applicable)

---

## Changelog

### Version 1.0 - January 14, 2026
- Initial deployment runbook
- Manual and CI/CD procedures documented
- Rollback procedures added
- Troubleshooting guide created
- Emergency procedures defined

---

## Next Review

**Date:** April 14, 2026 (Quarterly)

**Review Items:**
- Update procedures based on lessons learned
- Add new troubleshooting scenarios
- Update contact information
- Review and update emergency procedures

---

**Document Maintained By:** Development Team  
**Last Tested:** January 14, 2026  
**Status:** Active
