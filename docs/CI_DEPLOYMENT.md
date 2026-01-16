# CI Deployment: Firebase (OIDC) — Setup & Secrets

This document explains the repository-side steps and required secrets to allow GitHub Actions to deploy to Firebase using either Workload Identity (recommended) or a service account key (fallback).

Required GitHub repository secrets:

- `WORKLOAD_IDENTITY_PROVIDER` — The Workload Identity Provider resource name (example: `projects/123456789/locations/global/workloadIdentityPools/POOL/providers/PROVIDER`).
- `WORKLOAD_IDENTITY_SERVICE_ACCOUNT` — Email of the GCP service account to impersonate (example: `github-deploy@my-project.iam.gserviceaccount.com`).
- `GCP_SA_KEY` (optional) — Base64-encoded JSON key for a service account (only if not using OIDC).
- `FIREBASE_PROJECT_ID` — Firebase project ID to deploy to (example: `royalcarriagelimoseo`).

Recommended setup (OIDC / Workload Identity):

1. Create a GCP service account with `roles/firebasehosting.admin` and `roles/cloudfunctions.admin` (and any other minimal roles needed).
2. Create a Workload Identity Pool and Provider for GitHub (see Google docs).
3. Allow the provider to impersonate the service account by granting `roles/iam.workloadIdentityUser` on the service account to the provider principal.
4. Set the provider resource name and service account email as `WORKLOAD_IDENTITY_PROVIDER` and `WORKLOAD_IDENTITY_SERVICE_ACCOUNT` in repo secrets.

Fallback (service account key):

1. Create a short-lived JSON key for a service account with the deploy permissions.
2. Base64-encode the JSON and set it in `GCP_SA_KEY` (only for temporary use).

Triggering deploy:

- The workflow `/.github/workflows/firebase-deploy-oidc.yml` runs on pushes to `main` and supports `workflow_dispatch` for manual triggers.
- After adding secrets, push to `main` or run the workflow manually from GitHub > Actions > Deploy to Firebase (OIDC).

Local deploy (developer):

- Ensure you have `firebase-tools` installed locally (recommended v13+):

```bash
npm install -g firebase-tools@13
# or using pnpm
pnpm add -g firebase-tools@13
```

- Then run (requires you to be authenticated):

```bash
# deploy all configured hosting targets and functions
FIREBASE_PROJECT=royalcarriagelimoseo pnpm -s exec firebase deploy --project "$FIREBASE_PROJECT" --only hosting:admin,hosting:airport,hosting:corporate,hosting:wedding,hosting:partybus,functions --non-interactive
```

Notes and troubleshooting:

- Prefer OIDC (Workload Identity) over long-lived keys.
- Ensure `firebase.json` and `functions/package.json` are validated before deploy.
- If CI fails for permission reasons, verify the service account roles and provider binding.
