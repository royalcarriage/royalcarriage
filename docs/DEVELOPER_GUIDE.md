# Developer Guide - Chicago Airport Black Car Website

**Repository:** royalcarriage/royalcarriage  
**Last Updated:** January 12, 2026

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Development Setup](#local-development-setup)
3. [Project Structure](#project-structure)
4. [Build Commands](#build-commands)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Environment Variables](#environment-variables)
9. [Firebase Configuration](#firebase-configuration)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

This is a **full-stack TypeScript web application** with:

- **Frontend:** React 18 SPA built with Vite
- **Backend:** Express.js server with API routes
- **Database:** PostgreSQL with Drizzle ORM
- **Styling:** Tailwind CSS + Radix UI components
- **Routing:** Wouter (client-side) + Express (server-side)
- **State Management:** TanStack React Query
- **Build Tool:** Vite 7 (frontend) + esbuild (backend)

### Website Projects

**Primary Website:** Chicago Airport Black Car Service
- Single Page Application with multiple routes
- Professional black car/limousine service website
- Target markets: O'Hare Airport, Midway Airport, Chicago suburbs

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20.x LTS |
| Package Manager | npm | 10.x |
| Frontend Framework | React | 18.3.1 |
| Backend Framework | Express | 4.21.2 |
| Build Tool | Vite | 7.3.1 |
| Language | TypeScript | 5.6.3 |
| CSS Framework | Tailwind CSS | 3.4.17 |
| UI Components | Radix UI | Latest |
| Database ORM | Drizzle | 0.39.3 |
| Database | PostgreSQL | Latest |

---

## Local Development Setup

### Prerequisites

- **Node.js**: 20.x LTS (recommended)
- **npm**: 10.x (comes with Node.js)
- **Git**: Latest version
- **PostgreSQL**: If running database locally (optional)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/royalcarriage/royalcarriage.git
   cd royalcarriage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Setup database** (if needed)
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   This will start:
   - Express server on `http://localhost:5000` (or configured port)
   - Vite dev server with HMR
   - Both client and server with hot reload

### Development Workflow

1. Make changes to files in `client/src/` or `server/`
2. Vite/tsx will automatically reload changes
3. View changes in browser (hot module replacement enabled)
4. Check console for any TypeScript errors

---

## Project Structure

```
royalcarriage/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   └── ui/          # Radix UI components
│   │   ├── pages/           # Page components (routes)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── data/            # Static data
│   │   ├── App.tsx          # Main app component with routing
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── public/              # Static assets
│   │   └── assets/         # Images, icons, etc.
│   └── index.html          # HTML template
│
├── server/                   # Backend Express application
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   ├── vite.ts              # Vite dev middleware
│   ├── static.ts            # Static file serving
│   └── storage.ts           # Storage utilities
│
├── shared/                   # Shared code (types, utils)
│
├── script/                   # Build scripts
│   └── build.ts             # Production build script
│
├── docs/                     # Documentation
│   ├── DEVELOPER_GUIDE.md   # This file
│   └── REPO_AUDIT.md        # Repository audit
│
├── dist/                     # Build output (gitignored)
│   ├── public/              # Client build for hosting
│   └── index.cjs            # Server build
│
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
│
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS config (if separate)
├── package.json             # Dependencies and scripts
├── firebase.json            # Firebase Hosting config
├── .firebaserc              # Firebase project config
└── .gitignore              # Git ignore rules
```

### Key Files

- **vite.config.ts**: Vite build configuration with path aliases and plugins
- **tsconfig.json**: TypeScript compiler options
- **package.json**: All npm scripts and dependencies
- **firebase.json**: Firebase Hosting configuration pointing to `dist/public`
- **.firebaserc**: Firebase project ID configuration

---

## Build Commands

### Development

```bash
# Start development server (client + server with HMR)
npm run dev
```

### Production Build

```bash
# Build both client and server for production
npm run build
```

**Build Process:**
1. Cleans `dist/` directory
2. Builds client with Vite → `dist/public/`
3. Builds server with esbuild → `dist/index.cjs`

**Build Output:**
- `dist/public/index.html` - Main HTML file
- `dist/public/assets/` - Bundled JS, CSS, and images
- `dist/index.cjs` - Bundled Express server

### Type Checking

```bash
# Run TypeScript compiler without emitting files
npm run check
```

### Database

```bash
# Push Drizzle schema to database
npm run db:push
```

---

## Testing

### Smoke Tests

After building, verify the build output:

```bash
# Run build
npm run build

# Check that key files exist
test -f dist/public/index.html && echo "✓ index.html exists"
test -f dist/index.cjs && echo "✓ server bundle exists"
test -d dist/public/assets && echo "✓ assets directory exists"
```

### Manual Testing

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Serve the production build locally:**
   ```bash
   npm start
   ```

3. **Test routes:**
   - Visit `http://localhost:5000/`
   - Test navigation to different pages
   - Verify images and assets load
   - Check console for errors

### Future: Automated Tests

Recommended additions:
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright
- Lighthouse CI for performance

---

## Deployment

### Firebase Hosting

The site is designed to deploy to Firebase Hosting.

#### Manual Deployment

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### What Gets Deployed

- Source: `dist/public/` directory
- All static assets (HTML, CSS, JS, images)
- SPA routing handled by Firebase rewrites (configured in firebase.json)

### Deployment Rollout Plan

This section outlines the recommended steps for rolling out this website to production.

#### Pre-Deployment Checklist

**Infrastructure Setup:**
1. Create Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Hosting for the project
3. Update `.firebaserc` with actual Firebase project ID
4. Generate Firebase service account key (Project Settings → Service Accounts)
5. Add `FIREBASE_SERVICE_ACCOUNT` secret to GitHub repository
   - Go to: Settings → Secrets and variables → Actions
   - Add new repository secret
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Base64-encoded service account JSON
     - Linux/WSL: `base64 -w 0 < key.json`
     - macOS: `base64 -i key.json`

**Code Verification:**
1. All builds passing locally
2. Type checking passes (`npm run check`)
3. Smoke tests pass (`npm test`)
4. GitHub Actions workflow configured
5. Documentation complete

#### Rollout Steps

**Phase 1: Initial Deployment (Week 1)**

1. **Merge PR to Main Branch**
   ```bash
   # After PR review and approval
   git checkout main
   git pull origin main
   ```

2. **Monitor First Deployment**
   - Navigate to Actions tab in GitHub
   - Watch "Build and Deploy to Firebase" workflow
   - Verify all steps complete successfully
   - Expected duration: 3-5 minutes

3. **Verify Production Site**
   - Visit Firebase Hosting URL (shown in workflow output)
   - Test all major routes:
     - Home page (`/`)
     - O'Hare Airport (`/ohare-airport-limo`)
     - Midway Airport (`/midway-airport-limo`)
     - Downtown Chicago (`/airport-limo-downtown-chicago`)
     - Suburbs (`/airport-limo-suburbs`)
     - Fleet (`/fleet`)
     - Pricing (`/pricing`)
     - About (`/about`)
     - Contact (`/contact`)
   - Verify images load correctly
   - Test responsive design (mobile, tablet, desktop)
   - Check browser console for errors

4. **DNS and Custom Domain (Optional)**
   - In Firebase Console → Hosting → Add custom domain
   - Follow Firebase instructions to add DNS records
   - Wait for SSL certificate provisioning (can take 24-48 hours)
   - Verify site loads on custom domain

**Phase 2: Monitoring and Optimization (Week 2-3)**

1. **Setup Monitoring**
   - Enable Firebase Analytics
   - Configure Google Search Console
   - Add Google Analytics (if desired)
   - Monitor Firebase Hosting usage and bandwidth

2. **Performance Optimization**
   - Review Lighthouse scores
   - Implement code splitting if needed (monitor bundle sizes with `npm run build`)
   - Consider CDN optimizations
   - Review and optimize images

3. **SEO and Marketing**
   - Submit sitemap to Google Search Console
   - Verify structured data
   - Test social media sharing (Open Graph tags)
   - Review meta descriptions and titles

**Phase 3: Ongoing Operations (Week 4+)**

1. **Regular Maintenance**
   - Monitor GitHub Actions for failed builds
   - Review Firebase Hosting logs for errors
   - Update dependencies monthly (`npm outdated`)
   - Keep documentation updated

2. **Content Updates**
   - All content updates go through PR process
   - Preview deployments automatically created
   - Test in preview before merging
   - Monitor for build failures

#### Rollback Procedure

If issues are discovered after deployment:

**Option 1: Rollback via Firebase Console**
```bash
# List recent deployments
firebase hosting:releases

# Rollback to previous version via Firebase Console
# Navigate to: Hosting → Release history → Click "Rollback"
```

**Option 2: Revert Git Commit**
```bash
# Identify the commit to revert
git log --oneline

# Revert the problematic commit
git revert <commit-hash>

# Push to main - this triggers automatic redeployment
git push origin main
```

**Option 3: Emergency Manual Deploy**
```bash
# Checkout last known good commit
git checkout <last-good-commit>

# Build locally
npm install
npm run build

# Deploy manually
firebase deploy --only hosting
```

#### Success Criteria

The deployment is considered successful when:
- All routes are accessible and load correctly
- Images and assets load properly
- No console errors on any page
- Mobile and desktop views work correctly
- Contact forms submit successfully (if applicable)
- GitHub Actions deployments work automatically
- Preview deployments work for pull requests
- SSL certificate is active (for custom domains)
- Page load times are under 3 seconds
- Lighthouse score is 90+ for Performance

#### Support and Troubleshooting

**Common Issues:**

1. **Build Fails in CI**
   - Check GitHub Actions logs
   - Verify node_modules not committed
   - Run `npm ci` locally to reproduce
   - Check for missing environment variables

2. **Deployment Fails**
   - Verify Firebase secret is correct
   - Check Firebase project permissions
   - Ensure .firebaserc has correct project ID
   - Review Firebase quota limits

3. **Site Not Loading**
   - Check Firebase Hosting status
   - Verify DNS records (for custom domains)
   - Check browser console for errors
   - Review Firebase Hosting logs

4. **Preview Deployments Not Working**
   - Check PR has proper permissions
   - Verify GitHub token is working
   - Review workflow logs in Actions tab

For additional help, refer to:
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev/)

---

## CI/CD Pipeline

### GitHub Actions Workflow

**Location:** `.github/workflows/firebase-deploy.yml`

#### Workflow Triggers

1. **Push to `main` branch**: Automatic deploy to production
2. **Pull requests**: Deploy preview to Firebase Hosting preview channels

#### Workflow Steps

**For Main Branch (Production):**
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies (`npm ci`)
4. Run build (`npm run build`)
5. Run smoke tests
6. Deploy to Firebase Hosting (production)

**For Pull Requests (Preview):**
1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies (`npm ci`)
4. Run build (`npm run build`)
5. Run smoke tests
6. Deploy to Firebase Hosting preview channel
7. Comment on PR with preview URL

### Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

#### Option 1: Service Account (Recommended)

**Secret Name:** `FIREBASE_SERVICE_ACCOUNT`

**Value:** Base64-encoded Firebase service account JSON

**How to get:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download the JSON file
4. Base64 encode it:
   ```bash
   # Linux/WSL
   base64 -w 0 < service-account-key.json
   
   # macOS
   base64 -i service-account-key.json
   ```
5. Copy the output and add as GitHub secret

#### Option 2: CI Token (Alternative)

**Secret Name:** `FIREBASE_TOKEN`

**How to get:**
```bash
firebase login:ci
```
Copy the token and add as GitHub secret.

### Deployment Behavior

| Branch | Trigger | Deploy To | Status |
|--------|---------|-----------|--------|
| `main` | Push | Production | Auto |
| `feature/*` | PR | Preview Channel | Auto |
| Other branches | Manual | N/A | Manual |

---

## Environment Variables

### Local Development (.env)

Create a `.env` file in the root directory (never commit this file):

```bash
# Node environment
NODE_ENV=development

# Database (if using local PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Server port (optional)
PORT=5000

# Other environment-specific configs
# Add as needed
```

### Production Environment

For Firebase Hosting, environment variables should be:
- Built into the client bundle at build time (for public config)
- Stored in Firebase Environment Config (for backend/functions)
- Never hardcoded in source code

### Environment Variable Usage

**Client-side (Vite):**
- Prefix with `VITE_` to expose to client
- Access via `import.meta.env.VITE_*`
- Only include non-sensitive data

**Server-side:**
- Access via `process.env.*`
- Can include sensitive data
- Set in `.env` locally or hosting platform

---

## Firebase Configuration

### Firebase Project Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project or select existing
   - Enable Firebase Hosting

2. **Initialize Firebase (one-time)**
   ```bash
   firebase login
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist/public`
   - Configure as single-page app: Yes
   - Don't overwrite index.html: No

3. **Update `.firebaserc`**
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

### Firebase Hosting Configuration

**File:** `firebase.json`

```json
{
  "hosting": {
    "public": "dist/public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Key Settings:**
- `public`: Build output directory
- `rewrites`: Enables SPA routing (all routes serve index.html)

### Firebase CLI Commands

```bash
# Deploy to production
firebase deploy --only hosting

# Deploy to preview channel
firebase hosting:channel:deploy preview-name

# View deployment history
firebase hosting:releases

# Open Firebase console
firebase open hosting
```

---

## Troubleshooting

### Build Failures

**Issue:** `Could not resolve entry module`
**Solution:** Ensure `vite.config.ts` exists and has correct configuration

**Issue:** Module not found errors
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

**Issue:** TypeScript errors
**Solution:** 
```bash
npm run check
```
Fix reported errors in source files

### Development Server Issues

**Issue:** Port already in use
**Solution:** Change PORT in .env or kill process using port:
```bash
# Find process
lsof -i :5000
# Kill it
kill -9 <PID>
```

**Issue:** Hot reload not working
**Solution:** 
- Clear browser cache
- Restart dev server
- Check for console errors

### Firebase Deployment Issues

**Issue:** "Project not found"
**Solution:** Update `.firebaserc` with correct project ID

**Issue:** "Authentication error"
**Solution:** 
```bash
firebase logout
firebase login
```

**Issue:** "Deployment failed"
**Solution:** 
- Ensure build succeeded (`npm run build`)
- Check `dist/public/` exists and has files
- Verify Firebase project permissions

### CI/CD Issues

**Issue:** GitHub Actions workflow failing
**Solution:** 
- Check workflow logs in Actions tab
- Verify GitHub secrets are set correctly
- Ensure secret name matches workflow file

**Issue:** "Firebase token expired"
**Solution:** Generate new token and update GitHub secret

---

## Code Style and Linting

### TypeScript

- Strict mode enabled
- Use explicit types where helpful
- Follow existing patterns in codebase

### React

- Functional components with hooks
- Use TypeScript for prop types
- Follow React best practices

### CSS/Styling

- Tailwind CSS utility classes
- Component-specific styles in modules when needed
- Follow design_guidelines.md for consistency

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## Getting Help

- **Issues:** Open an issue on GitHub
- **Documentation:** Check docs/ directory
- **Design:** See design_guidelines.md for brand/design specs

---

## Maintainer Tasks

### Before Merging PR

1. ✅ Review code changes
2. ✅ Test build locally
3. ✅ Verify all routes work
4. ⚠️ Update `.firebaserc` with real Firebase project ID
5. ⚠️ Add `FIREBASE_SERVICE_ACCOUNT` secret to GitHub repository

### After Merging

1. Monitor first deployment in GitHub Actions
2. Verify production site loads correctly
3. Test key pages and functionality
4. Monitor for errors in Firebase Console

### Regular Maintenance

- Update dependencies periodically (`npm outdated`)
- Review Firebase usage and quotas
- Monitor build times and optimization opportunities
- Keep documentation updated

---

**Guide Version:** 1.0  
**Last Updated:** January 12, 2026  
**Maintained By:** Development Team
