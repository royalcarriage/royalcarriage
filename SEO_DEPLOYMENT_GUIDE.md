# Royal Carriage Multi-Site SEO Network - Deployment Guide

## Overview

Successfully created a complete 4-site SEO network for Royal Carriage Limousine with the following structure:

- **Airport Site**: chicagoairportblackcar.web.app (9 pages)
- **Corporate Site**: chicagoexecutivecarservice.web.app (6 pages)
- **Wedding Site**: chicagoweddingtransportation.web.app (5 pages)
- **Party Bus Site**: chicago-partybus.web.app (6 pages)

**Total: 26 unique, SEO-optimized pages**

## What Was Built

### 1. Shared Infrastructure

#### Packages Created:

- **@packages/astro-utils**: SEO utilities, schema generators, tracking functions
  - `/Users/admin/VSCODE/packages/astro-utils/src/config.ts` - Site configurations
  - `/Users/admin/VSCODE/packages/astro-utils/src/seo.ts` - SEO meta tag generators
  - `/Users/admin/VSCODE/packages/astro-utils/src/schema.ts` - JSON-LD schema builders
  - `/Users/admin/VSCODE/packages/astro-utils/src/tracking.ts` - GA4 event tracking

- **@packages/astro-components**: Reusable Astro components
  - `/Users/admin/VSCODE/packages/astro-components/src/Header.astro` - Sticky mobile CTA header
  - `/Users/admin/VSCODE/packages/astro-components/src/Footer.astro` - Site footer with links
  - `/Users/admin/VSCODE/packages/astro-components/src/NavBar.astro` - Responsive navigation
  - `/Users/admin/VSCODE/packages/astro-components/src/CTAButton.astro` - Book Now button with UTM tracking
  - `/Users/admin/VSCODE/packages/astro-components/src/CallButton.astro` - Call button with tracking

### 2. Site Configurations

Each app configured with:

- Astro sitemap integration (`@astrojs/sitemap`)
- Static build with `format: 'file'`
- Proper site URLs for sitemap generation
- robots.txt files for search engines

#### Airport Site (9 pages)

- `/` - Home page with services overview
- `/ohare-airport-limo` - O'Hare specific service
- `/midway-airport-limo` - Midway specific service
- `/airport-limo-downtown-chicago` - Downtown Chicago service
- `/airport-limo-suburbs` - Suburbs service
- `/fleet` - Fleet overview
- `/pricing` - Pricing information
- `/about` - About company
- `/contact` - Contact information

#### Corporate Site (6 pages)

- `/` - Home page with corporate services
- `/executive-transportation` - Executive black car service
- `/corporate-black-car-service` - Corporate transportation
- `/hourly-chauffeur-service` - Hourly service detail
- `/fleet` - Fleet overview
- `/contact` - Contact information

#### Wedding Site (5 pages)

- `/` - Home page with wedding services
- `/wedding-limo-service` - Wedding limo detail
- `/bridal-party-transportation` - Bridal party service
- `/fleet` - Fleet overview
- `/contact` - Contact information

#### Party Bus Site (6 pages)

- `/` - Home page with party bus services
- `/party-bus-rental` - Party bus detail
- `/birthday-party-bus` - Birthday party buses
- `/concert-transportation` - Concert/event transportation
- `/fleet` - Fleet overview
- `/contact` - Contact information

### 3. SEO Features

Every page includes:

- **Meta Tags**: Title, description, canonical, robots
- **Open Graph**: Full OG tags for social sharing
- **Twitter Cards**: Twitter-specific meta tags
- **JSON-LD Schema**: LocalBusiness and Service schemas
- **Proper Headers**: H1, H2, H3 hierarchy
- **Internal Linking**: Cross-linking between pages
- **Mobile Optimization**: Responsive design with Tailwind CSS
- **Call-to-Actions**: Prominent CTAs with UTM tracking

### 4. Firebase Configuration

Updated `/Users/admin/VSCODE/firebase.json`:

- Removed SPA rewrites (not needed for static Astro sites)
- Added `cleanUrls: true` for clean URL paths
- Added `trailingSlash: false` for consistent URLs
- Proper dist folders for each target

### 5. Build & Deploy Scripts

Updated `/Users/admin/VSCODE/package.json` with new scripts:

```json
{
  "install:all": "pnpm install",
  "build:all-sites": "pnpm run build:airport && pnpm run build:corporate && pnpm run build:wedding && pnpm run build:partybus",
  "deploy:airport": "firebase deploy --only hosting:airport",
  "deploy:corporate": "firebase deploy --only hosting:corporate",
  "deploy:wedding": "firebase deploy --only hosting:wedding",
  "deploy:partybus": "firebase deploy --only hosting:partybus",
  "deploy:all-sites": "firebase deploy --only hosting:airport,hosting:corporate,hosting:wedding,hosting:partybus"
}
```

## How to Deploy

### Step 1: Install Dependencies

```bash
cd /Users/admin/VSCODE
pnpm install
```

