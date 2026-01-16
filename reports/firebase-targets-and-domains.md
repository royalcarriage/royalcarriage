# Firebase Targets & Domains Report

**Project:** royalcarriagelimoseo  
**Generated:** $(date placeholder)

## Hosting Targets → Sites
- **admin** → `royalcarriagelimoseo` (serves `admin.royalcarriagelimo.com` + `.web.app`); public: `apps/admin/dist` (Astro)
- **airport** → `chicagoairportblackcar`; public: `apps/airport/dist`
- **corporate** → `chicagoexecutivecarservice`; public: `apps/corporate/dist`
- **wedding** → `chicagoweddingtransportation`; public: `apps/wedding/dist`
- **partybus** → `chicago-partybus`; public: `apps/partybus/dist`

All targets use SPA rewrites (`**` → `/index.html`). Marketing sites have only built assets checked in—preserve until sources are restored.

## Domains / DNS
- `admin.royalcarriagelimo.com` CNAME → `royalcarriagelimoseo.web.app` (confirmed via `dig`)
- Firebase default: `https://royalcarriagelimoseo.web.app`
- Other site defaults: `https://{site}.web.app` per list above

## Deploy Commands
- Admin only: `pnpm run build:admin && firebase deploy --only hosting:admin`
- All hosting: `firebase deploy --only hosting`
- Functions: `pnpm run build:functions && firebase deploy --only functions`
- Rules/Indexes: `firebase deploy --only firestore:rules,firestore:indexes,storage`

## Status
- Admin site redeployed from `apps/admin/dist` (Astro) and now loads on `admin.royalcarriagelimo.com`.
- Functions build succeeds locally (tsc + postbuild). Node engine warning persists (target nodejs20 vs local v24).
