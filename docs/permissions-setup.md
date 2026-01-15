# GCP / GitHub OIDC Setup Guide

This document contains step-by-step commands and notes to set up Workload Identity Federation (OIDC) so GitHub Actions can deploy to GCP/Firebase without long-lived JSON keys.

1) Create a service account for CI deploys

```bash
# Replace PROJECT with your GCP project id
PROJECT=your-gcp-project-id
gcloud iam service-accounts create github-deployer --project="$PROJECT" --display-name="GitHub Actions Deployer"
SA_EMAIL=github-deployer@$PROJECT.iam.gserviceaccount.com

# Grant minimal roles (adjust as needed)
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/firebase.admin"
gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

```

2) Create a Workload Identity Pool and provider

```bash
POOL_ID=github-pool
PROVIDER_ID=github-provider
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project="$PROJECT" --location="global" --display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$PROJECT" --location="global" \
  --workload-identity-pool="$POOL_ID" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --allowed-audiences="https://github.com/$GITHUB_OWNER"

# Note: review provider settings in GCP console; you can restrict repo or org in attribute mappings.
```

3) Allow GitHub OIDC to impersonate the SA

```bash
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" \
  --project="$PROJECT" \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/$PROJECT/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/your-org/your-repo"
```

4) Update your GitHub workflow

- Use `google-github-actions/auth@v1` with `workload_identity_provider` and `service_account` (see `.github/workflows/firebase-deploy-oidc.yml`).

5) Verify

- Run the workflow in a branch and confirm `gcloud auth list` shows the service account and `firebase deploy` succeeds.

If you want, I can prepare the exact `gcloud` commands with your project number and repo/org details and submit them as a PR to `docs`.