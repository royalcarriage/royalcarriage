# CI/CD Workflow Documentation

## Overview

This repository uses GitHub Actions for continuous integration and deployment to Firebase Hosting. The workflow is designed to ensure code quality, security, and reliable deployments.

## Workflow File

**Location:** `.github/workflows/firebase-deploy.yml`

## Workflow Architecture

The workflow consists of four main jobs that run in sequence:

```
┌─────────────┐
│   Audit     │  ← Security checks
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Build    │  ← Build & Test
└──────┬──────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐   ┌─────────────┐
│  Deploy     │   │  Deploy     │
│ Production  │   │  Preview    │
└─────────────┘   └─────────────┘
```

## Job Details

### 1. Security Audit Job

**Purpose:** Detect security vulnerabilities in dependencies before building and deploying.

**Steps:**

- Checkout code
- Setup Node.js 20.x
- Install dependencies (`npm ci`)
- Run npm audit (moderate level)
- Check for high severity vulnerabilities

**Key Features:**

- Runs before any build or deployment
- Checks for vulnerabilities at moderate and high severity levels
- Warns about high severity issues without failing the workflow
- Uses `continue-on-error: true` to allow workflow to proceed with warnings

**When it runs:**

- On every push to `main` branch
- On every pull request to `main` branch

### 2. Build Job

**Purpose:** Build the application and run quality checks.

**Dependencies:** Requires `audit` job to complete first.

**Steps:**

1. **Checkout code** - Get latest code from repository
2. **Setup Node.js** - Install Node.js 20.x with npm caching
3. **Install dependencies** - Run `npm ci` for consistent installs
4. **TypeScript check** - Run `npm run check` to verify types
5. **Build application** - Run `npm run build` to create production bundle
6. **Run smoke tests** - Run `npm test` to verify build output
7. **Upload artifacts** - Save build output for deployment jobs

**Build Output:**

- Client bundle: `dist/public/` (HTML, CSS, JS, assets)
- Server bundle: `dist/index.cjs` (Express server)

**Artifacts:**

- Name: `build-output`
- Contents: Complete `dist/` directory
- Retention: 7 days

**When it runs:**

- After audit job completes successfully
- On every push to `main` branch
- On every pull request to `main` branch

### 3. Deploy to Production Job

**Purpose:** Deploy to Firebase Hosting production environment.

**Dependencies:** Requires `build` job to complete first.

**Conditions:**

- Only runs on push to `main` branch
- Does NOT run on pull requests

**Steps:**

1. **Checkout code** - Get repository configuration files
2. **Download artifacts** - Get build output from build job
3. **Deploy to Firebase** - Deploy to production using Firebase Hosting

**Firebase Configuration:**

- Uses Firebase Action: `FirebaseExtended/action-hosting-deploy@v0`
- Deploys to: Production (live channel)
- Authentication: `FIREBASE_SERVICE_ACCOUNT` secret
- Project ID: From `FIREBASE_PROJECT_ID` secret or default

**When it runs:**

- Only when code is pushed to `main` branch
- After successful build

### 4. Deploy Preview Job

**Purpose:** Create preview deployments for pull requests.

**Dependencies:** Requires `build` job to complete first.

**Conditions:**

- Only runs on pull requests to `main` branch
- Does NOT run on direct pushes to `main`

**Steps:**

1. **Checkout code** - Get repository configuration files
2. **Download artifacts** - Get build output from build job
3. **Deploy to preview** - Create preview channel in Firebase
4. **Comment on PR** - Post preview URL to pull request

**Firebase Configuration:**

- Uses Firebase Action: `FirebaseExtended/action-hosting-deploy@v0`
- Deploys to: Preview channel (temporary)
- Authentication: `FIREBASE_SERVICE_ACCOUNT` secret
- Expiration: 7 days

**Preview Features:**

- Unique URL for each PR
- Automatic comment on PR with preview link
- Isolated from production
- Automatically expires after 7 days

**When it runs:**

- On every pull request to `main` branch
- After successful build

## Required GitHub Secrets

Configure these in: **Repository Settings → Secrets and variables → Actions**

### 1. FIREBASE_SERVICE_ACCOUNT (Required)

**Purpose:** Authenticate with Firebase for deployments

**How to obtain:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Base64 encode it:

   ```bash
   # Linux/WSL
   base64 -w 0 < service-account-key.json

   # macOS
   base64 -i service-account-key.json
   ```

7. Add the base64-encoded string as the secret value

### 2. FIREBASE_PROJECT_ID (Optional)

**Purpose:** Specify Firebase project ID

**Value:** Your Firebase project ID (e.g., `my-project-12345`)

**Note:** If not provided, uses "default" from `.firebaserc`

## Workflow Triggers

### Push to Main Branch

**Triggers:**

- Security Audit job
- Build job
- Deploy to Production job

**Result:**

- Code is automatically deployed to production
- No preview deployment

### Pull Request to Main Branch

**Triggers:**

- Security Audit job
- Build job
- Deploy Preview job

**Result:**

- Preview deployment created
- PR comment with preview URL
- No production deployment

## Build Process Details

### 1. TypeScript Compilation

```bash
npm run check
```

- Runs TypeScript compiler in check mode
- Verifies all types are correct
- Does not emit files
- Fails workflow if type errors exist

### 2. Production Build

```bash
npm run build
```

**Process:**

