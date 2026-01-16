# Multi-Site Firebase/App Hosting Setup

Domains:  
- chicagoairportblackcar.com  
- chicagoexecutivecarservice.com  
- chicagoweddingtransportation.com  
- chicago-partybus.com  
- Admin/App Hosting: `royalcarriage--royalcarriagelimoseo.us-east4.hosted.app`

## IDs and config you need to collect
1) **Firebase Web App IDs/config** (one per domain, or a shared web app with all domains added):  
   - `appId`, `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.  
   - Add them to GitHub secrets or env files for your builds.
2) **Hosting/App Hosting targets** (one per domain):  
   - Hosting site IDs (no dots), e.g. `chicagoairportblackcar`, `chicagoexecutivecarservice`, `chicagoweddingtransportation`, `chicagopartybus`.  
   - OR App Hosting backend IDs if you prefer App Hosting for each site. Example backend: `royalcarriage` (already referenced).  
3) **Service account / WIF for CI**:  
   - `WORKLOAD_IDENTITY_PROVIDER` + `WORKLOAD_IDENTITY_SERVICE_ACCOUNT` **or** `GCP_SA_KEY` with roles to deploy Hosting/App Hosting + Functions.  
   - `FIREBASE_SERVICE_ACCOUNT` for Hosting deploys (if using the Firebase Hosting GitHub Action).
4) **Buckets (optional per-site)**:  
   - Default AI bucket: `royalcarriagelimoseo-ai-images`. If you want per-site buckets, create and set `GOOGLE_CLOUD_STORAGE_BUCKET` per site.
5) **Analytics/SEO**: GA property IDs per domain, sitemap URLs, and Search Console verification if needed.

## How to define sites for scheduled AI/SEO analysis
- Default configuration now includes all four domains plus the admin base.  
- Override with `SITE_CONFIG_JSON` env (example below) to customize pages or API endpoint per site.  
  ```json
  [
    {
      "id": "airport",
      "baseUrl": "https://chicagoairportblackcar.com",
      "pages": ["/", "/fleet", "/pricing"],
      "analysisApiUrl": "https://royalcarriagelimoseo.web.app"
    },
    {
      "id": "executive",
      "baseUrl": "https://chicagoexecutivecarservice.com",
      "pages": ["/", "/corporate", "/fleet"]
    }
  ]
  ```
- Set `ALLOWED_ORIGINS` to include all domains (already reflected in `.env.example`).

## Workflow wiring (what exists)
- `.github/workflows/apphosting-admin.yml`: Deploys App Hosting backend `royalcarriage` in `us-east4` and Cloud Functions to project `royalcarriagelimoseo`.

## Recommended next steps to finish wiring
1) **Create/verify backends or hosting sites** for each domain; map custom domains in Firebase console.  
2) **Store Web App configs** for each domain in repo secrets and inject into builds.  
3) **Add CI matrix** for the four backends/hosting targets to build and deploy each site (reuse `apphosting-admin.yml` as a base).  
4) **Set env** in Functions: `ALLOWED_ORIGINS`, optional `SITE_CONFIG_JSON`, and per-site backend overrides if needed.  
5) **Run Actions**: trigger “Deploy Admin via App Hosting” (or the extended matrix workflow) to push the current commit.  
6) **Verify** scheduled analysis runs across all domains (`page_analyses` now records `siteId` and `baseUrl`).
