# Multi-Site Deployment Guide

Complete guide for deploying all 4 Royal Carriage websites with ROI/SEO AI systems.

## Overview

This repository contains 4 complete marketing websites plus an admin dashboard:

1. **Chicago Airport Black Car** - chicagoairportblackcar.com
2. **Chicago Party Bus** - chicago-partybus.com
3. **Chicago Executive Car Service** - chicagoexecutivecarservice.com
4. **Chicago Wedding Transportation** - chicagoweddingtransportation.com
5. **Admin Dashboard** - royalcarriagelimoseo.web.app/admin

## Prerequisites

- Node.js 20.x LTS
- npm 10.x or later
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project with Blaze plan (for Functions)
- Google Cloud Project with Vertex AI enabled (for AI features)

## Quick Start

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install each site's dependencies (handled by build script)
cd apps/airport && npm install && cd ../..
cd apps/partybus && npm install && cd ../..
cd apps/corporate && npm install && cd ../..
cd apps/wedding && npm install && cd ../..
```

### 2. Build All Sites

```bash
# Build all 4 Astro sites
node scripts/build-multisite.mjs

# Build admin dashboard (React/Vite)
npm run build
```

This creates:
- `dist/sites/airport/` - Airport site
- `dist/sites/partybus/` - Party bus site
- `dist/sites/executive/` - Executive car service site
- `dist/sites/wedding/` - Wedding transportation site
- `dist/public/` - Admin dashboard

### 3. Configure Firebase Hosting Targets

```bash
firebase login

# Set up hosting targets for each domain
firebase target:apply hosting admin royalcarriagelimoseo
firebase target:apply hosting airport chicagoairportblackcar
firebase target:apply hosting partybus chicago-partybus
firebase target:apply hosting executive chicagoexecutivecarservice
firebase target:apply hosting wedding chicagoweddingtransportation
```

### 4. Deploy Everything

```bash
# Deploy all sites + functions + firestore rules
firebase deploy

# Or deploy individually:
firebase deploy --only hosting:airport
firebase deploy --only hosting:partybus
firebase deploy --only hosting:executive
firebase deploy --only hosting:wedding
firebase deploy --only hosting:admin
firebase deploy --only functions
firebase deploy --only firestore
```

## Site-Specific Details

### Airport Site (chicagoairportblackcar.com)

**Pages:** 9 total
- Home
- O'Hare Airport Limo
- Midway Airport Limo
- Downtown Chicago
- Suburbs Service
- Fleet
- Pricing
- About
- Contact

**SEO Focus:**
- Airport transportation keywords
- O'Hare and Midway specific content
- High-intent booking keywords

### Party Bus Site (chicago-partybus.com)

**Pages:** 7 total
- Home
- Fleet (20, 30, 40 passenger)
- Services (Birthday, Bachelor/Bachelorette, Prom, Corporate, Special Events, Wine Tours)
- Pricing
- About
- Contact

**SEO Focus:**
- Event-specific keywords
- Chicago nightlife and celebrations
- Group transportation

### Executive Site (chicagoexecutivecarservice.com)

**Pages:** 8 total
- Home
- Airport Transfers
- Hourly Chauffeur Service
- Corporate Accounts
- Fleet
- Pricing
- About
- Contact

**SEO Focus:**
- Corporate transportation
- Executive car service
- Business travel keywords

### Wedding Site (chicagoweddingtransportation.com)

**Pages:** 7 total
- Home
- Wedding Day Limo Service
- Guest Shuttles
- Fleet
- Pricing
- About
- Contact

**SEO Focus:**
- Wedding transportation keywords
- Bridal party limos
- Guest shuttle services

## AI/ROI Systems

### ROI Intelligence Dashboard

Access at: `/admin/roi`

Features:
- Top keyword opportunities ranked by ROAS
- Profit scoring (0-100)
- CPA and conversion value tracking
- Priority recommendations (SCALE/OPTIMIZE/PAUSE)

### SEO Automation Workflow

Access at: `/admin/seo-workflow`

Features:
- Automated content proposal generation
- Approval workflow
- AI content generation
- Publishing pipeline

### Enhanced Page Analyzer

Access at: `/admin/analyze`

Features:
- SEO scoring with profit integration
- Revenue impact analysis
- Keyword-to-revenue matching
- Profit-driven recommendations

## API Endpoints

### ROI Intelligence

```
GET  /api/roi/opportunities - Get top keyword opportunities
POST /api/roi/analyze-page - Analyze page with profit scoring
GET  /api/roi/keywords/:pageType - Get recommended keywords
```

### SEO Workflow

```
GET  /api/seo/proposals - Get all content proposals
POST /api/seo/generate-proposals - Generate new proposals
POST /api/seo/approve - Approve a proposal
POST /api/seo/generate-content - Generate content for approved proposal
POST /api/seo/publish - Publish approved content
GET  /api/seo/proposal/:id - Get specific proposal
```

### Page Analysis

```
POST /api/ai/analyze-page - Standard page analysis
POST /api/ai/batch-analyze - Batch analyze multiple pages
POST /api/ai/generate-content - Generate optimized content
POST /api/ai/generate-image - Generate AI images
```

## Environment Variables

Create `.env` file:

```env
# Node
NODE_ENV=production
PORT=5000

