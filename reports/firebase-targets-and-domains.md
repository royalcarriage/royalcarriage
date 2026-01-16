# Firebase Targets and Domains Report
**Generated:** 2026-01-16
**Project:** Royal Carriage Limousine

## Firebase Project Configuration
- **Project ID:** `royalcarriagelimoseo`
- **Web App ID:** `1:910418192896:web:43a0aa8f8bf2a2cb2ac6e5`

## Hosting Targets

### Admin Dashboard
- **Target:** `admin`
- **Primary Domain:** https://admin.royalcarriagelimo.com ⚠️ (needs DNS setup)
- **Firebase Default:** https://royalcarriagelimoseo.web.app
- **Firebaseapp:** https://royalcarriagelimoseo.firebaseapp.com
- **Build Output:** `dist/public`
- **Framework:** React (Vite)

### Airport Services Site
- **Target:** `airport`
- **Assigned Site:** `airport-royalcarriage`
- **Build Output:** `apps/airport/dist`
- **Framework:** Astro
- **Content:** O'Hare, Midway airport transportation

### Party Bus Site
- **Target:** `partybus`
- **Assigned Site:** `partybus-royalcarriage`
- **Build Output:** `apps/partybus/dist`
- **Framework:** Astro
- **Content:** Party bus rentals, events

### Corporate Site
- **Target:** `corporate`
- **Assigned Site:** `corporate-royalcarriage`
- **Build Output:** `apps/corporate/dist`
- **Framework:** Astro
- **Content:** Executive transportation, corporate services

### Wedding Site
- **Target:** `wedding`
- **Assigned Site:** `wedding-royalcarriage`
- **Build Output:** `apps/wedding/dist`
- **Framework:** Astro
- **Content:** Wedding transportation services

## Firebase Authentication

### Authorized Domains (Required Setup in Firebase Console)
⚠️ **ACTION REQUIRED:** These domains must be added in Firebase Console → Authentication → Settings → Authorized domains:

1. `admin.royalcarriagelimo.com` - Admin primary domain
2. `royalcarriagelimoseo.web.app` - Firebase default
3. `royalcarriagelimoseo.firebaseapp.com` - Firebaseapp default
4. `localhost` - Local development
5. `localhost:5000` - Local hosting emulator

### Google OAuth Configuration
- **Provider:** Google
- **Client ID:** Managed by Firebase
- **Sign-in method:** Popup (signInWithPopup)
- **Redirect:** Automatic via Firebase SDK

### User Roles
1. **SuperAdmin** (Level 4)
   - Email: `info@royalcarriagelimo.com`
   - Permissions: Full access to everything
   
2. **Admin** (Level 3)
   - Permissions: Manage users (Editor/Viewer only), CSV imports, settings, all views
   
3. **Editor** (Level 2)
   - Permissions: Edit content, create invoices/payments, analyze pages, view data
   
4. **Viewer** (Level 1)
   - Permissions: Read-only access to dashboards and reports

## Deployment Commands

### Deploy All Sites
```bash
firebase deploy
```

### Deploy Specific Sites
```bash
firebase deploy --only hosting:admin
firebase deploy --only hosting:airport
firebase deploy --only hosting:partybus
firebase deploy --only hosting:corporate
firebase deploy --only hosting:wedding
```

### Deploy Rules Only
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Deploy Functions
```bash
firebase deploy --only functions
```

## Domain Redirects

### Current Behavior
- Firebase default domains (royalcarriagelimoseo.web.app, royalcarriagelimoseo.firebaseapp.com) → serve admin dashboard
- All sites require authentication for admin access

### Recommended Setup
1. **Admin:** Use custom domain admin.royalcarriagelimo.com
2. **Marketing sites:** Each should have custom domains:
   - airport.royalcarriagelimo.com
   - partybus.royalcarriagelimo.com
   - corporate.royalcarriagelimo.com
   - wedding.royalcarriagelimo.com
3. **Firebase defaults:** Redirect to admin or set noindex

## Security Configuration

### Firestore Rules
- ✅ Role-based access control implemented
- ✅ User data protected (read own, admins manage all)
- ✅ Content collections use role hierarchy
- ✅ Rate limiting on image generation (50/day/admin)

### Storage Rules
- Configured in `storage.rules`
- AI-generated images: admin-only write access
- User temp uploads: user-scoped write, admin read

## Environment Variables

### Required for Client
```bash
VITE_FIREBASE_API_KEY=<from Firebase Console>
# Note: Has safe fallback, but should be set for clarity
```

### Required for SEO Scripts
```bash
OPENAI_API_KEY=<from OpenAI>
# Required for content generation in seo-draft.mjs
```

### Required for Publishing
```bash
GITHUB_TOKEN=<personal access token>
# Required for seo-publish.mjs to create PRs
# Or install GitHub CLI: gh auth login
```

## Testing URLs (After Deployment)

### Admin Dashboard
- https://royalcarriagelimoseo.web.app (default Firebase)
- https://admin.royalcarriagelimo.com (custom, after DNS setup)

### Marketing Sites
- Will be available at Firebase hosting URLs after first deployment
- Use `firebase deploy --only hosting:airport` etc. to deploy individually

## Status

✅ **Configuration Complete**
✅ **Multi-site hosting configured**
✅ **Authentication system ready**
⚠️ **Awaiting:** Authorized domain setup in Firebase Console
⚠️ **Awaiting:** Custom domain DNS configuration
⚠️ **Awaiting:** Environment variable setup (OPENAI_API_KEY for SEO)

## Next Steps

1. **Firebase Console Setup:**
   - Go to Firebase Console → Authentication → Settings
   - Add authorized domains listed above
   
2. **Environment Variables:**
   - Set VITE_FIREBASE_API_KEY in .env
   - Set OPENAI_API_KEY for SEO automation
   
3. **Deploy:**
   ```bash
   npm run build:all
   firebase deploy
   ```

4. **Test Authentication:**
   - Visit admin dashboard
   - Sign in with info@royalcarriagelimo.com (will have SuperAdmin role)
   - Verify role-based access

5. **Custom Domains:**
   - Configure DNS records for custom domains
   - Add custom domains in Firebase Console → Hosting
