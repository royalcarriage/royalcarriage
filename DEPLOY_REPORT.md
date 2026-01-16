# DEPLOYMENT REPORT

**STATUS:** Full deploy completed (hosting all targets + functions + rules/indexes/storage).

## Actions
- Built admin app (Next.js) → `apps/admin/out`
- Updated `firebase.json` admin `public` to `apps/admin/out`
- Built Functions (`pnpm --filter royalcarriage-functions build` → tsc) and deployed (unchanged, skipped)
- Deployed Firestore rules/indexes and Storage rules
- Applied hosting targets in `.firebaserc` to site IDs
- Deployed hosting for admin + airport/corporate/wedding/partybus
- Ran admin self-audit (`node scripts/admin-self-audit.mjs`)

## Verification
- Live hosting:
  - Admin: https://royalcarriagelimoseo.web.app (CNAME for https://admin.royalcarriagelimo.com)
  - Airport: https://chicagoairportblackcar.web.app
  - Corporate: https://chicagoexecutivecarservice.web.app
  - Wedding: https://chicagoweddingtransportation.web.app
  - Partybus: https://chicago-partybus.web.app
- Firestore rules + indexes compiled and deployed; Storage rules deployed
- Functions deploy reported unchanged (no code diff)
- Self-audit report PASS in `reports/admin-self-audit.md`

## Risks / Notes
- Admin app needs `apps/admin/.env.local` with `NEXT_PUBLIC_FIREBASE_*` for live Auth/Firestore; otherwise UI uses mock data.
- Marketing sites are static `dist` artifacts; source code missing—rebuild only after recovering sources.