This will install all dependencies for:

- Root workspace
- All 4 Astro apps
- Shared packages

### Step 2: Build All Sites

```bash
pnpm run build:all-sites
```

This builds all 4 Astro sites to their respective `dist` folders:

- `apps/airport/dist`
- `apps/corporate/dist`
- `apps/wedding/dist`
- `apps/partybus/dist`

### Step 3: Deploy to Firebase

Deploy all sites at once:

```bash
pnpm run deploy:all-sites
```

Or deploy individually:

```bash
pnpm run deploy:airport
pnpm run deploy:corporate
pnpm run deploy:wedding
pnpm run deploy:partybus
```

### Step 4: Verify Deployment

After deployment, verify each site:

- https://chicagoairportblackcar.web.app
- https://chicagoexecutivecarservice.web.app
- https://chicagoweddingtransportation.web.app
- https://chicago-partybus.web.app

Check:

1. All pages load correctly
2. Navigation works
3. CTAs link to correct booking URL with UTM params
4. Phone links work: tel:+12248013090
5. Sitemaps generate: `/sitemap-index.xml`
6. robots.txt accessible: `/robots.txt`

## SEO Next Steps

### 1. Google Search Console Setup

For each domain:

1. Add property in Google Search Console
2. Verify ownership (HTML file or DNS)
3. Submit sitemap: `https://[domain]/sitemap-index.xml`
4. Monitor index status

### 2. Google Analytics Setup

1. Create GA4 property for each site (or use one property with multiple streams)
2. Add measurement ID to each BaseLayout.astro file (currently commented out)
3. Update the commented GA section in:
   - `/Users/admin/VSCODE/apps/airport/src/layouts/BaseLayout.astro`
   - `/Users/admin/VSCODE/apps/corporate/src/layouts/BaseLayout.astro`
   - `/Users/admin/VSCODE/apps/wedding/src/layouts/BaseLayout.astro`
   - `/Users/admin/VSCODE/apps/partybus/src/layouts/BaseLayout.astro`

### 3. Schema Validation

Test JSON-LD schema with Google's Rich Results Test:
https://search.google.com/test/rich-results

Validate:

- LocalBusiness schema on home pages
- Service schema on service pages

### 4. Custom Domain Setup

When ready to use custom domains:

1. Purchase/configure domains
2. Update Firebase hosting to use custom domains
3. Update site URLs in:
   - `astro.config.mjs` for each app (site: property)
   - `/Users/admin/VSCODE/packages/astro-utils/src/config.ts` (domain properties)
4. Rebuild and redeploy

### 5. Content Optimization

Consider adding:

- Customer testimonials (more detail)
- Service area pages (city-specific landing pages)
- FAQ sections with FAQSchema
- Blog/news section for fresh content
- High-quality images with alt text
- Video content embedded on pages

## Project Structure

```
/Users/admin/VSCODE/
├── apps/
│   ├── airport/
│   │   ├── src/
│   │   │   ├── layouts/BaseLayout.astro
│   │   │   └── pages/
│   │   │       ├── index.astro
│   │   │       ├── ohare-airport-limo.astro
│   │   │       ├── midway-airport-limo.astro
│   │   │       ├── airport-limo-downtown-chicago.astro
│   │   │       ├── airport-limo-suburbs.astro
│   │   │       ├── fleet.astro
│   │   │       ├── pricing.astro
│   │   │       ├── about.astro
│   │   │       └── contact.astro
│   │   ├── public/robots.txt
│   │   ├── astro.config.mjs
│   │   └── package.json
│   ├── corporate/
│   │   ├── src/
│   │   │   ├── layouts/BaseLayout.astro
│   │   │   └── pages/
│   │   │       ├── index.astro
│   │   │       ├── executive-transportation.astro
│   │   │       ├── corporate-black-car-service.astro
│   │   │       ├── hourly-chauffeur-service.astro
│   │   │       ├── fleet.astro
│   │   │       └── contact.astro
│   │   ├── public/robots.txt
│   │   ├── astro.config.mjs
│   │   └── package.json
│   ├── wedding/
│   │   ├── src/
│   │   │   ├── layouts/BaseLayout.astro
│   │   │   └── pages/
│   │   │       ├── index.astro
│   │   │       ├── wedding-limo-service.astro
│   │   │       ├── bridal-party-transportation.astro
│   │   │       ├── fleet.astro
│   │   │       └── contact.astro
│   │   ├── public/robots.txt
│   │   ├── astro.config.mjs
│   │   └── package.json
│   └── partybus/
│       ├── src/
│       │   ├── layouts/BaseLayout.astro
│       │   └── pages/
│       │       ├── index.astro
│       │       ├── party-bus-rental.astro
│       │       ├── birthday-party-bus.astro
│       │       ├── concert-transportation.astro
│       │       ├── fleet.astro
│       │       └── contact.astro
│       ├── public/robots.txt
│       ├── astro.config.mjs
│       └── package.json
├── packages/
│   ├── astro-components/
│   │   ├── src/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── NavBar.astro
│   │   │   ├── CTAButton.astro
│   │   │   └── CallButton.astro
│   │   └── package.json
│   └── astro-utils/
│       ├── src/
│       │   ├── config.ts
│       │   ├── seo.ts
│       │   ├── schema.ts
│       │   ├── tracking.ts
│       │   └── index.ts
│       └── package.json
├── data/
│   └── cities.json
├── scripts/
│   ├── generate-all-pages.mjs
│   └── complete-all-sites.mjs
├── firebase.json
├── .firebaserc
└── package.json
```

