# Firebase Deployment

This document explains how to enable CI deployments to Firebase Hosting from this repository.

Required GitHub secrets:

- `GCP_SA_KEY` — base64-encoded service account JSON with permissions to deploy Firebase Hosting. Do NOT commit the JSON to the repo.
- `FIREBASE_PROJECT_ID` — your Firebase project ID.

Recommended service account roles:

- `roles/firebase.hostingAdmin`
- `roles/iam.serviceAccountUser`

Quick setup steps:

1. In GCP Console create a service account for CI and grant the roles above.
2. Download the JSON key and base64-encode it: `base64 service-account.json | pbcopy` (macOS).
3. Add the base64 string to the repository secret `GCP_SA_KEY` and set `FIREBASE_PROJECT_ID`.

How the workflow works:

- The workflow `.github/workflows/firebase-deploy.yml` authenticates using `GCP_SA_KEY`, sets up gcloud, installs `firebase-tools`, and runs `firebase deploy --only hosting` using `FIREBASE_PROJECT_ID`.
You can authenticate CI in two ways:

- Service-account secret: set `FIREBASE_SERVICE_ACCOUNT` (base64 JSON) in repo secrets and the workflow will use it for deploys.
- Workload Identity (recommended): configure a Workload Identity Pool and Provider and set `WORKLOAD_IDENTITY_PROVIDER` and `SERVICE_ACCOUNT_EMAIL` as repository secrets. See `docs/CI_OIDC_SETUP.md` for step-by-step setup commands and a helper script at `scripts/setup-workload-identity.sh`.

If both are present, the workflow prefers the `FIREBASE_SERVICE_ACCOUNT` secret. If not present it will attempt OIDC using the provider and service account secrets.
Local test:

Set env vars and run the helper script:

```bash
export FIREBASE_PROJECT_ID=your-project-id
export GCP_SA_KEY=$(base64 -w 0 service-account.json)
./scripts/deploy-firebase.sh
```