# Firebase
FIREBASE_PROJECT_ID=your-project-id

# Google Cloud AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Vertex AI
VERTEX_AI_LOCATION=us-central1
IMAGEN_MODEL=imagen-3.0-generate-001

# Storage
GOOGLE_CLOUD_STORAGE_BUCKET=your-project-id-ai-images

# Security
SESSION_SECRET=your-random-secret-32-chars

# Rate Limiting
API_RATE_LIMIT=100
MAX_IMAGES_PER_DAY=50
```

## Custom Domains

### Firebase Console Setup

1. Go to Hosting section
2. Add custom domain for each site:
   - chicagoairportblackcar.com → airport target
   - chicago-partybus.com → partybus target
   - chicagoexecutivecarservice.com → executive target
   - chicagoweddingtransportation.com → wedding target

### DNS Configuration

For each domain, add these DNS records:

```
Type: A
Name: @
Value: 151.101.1.195, 151.101.65.195

Type: CNAME
Name: www
Value: your-project-id.web.app
```

SSL certificates are provisioned automatically by Firebase (takes up to 24 hours).

## Monitoring

### Check Deployment Status

```bash
# View hosting sites
firebase hosting:sites:list

# Check function logs
firebase functions:log

# View analytics
firebase console
```

### Performance Monitoring

All sites include:
- GA4 tracking (G-CC67CH86JR)
- Core Web Vitals monitoring
- Conversion tracking
- User behavior analytics

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf dist apps/*/dist apps/*/node_modules
npm install
node scripts/build-multisite.mjs
```

### Deployment Fails

```bash
# Check Firebase targets
firebase target:clear hosting airport
firebase target:apply hosting airport chicagoairportblackcar

# Redeploy specific site
firebase deploy --only hosting:airport
```

### Functions Not Working

```bash
# Check function logs
firebase functions:log --limit 100

# Verify environment variables
firebase functions:config:get

# Redeploy functions
firebase deploy --only functions
```

## Cost Estimates

### Free Tier (Spark Plan)

- Hosting: 10 GB storage, 360 MB/day bandwidth
- Firestore: 50K reads, 20K writes, 20K deletes per day
- Functions: 2M invocations, 400K GB-seconds per month

### With AI Features (Blaze Plan)

**Monthly Costs:**
- Light usage (10 analyses/day): $5-15
- Medium usage (50 analyses/day): $15-50
- Heavy usage (200 analyses/day): $50-200

**Breakdown:**
- Vertex AI (Gemini): ~$0.01 per page analysis
- Imagen (images): $0.02-0.04 per image
- Functions: First 2M invocations free
- Hosting: First 10 GB free

## Support

- Documentation: `docs/` directory
- AI System Guide: `docs/AI_SYSTEM_GUIDE.md`
- Quick Start: `docs/QUICK_START.md`
- Issues: GitHub Issues

## Production Checklist

- [ ] All 4 sites build successfully
- [ ] Firebase targets configured
- [ ] Custom domains added
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] GA4 tracking verified
- [ ] Functions deployed and working
- [ ] Firestore rules deployed
- [ ] Admin dashboard accessible
- [ ] ROI intelligence working
- [ ] SEO workflow operational
- [ ] Budget alerts configured

## Next Steps

1. **Content Optimization**
   - Run Page Analyzer on all pages
   - Implement profit-driven recommendations
   - Expand thin content pages

2. **SEO Workflow**
   - Generate content proposals
   - Approve high-ROAS opportunities
   - Publish optimized pages

3. **ROI Tracking**
   - Import Google Ads data
   - Track conversion metrics
   - Optimize based on profitability

4. **Scale**
   - Focus on SCALE priority keywords
   - Increase content for high-ROAS pages
   - Build backlinks to profit centers