## Key Files and Their Purposes

### Configuration Files

- **firebase.json**: Firebase hosting configuration for multi-site deployment
- **.firebaserc**: Firebase project and target mappings
- **package.json**: Root workspace with build/deploy scripts
- **apps/\*/astro.config.mjs**: Individual Astro site configurations

### Shared Utilities

- **packages/astro-utils/src/config.ts**: Centralized site configurations (phone, URLs, UTM params)
- **packages/astro-utils/src/seo.ts**: SEO meta tag generators
- **packages/astro-utils/src/schema.ts**: JSON-LD schema builders (LocalBusiness, Service, FAQ)
- **packages/astro-utils/src/tracking.ts**: GA4 event tracking helpers

### Shared Components

- **packages/astro-components/src/Header.astro**: Sticky mobile CTA bar
- **packages/astro-components/src/Footer.astro**: Footer with links and social media
- **packages/astro-components/src/NavBar.astro**: Responsive navigation
- **packages/astro-components/src/CTAButton.astro**: Booking button with UTM tracking
- **packages/astro-components/src/CallButton.astro**: Phone call button with tracking

## Business Information

- **Company**: Royal Carriage Limousine
- **Location**: Chicago, IL
- **Phone**: (224) 801-3090 (tel:+12248013090)
- **Booking URL**: https://customer.moovs.app/royal-carriage-limousine/new/info
- **Firebase Project**: royalcarriagelimoseo

### UTM Parameters

All booking links include:

- `utm_source={target}` - airport, corporate, wedding, or partybus
- `utm_medium=seo` - Traffic source
- `utm_campaign=microsites` - Campaign identifier

Example: `https://customer.moovs.app/royal-carriage-limousine/new/info?utm_source=airport&utm_medium=seo&utm_campaign=microsites`

## Maintenance & Updates

### Adding New Pages

1. Create new `.astro` file in appropriate `apps/*/src/pages/` directory
2. Import and use `BaseLayout` component
3. Add proper SEO metadata (title, description, canonical)
4. Include CTAButton and CallButton components
5. Add JSON-LD schema if applicable
6. Rebuild and redeploy site

### Updating Content

1. Edit the respective `.astro` file
2. Run `pnpm run build:{site-name}` to rebuild
3. Deploy with `pnpm run deploy:{site-name}`

### Adding New Sites

1. Create new app directory under `apps/`
2. Configure `astro.config.mjs` with sitemap
3. Create `BaseLayout` using shared components
4. Add site config to `packages/astro-utils/src/config.ts`
5. Add target to `firebase.json` and `.firebaserc`
6. Add build/deploy scripts to root `package.json`

## Troubleshooting

### Build Errors

If builds fail:

1. Check for import errors in components
2. Verify all dependencies installed: `pnpm install`
3. Check Astro version compatibility
4. Review console output for specific errors

### Deployment Issues

If deployment fails:

1. Verify Firebase CLI is installed and logged in
2. Check Firebase project permissions
3. Ensure dist folders exist after build
4. Verify target names match in firebase.json and .firebaserc

### SEO Issues

If pages not indexing:

1. Check robots.txt is accessible
2. Verify sitemap is generating correctly
3. Submit sitemap to Google Search Console
4. Check for noindex meta tags
5. Verify canonical URLs are correct

## Performance Optimization

All sites use:

- Static site generation (SSG) for fast loading
- Astro for minimal JavaScript
- Tailwind CSS for optimized styling
- Clean URLs without .html extensions
- Proper caching headers (Firebase hosting default)

## Success Metrics to Track

1. **Organic Traffic**: Monitor visits from search engines to each site
2. **Keyword Rankings**: Track target keywords (e.g., "chicago airport limo")
3. **Conversion Rate**: Booking clicks and phone calls from each site
4. **Page Speed**: Core Web Vitals for each page
5. **Index Coverage**: Pages indexed vs. submitted in Search Console
6. **CTR**: Click-through rate from search results
7. **Bounce Rate**: User engagement on landing pages

## Support & Resources

- **Astro Documentation**: https://docs.astro.build
- **Firebase Hosting**: https://firebase.google.com/docs/hosting
- **Google Search Console**: https://search.google.com/search-console
- **Schema.org**: https://schema.org for JSON-LD reference
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Deployment Date**: 2026-01-16
**Created By**: Claude Code (YOLO Autonomous Builder Agent)
**Status**: Ready for deployment
