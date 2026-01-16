# DEPLOYMENT REPORT

**STATUS:** Admin hosting updated; functions built locally; other hosting targets untouched.

## Actions
- Confirmed active project `royalcarriagelimoseo`
- Built admin app (`pnpm run build:admin`) → output `apps/admin/dist`
- Deployed admin hosting target to site `royalcarriagelimoseo` (`firebase deploy --only hosting:admin`)
- Built Functions (`pnpm run build:functions`) → `functions/lib` (tsc + postbuild)
- Updated `.firebaserc` target mapping to actual site IDs and `firebase.json` predeploy to `pnpm run build`

## Verification
- `https://admin.royalcarriagelimo.com` now serves the Astro admin dashboard (no Next.js error)
- `https://royalcarriagelimoseo.web.app` matches admin build
- Hosting sites present in project: chicagoairportblackcar, chicagoexecutivecarservice, chicagoweddingtransportation, chicago-partybus, royalcarriagelimoseo

## Pending / Risks
- Functions not deployed yet (runtime nodejs20; local Node v24 emits CLI warning)
- Marketing targets rely on checked-in `dist` only—source apps missing; redeploy carefully
- Auth/storage/firestore rules not redeployed in this run
