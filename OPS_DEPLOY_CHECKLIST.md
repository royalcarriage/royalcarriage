# Ops Deploy Checklist — Royal Carriage

## Pre-flight
- git pull (main)
- npm ci
- npm run build
- firebase projects:list (confirm access)
- firebase use royalcarriagelimoseo

## Validate Deployment
- Confirm royalcarriagelimoseo.web.app loads the Admin Dashboard (login screen).
- Confirm no broken imports/build failures.

## Deploy
- **Primary Method: GitHub Actions** (push to `main` branch)
  - Ensure `FIREBASE_CLI_TOKEN` and `GCP_SA_KEY` are set as GitHub repository secrets.
- **Manual (Local CLI) Deploy**:
  - `npm run deploy:all` (Deploys hosting, functions, firestore rules, storage rules)
- Verify:
  - royalcarriagelimoseo.web.app loads dashboard
  - Auth works (login/logout)
  - Firestore/Storage rules allow required operations
  - Functions endpoints respond (if any)

## Post-deploy
- Tag release in git (optional)
- Document any migrations or changes

**Key Updates & Reminders:**
- The Admin Dashboard is now deployed to the root of `royalcarriagelimoseo.web.app`.
- All other marketing sites (airport, corporate, wedding, partybus) are **not** deployed by this configuration.
- Automated deployments are handled via GitHub Actions. **Ensure GitHub secrets are correctly configured!**
- Functions are deployed, but `functions.config()` deprecation warning is present and requires future migration to environment variables (see Firebase documentation).