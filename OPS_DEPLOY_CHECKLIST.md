# OPS DEPLOY CHECKLIST

Use this list to ship Hosting + Functions safely in the `royalcarriagelimoseo` project.

## Pre-deploy
- Confirm project: `firebase use` → `royalcarriagelimoseo`
- Install deps: `pnpm install` (workspace) if not already
- Build admin: `pnpm run build:admin` → outputs to `apps/admin/dist`
- Build functions: `pnpm run build:functions` (tsc + postbuild to `functions/lib`)
- Verify hosting targets map to sites (`.firebaserc`): admin→royalcarriagelimoseo, airport→chicagoairportblackcar, corporate→chicagoexecutivecarservice, wedding→chicagoweddingtransportation, partybus→chicago-partybus

## Deploy
- Rules/Indexes: `firebase deploy --only firestore:rules,firestore:indexes`
- Storage rules: `firebase deploy --only storage`
- Functions: `firebase deploy --only functions`
- Hosting:
  - Admin only: `pnpm run deploy:admin`
  - All targets: `firebase deploy --only hosting` (uses built assets in `apps/*/dist`)

## Post-deploy verification
- `https://admin.royalcarriagelimo.com` (and `https://royalcarriagelimoseo.web.app`) loads admin UI without Next.js error page
- Spot-check marketing sites: `chicagoairportblackcar.web.app`, `chicagoexecutivecarservice.web.app`, `chicagoweddingtransportation.web.app`, `chicago-partybus.web.app`
- Functions logs clean for `imageGenerate`/`dailyPageAnalysis`
- Confirm Firestore/Storage rules deployed (`firebase security:rules:get`)
