# OPS DEPLOY CHECKLIST

Admin Command Center deployment steps (Firebase project: `royalcarriagelimoseo`).

## Pre-deploy

- Ensure Firebase CLI logged in and project set: `firebase use royalcarriagelimoseo`
- Admin build: `cd apps/admin && npm run build` (outputs `apps/admin/out`)
- Functions build (if changed): `cd functions && pnpm install && pnpm run build`
- Verify `firebase.json` admin `public` path is `apps/admin/out`

## Deploy

- Hosting (admin): `firebase deploy --only hosting:admin`
- Functions: `firebase deploy --only functions`
- Rules/Indexes: `firebase deploy --only firestore:rules,firestore:indexes,storage`

## Post-deploy verification

- Hit `https://admin.royalcarriagelimo.com` (or `.web.app`) and ensure UI loads with login prompt
- Check auth flow (Google) and role badge in sidebar
- Trigger a quick action (import/gate) and confirm record appears in UI
- Confirm deploy log entry appears in Deploy & Logs page after button press

## Rollback

- For hosting: redeploy previous version from Firebase console or `firebase hosting:rollback`
- For functions: redeploy previous revision from Firebase console Functions page