1. Clean `dist/` directory
2. Build client with Vite
   - Bundles React application
   - Minifies and optimizes
   - Generates source maps
   - Output: `dist/public/`
3. Build server with esbuild
   - Bundles Express server
   - Includes all dependencies
   - Output: `dist/index.cjs`

**Build Outputs:**

- `dist/public/index.html` - Main HTML file
- `dist/public/assets/*.js` - JavaScript bundles
- `dist/public/assets/*.css` - Stylesheet bundles
- `dist/public/assets/*.{png,jpg,svg}` - Image assets
- `dist/public/favicon.png` - Favicon
- `dist/index.cjs` - Server bundle

### 3. Smoke Tests

```bash
npm test
```

**Tests verify:**

- `dist/public/index.html` exists
- `dist/index.cjs` server bundle exists
- `dist/public/assets/` directory exists
- CSS files are present
- JavaScript files are present
- `index.html` contains root div
- File sizes are reasonable

## Security Features

### 1. Dependency Audit

- Runs `npm audit` before every build
- Checks for vulnerabilities in dependencies
- Alerts on moderate and high severity issues
- Continues workflow even with vulnerabilities (with warnings)

### 2. Type Safety

- TypeScript strict mode enabled
- Full type checking in CI
- Catches type errors before deployment

### 3. Build Verification

- Smoke tests verify build integrity
- Ensures all expected files are present
- Validates file structure

### 4. Isolated Previews

- PR previews are isolated from production
- Each preview has unique URL
- Previews automatically expire

## Deployment Targets

### Production Deployment

**URL:** Configured in Firebase Hosting settings

**When:** Automatic on merge to `main`

**Process:**

1. Build passes all checks
2. Artifacts uploaded to Firebase
3. Deployed to live channel
4. Available immediately at production URL

**Rollback:**

- Use Firebase Console → Hosting → Release History
- Or deploy previous commit from `main`

### Preview Deployment

**URL:** `https://PROJECT_ID--preview-RANDOM.web.app`

**When:** Automatic on pull request

**Process:**

1. Build passes all checks
2. Artifacts uploaded to Firebase
3. Deployed to preview channel
4. URL posted as PR comment

**Expiration:** 7 days after creation

## Monitoring and Debugging

### View Workflow Runs

1. Go to repository on GitHub
2. Click "Actions" tab
3. Select "Build and Deploy to Firebase" workflow
4. Click on specific run to see details

### Check Job Logs

1. Click on a workflow run
2. Click on job name (Audit, Build, Deploy Production, or Deploy Preview)
3. Expand step to see detailed logs

### Common Issues

#### Build Fails on npm ci

**Symptom:** `npm ci` fails with lock file error

**Solution:**

- Ensure `package-lock.json` is committed
- Run `npm install` locally and commit lock file

#### TypeScript Check Fails

**Symptom:** `npm run check` fails

**Solution:**

- Run `npm run check` locally
- Fix reported type errors
- Commit fixes

#### Deployment Fails

**Symptom:** Firebase deployment step fails

**Solution:**

- Verify `FIREBASE_SERVICE_ACCOUNT` secret is set
- Check secret is valid and not expired
- Verify `.firebaserc` has correct project ID
- Check Firebase project permissions

#### Preview Comment Not Posted

**Symptom:** Preview deploys but no PR comment

**Solution:**

- Check GitHub Actions permissions
- Verify workflow has write access to pull requests
- Check `GITHUB_TOKEN` has correct scopes

## Best Practices

### Before Merging PR

1. ✅ Wait for all checks to pass
2. ✅ Review preview deployment
3. ✅ Test functionality on preview URL
4. ✅ Check for security audit warnings
5. ✅ Verify build size is reasonable

### After Merging to Main

1. ✅ Monitor workflow completion
2. ✅ Verify production deployment succeeds
3. ✅ Test production URL
4. ✅ Check for any errors in logs

### Regular Maintenance

1. 🔄 Review security audit warnings weekly
2. 🔄 Update dependencies monthly
3. 🔄 Monitor build times and sizes
4. 🔄 Review Firebase usage and quotas

## Performance Considerations

### Build Time

**Current:** ~2-3 minutes per build

**Breakdown:**

- Security audit: ~30 seconds
- Build: ~1-2 minutes
- Deploy: ~30 seconds

### Optimization Tips

1. **Dependencies:** Keep dependencies minimal
2. **Caching:** npm cache is enabled for faster installs
3. **Artifacts:** Only essential files in dist/
4. **Concurrent:** Audit runs separately from build

### Build Size

**Current:**

- JavaScript bundle: ~541 KB (minified, ~131 KB gzipped)
- CSS bundle: ~7 KB (minified, ~1.2 KB gzipped)
- Total assets: ~5.3 MB (includes images)

**Optimization Notes:**

- Consider code splitting for JS bundle > 500 KB
- Images are already optimized
- Consider lazy loading for large images

## Extending the Workflow

### Add E2E Tests

Add after smoke tests:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
```

### Add Lighthouse CI

Add after build:

```yaml
- name: Run Lighthouse
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      https://preview-url.web.app
```

### Add Slack Notifications

Add to end of jobs:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Action Documentation](https://github.com/marketplace/actions/deploy-to-firebase-hosting)
- [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

**Document Version:** 1.0  
**Last Updated:** January 14, 2026  
**Maintained By:** Development Team
