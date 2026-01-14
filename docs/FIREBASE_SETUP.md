# Firebase Setup Guide

**Project:** Chicago Airport Black Car Service  
**Firebase Project ID:** `royalcarriagelimoseo`  
**Last Updated:** January 14, 2026

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Firebase Project Setup](#firebase-project-setup)
4. [Local Development Setup](#local-development-setup)
5. [GitHub Secrets Configuration](#github-secrets-configuration)
6. [Deployment Process](#deployment-process)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)
9. [Performance Monitoring](#performance-monitoring)

---

## Overview

This project uses Firebase Hosting to deploy the static build of our single-page application. Firebase Hosting provides:

- **Global CDN**: Fast content delivery worldwide
- **SSL certificates**: Automatic HTTPS
- **Custom domains**: Support for custom domain mapping
- **Preview channels**: Deploy previews for pull requests
- **Rollback capability**: Easy version rollback

### Current Configuration

- **Project ID**: `royalcarriagelimoseo`
- **Hosting Directory**: `dist/public`
- **Build Command**: `npm run build`
- **Deploy Target**: Firebase Hosting

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 20.x LTS** or higher installed
2. **npm 10.x** or higher
3. **Git** installed and configured
4. **Firebase account** with access to the project
5. **Firebase CLI** installed globally

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:

```bash
firebase --version
```

---

## Firebase Project Setup

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Locate the project: **royalcarriagelimoseo**

If the project doesn't exist, create it:

1. Click "Add project"
2. Enter project name: `Royal Carriage Limo SEO`
3. Project ID: `royalcarriagelimoseo`
4. Disable Google Analytics (optional for static hosting)
5. Click "Create project"

### Step 2: Enable Firebase Hosting

1. In Firebase Console, navigate to **Build → Hosting**
2. Click "Get started" if not already enabled
3. Follow the setup wizard (we'll configure via CLI later)

### Step 3: Verify Project Configuration

Ensure `.firebaserc` in the repository root contains:

```json
{
  "projects": {
    "default": "royalcarriagelimoseo",
    "production": "royalcarriagelimoseo"
  },
  "targets": {},
  "etags": {}
}
```

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/royalcarriage/royalcarriage.git
cd royalcarriage
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase configuration:

```env
NODE_ENV=development
PORT=5000
FIREBASE_PROJECT_ID=royalcarriagelimoseo
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=royalcarriagelimoseo.firebaseapp.com
FIREBASE_STORAGE_BUCKET=royalcarriagelimoseo.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

To get these values:
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. Click "Web app" or add a new web app
4. Copy the config values

### Step 4: Login to Firebase

```bash
firebase login
```

This will open a browser for authentication. Ensure you login with an account that has access to the `royalcarriagelimoseo` project.

### Step 5: Verify Firebase Project

```bash
firebase projects:list
```

Ensure `royalcarriagelimoseo` appears in the list.

Set the project as current:

```bash
firebase use royalcarriagelimoseo
```

### Step 6: Test Local Build

Build the project:

```bash
npm run build
```

Verify build output:

```bash
ls -la dist/public/
```

You should see:
- `index.html`
- `assets/` directory with JS, CSS, and images

### Step 7: Test Locally with Firebase Emulator

```bash
firebase serve --only hosting
```

Visit `http://localhost:5000` to preview the site locally.

---

## GitHub Secrets Configuration

For automated CI/CD deployment, configure these secrets in your GitHub repository.

### Step 1: Access GitHub Repository Settings

1. Go to your GitHub repository: `https://github.com/royalcarriage/royalcarriage`
2. Click **Settings** → **Secrets and variables** → **Actions**

### Step 2: Generate Firebase Service Account

**Option A: Service Account (Recommended for CI/CD)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `royalcarriagelimoseo`
3. Click **Project settings** (gear icon)
4. Navigate to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file (e.g., `royalcarriagelimoseo-firebase-adminsdk.json`)

**⚠️ IMPORTANT:** This file contains sensitive credentials. Never commit it to git!

7. Base64 encode the service account JSON:

```bash
# On Linux/Mac
base64 -w 0 < royalcarriagelimoseo-firebase-adminsdk.json

# On Mac (alternative)
base64 -i royalcarriagelimoseo-firebase-adminsdk.json | tr -d '\n'

# On Windows (PowerShell)
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("royalcarriagelimoseo-firebase-adminsdk.json"))
```

8. Copy the base64-encoded output

**Option B: CI Token (Alternative)**

```bash
firebase login:ci
```

This will generate a token. Copy it for the next step.

### Step 3: Add GitHub Secrets

Add the following secrets to your GitHub repository:

#### Required Secrets

1. **`FIREBASE_SERVICE_ACCOUNT`** (if using Option A)
   - Value: Base64-encoded service account JSON from Step 2
   - Used for: Firebase deployment authentication

2. **`FIREBASE_TOKEN`** (if using Option B)
   - Value: Token from `firebase login:ci`
   - Used for: Firebase deployment authentication

3. **`FIREBASE_PROJECT_ID`** (optional but recommended)
   - Value: `royalcarriagelimoseo`
   - Used for: Specifying the Firebase project explicitly

#### How to Add Secrets

1. In GitHub repository settings, go to **Secrets and variables → Actions**
2. Click **New repository secret**
3. Enter secret name (e.g., `FIREBASE_SERVICE_ACCOUNT`)
4. Paste the value
5. Click **Add secret**
6. Repeat for each secret

### Step 4: Verify Secret Configuration

After adding secrets, check that the GitHub Actions workflow file (`.github/workflows/firebase-deploy.yml`) references them correctly:

```yaml
firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
projectId: ${{ secrets.FIREBASE_PROJECT_ID || 'royalcarriagelimoseo' }}
```

---

## Deployment Process

### Automated Deployment (GitHub Actions)

The project uses GitHub Actions for automated deployments.

#### Production Deployment

**Trigger:** Push to `main` branch

```bash
git checkout main
git pull origin main
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

**What happens:**
1. GitHub Actions workflow triggers
2. Code is checked out
3. Dependencies are installed
4. Application is built
5. Smoke tests run
6. Build artifacts are deployed to Firebase Hosting (production)
7. Site is live at the production URL

#### Preview Deployment

**Trigger:** Opening or updating a pull request

```bash
git checkout -b feature/my-feature
# Make your changes
git add .
git commit -m "Add new feature"
git push origin feature/my-feature
# Open a pull request on GitHub
```

**What happens:**
1. GitHub Actions workflow triggers
2. Application is built
3. Build is deployed to a Firebase preview channel
4. A comment is added to the PR with the preview URL
5. Preview expires in 7 days

### Manual Deployment

#### Deploy to Production

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or use the deployment script
bash script/firebase-deploy.sh
```

#### Deploy to Preview Channel

```bash
# Build the project
npm run build

# Deploy to a preview channel
firebase hosting:channel:deploy preview-feature-name
```

#### Deployment Script

Use the provided deployment script for additional safety checks:

```bash
bash script/firebase-deploy.sh
```

This script:
- Verifies build exists
- Runs pre-deployment checks
- Deploys with error handling
- Verifies deployment success
- Provides rollback instructions if needed

---

## Environment Variables

### Client-Side Variables (Vite)

Variables exposed to the client must be prefixed with `VITE_`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=royalcarriagelimoseo
```

Access in code:

```typescript
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

⚠️ **Never put sensitive data in VITE_ variables** - they are exposed to the browser!

### Server-Side Variables

Server-side variables don't need a prefix:

```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
```

Access in server code:

```typescript
const dbUrl = process.env.DATABASE_URL;
```

### Build-Time vs Runtime

**Build-time variables:** Baked into the client bundle at build time
**Runtime variables:** Available only on the server at runtime

Firebase Hosting serves static files only, so all configuration must be build-time or fetched dynamically from an API.

---

## Troubleshooting

### Common Issues

#### Issue: "Project not found" error

**Cause:** Firebase CLI not authenticated or wrong project selected

**Solution:**
```bash
firebase logout
firebase login
firebase use royalcarriagelimoseo
firebase projects:list  # Verify project exists
```

#### Issue: "Permission denied" during deployment

**Cause:** Insufficient permissions for the authenticated account

**Solution:**
1. Go to Firebase Console → Project Settings → Users and permissions
2. Ensure your account has "Editor" or "Owner" role
3. Re-authenticate: `firebase logout && firebase login`

#### Issue: GitHub Actions deployment fails

**Cause:** Missing or incorrect GitHub secrets

**Solution:**
1. Verify `FIREBASE_SERVICE_ACCOUNT` secret exists and is valid
2. Check workflow logs for specific error messages
3. Regenerate service account key if needed
4. Ensure secret is base64-encoded correctly

#### Issue: 404 errors after deployment

**Cause:** Incorrect rewrites configuration or missing files

**Solution:**
1. Verify `firebase.json` has correct rewrites:
   ```json
   "rewrites": [
     {
       "source": "**",
       "destination": "/index.html"
     }
   ]
   ```
2. Ensure `dist/public/index.html` exists after build
3. Clear Firebase Hosting cache:
   ```bash
   firebase hosting:channel:delete CHANNEL_ID
   firebase deploy --only hosting
   ```

#### Issue: Build artifacts not found

**Cause:** Build failed or wrong directory specified

**Solution:**
1. Run build locally and verify output:
   ```bash
   npm run build
   ls -la dist/public/
   ```
2. Check `firebase.json` specifies correct public directory:
   ```json
   "public": "dist/public"
   ```

#### Issue: Preview deployment not working

**Cause:** GitHub Actions workflow not properly configured

**Solution:**
1. Ensure workflow has `pull_request` trigger
2. Verify `GITHUB_TOKEN` has correct permissions
3. Check workflow logs for specific errors

### Deployment Verification

After deployment, verify the site:

```bash
# Get the deployed URL
firebase hosting:sites:list

# Open in browser
firebase open hosting:site
```

Test these aspects:
- ✅ Homepage loads
- ✅ Navigation works (all routes)
- ✅ Images and assets load
- ✅ No console errors
- ✅ Mobile responsive design
- ✅ SEO meta tags present

### Rollback

If a deployment has issues, rollback to a previous version:

1. Go to Firebase Console → Hosting → Release history
2. Find the last working version
3. Click **⋮** (three dots) → **Rollback**

Or via CLI:

```bash
# List releases
firebase hosting:releases

# Rollback is done via Firebase Console
```

### Check Deployment History

```bash
# View release history
firebase hosting:releases

# View current live version
firebase hosting:channel:open live
```

---

## Performance Monitoring

### Firebase Performance Monitoring Setup

To monitor site performance in production:

1. **Enable Performance Monitoring:**
   - Go to Firebase Console → Performance
   - Click "Get started"

2. **Install Performance Monitoring SDK:**
   ```bash
   npm install firebase
   ```

3. **Initialize in your app:**
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getPerformance } from 'firebase/performance';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     projectId: "royalcarriagelimoseo",
     // ... other config
   };

   const app = initializeApp(firebaseConfig);
   const perf = getPerformance(app);
   ```

4. **View metrics:**
   - Go to Firebase Console → Performance
   - Monitor page load times, network requests, and custom traces

### Custom Performance Traces

Add custom traces to measure specific operations:

```typescript
import { trace } from 'firebase/performance';

const myTrace = trace(perf, 'custom_operation');
myTrace.start();
// ... your code
myTrace.stop();
```

### Performance Best Practices

- ✅ Leverage browser caching (configured in `firebase.json`)
- ✅ Compress images and assets
- ✅ Minimize JavaScript bundle size
- ✅ Use lazy loading for routes
- ✅ Enable HTTP/2 push for critical assets

---

## Advanced Topics

### Custom Domain Setup

1. **Add custom domain:**
   ```bash
   firebase hosting:sites:create your-domain-com
   ```

2. **Configure DNS:**
   - Go to Firebase Console → Hosting → Add custom domain
   - Follow instructions to add DNS records
   - Wait for SSL certificate provisioning (up to 24 hours)

3. **Verify domain:**
   ```bash
   firebase hosting:sites:list
   ```

### Multiple Sites

If you need to host multiple sites from one Firebase project:

```bash
# Add a new site
firebase hosting:sites:create secondary-site

# Deploy to specific site
firebase target:apply hosting primary royalcarriagelimoseo
firebase target:apply hosting secondary secondary-site
```

Update `firebase.json`:

```json
{
  "hosting": [
    {
      "target": "primary",
      "public": "dist/public",
      ...
    },
    {
      "target": "secondary",
      "public": "dist/secondary",
      ...
    }
  ]
}
```

### Deployment Hooks

Create custom deployment hooks in `firebase.json`:

```json
{
  "hosting": {
    "public": "dist/public",
    "predeploy": [
      "npm run build",
      "npm run test"
    ],
    "postdeploy": [
      "curl https://example.com/webhook?deployed=true"
    ]
  }
}
```

---

## Security Considerations

See [FIREBASE_SECURITY.md](./FIREBASE_SECURITY.md) for detailed security best practices.

### Quick Security Checklist

- ✅ Never commit `.env` or service account keys
- ✅ Use environment variables for sensitive data
- ✅ Rotate service account keys regularly
- ✅ Enable security headers (configured in `firebase.json`)
- ✅ Review Firebase project permissions
- ✅ Use preview channels for testing before production
- ✅ Monitor Firebase Console for suspicious activity

---

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)
- [GitHub Actions for Firebase](https://github.com/FirebaseExtended/action-hosting-deploy)
- [SPA Routing with Firebase](https://firebase.google.com/docs/hosting/full-config#rewrites)

---

## Support

For issues or questions:

- **Documentation:** Check [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **GitHub Issues:** [royalcarriage/royalcarriage/issues](https://github.com/royalcarriage/royalcarriage/issues)
- **Firebase Support:** [Firebase Support](https://firebase.google.com/support)

---

**Last Updated:** January 14, 2026  
**Maintained By:** Development Team
