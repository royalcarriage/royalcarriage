# Domain Configuration

## Overview
This document describes the multi-site Firebase Hosting configuration for Royal Carriage's web properties.

## Admin Dashboard
- **Primary Domain**: https://admin.royalcarriagelimo.com
- **Firebase Default**: https://royalcarriagelimoseo.web.app
- **Build Output**: `apps/admin/dist`
- **Target**: `admin`

## Marketing Sites

| Site | Custom Domain | Firebase Site ID | Build Output | Target |
|------|---------------|------------------|--------------|--------|
| Airport | chicagoairportblackcar.com | chicagoairportblackcar | apps/airport/dist | airport |
| Party Bus | chicago-partybus.com | chicago-partybus | apps/partybus/dist | partybus |
| Executive | chicagoexecutivecarservice.com | chicagoexecutivecarservice | apps/corporate/dist | executive |
| Wedding | chicagoweddingtransportation.com | chicagoweddingtransportation | apps/wedding/dist | wedding |

## DNS Configuration

### Admin Dashboard
Add a CNAME record for the admin subdomain:
```
admin.royalcarriagelimo.com → royalcarriagelimoseo.web.app
```

### Marketing Sites
Each marketing site should have its own custom domain configured in Firebase Hosting:

1. Go to Firebase Console → Hosting
2. Add custom domain for each site
3. Follow Firebase's DNS configuration instructions
4. Add provided DNS records (A, AAAA, or CNAME) to your domain registrar

## Firebase Configuration Files

### firebase.json
The `firebase.json` file defines hosting targets for all sites:
- Each site has a separate hosting configuration
- Admin site includes security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- All sites use SPA-style rewrites to index.html

### .firebaserc
The `.firebaserc` file maps hosting targets to Firebase site IDs:
- `admin` → royalcarriagelimoseo
- `airport` → chicagoairportblackcar
- `partybus` → chicago-partybus
- `executive` → chicagoexecutivecarservice
- `wedding` → chicagoweddingtransportation

## Deployment

### Deploy All Sites
```bash
npm run build:all
firebase deploy --only hosting
```

### Deploy Individual Sites
```bash
# Admin dashboard
npm run deploy:admin

# Airport site
npm run deploy:airport

# Party bus site
npm run deploy:partybus

# Executive/corporate site
npm run deploy:executive

# Wedding site
npm run deploy:wedding
```

### Deploy via GitHub Actions
Use the workflow_dispatch trigger in `.github/workflows/deploy-firebase.yml`:
1. Go to Actions tab in GitHub
2. Select "Deploy to Firebase Hosting"
3. Click "Run workflow"
4. Choose environment and site to deploy

## Build Commands

Individual builds:
```bash
npm run build:admin
npm run build:airport
npm run build:partybus
npm run build:corporate
npm run build:wedding
```

Build all sites:
```bash
npm run build:all
```

## Verification

After deployment, verify each site:
1. Check that the site loads correctly
2. Verify SSL certificate is active
3. Test navigation and functionality
4. Confirm analytics tracking is working
5. Check that security headers are present (admin site)

## Troubleshooting

### Site Not Loading
- Verify DNS records are correctly configured
- Check Firebase Hosting status in console
- Ensure build completed successfully
- Verify correct Firebase project is selected

### Build Failures
- Check that all dependencies are installed: `pnpm install`
- Verify Astro configurations are correct
- Check for syntax errors in page files
- Ensure workspace packages are accessible

### Deployment Failures
- Verify Firebase authentication is configured
- Check that hosting targets match .firebaserc
- Ensure build outputs exist in expected directories
- Verify Firebase CLI is up to date
