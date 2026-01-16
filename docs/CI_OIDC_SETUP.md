# CI OIDC Setup (Workload Identity)

This guide shows how to configure Workload Identity (OIDC) so GitHub Actions can authenticate to GCP without long-lived service-account keys.

Prerequisites:
- `gcloud` CLI installed and authenticated with a user who can create service accounts, pools, and IAM bindings.
- Your GCP project id and project number.

Steps (replace placeholder values):

1. Create a workload identity pool

```bash
PROJECT_ID=your-project-id
POOL=github-pool
gcloud iam workload-identity-pools create "$POOL" \
  --project="$PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions pool"
```

2. Create a provider for GitHub (use recommended OIDC issuer URL)

```bash
POOL_ID=$(gcloud iam workload-identity-pools describe "$POOL" --project="$PROJECT_ID" --location=global --format='value(name)')
PROVIDER=github-provider
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="$POOL" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --allowed-audiences="https://gh"
```

3. Create (or use existing) service account to be impersonated by GitHub Actions

```bash
SERVICE_ACCOUNT_NAME=gha-deployer
gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" --project="$PROJECT_ID" --display-name="GitHub Actions Deployer"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
```

4. Grant the service account the minimal roles for Firebase deploy

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/firebase.hostingAdmin"

gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository/royalcarriage/royalcarriage"
```

Note: replace `PROJECT_NUMBER`, `POOL`, and `royalcarriage/royalcarriage` with your values. The `attribute.repository/...` pattern restricts impersonation to this repo.

5. Add GitHub repository secrets (in repo settings → Secrets → Actions):
- `WORKLOAD_IDENTITY_PROVIDER` — the full provider resource path: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL/providers/PROVIDER`
- `SERVICE_ACCOUNT_EMAIL` — the service account email (e.g., `gha-deployer@PROJECT_ID.iam.gserviceaccount.com`)
- `FIREBASE_PROJECT_ID` — your Firebase project id
5. Add GitHub repository secrets (in repo settings → Secrets → Actions):
- `WORKLOAD_IDENTITY_PROVIDER` — the full provider resource path: `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL/providers/PROVIDER`
- `WORKLOAD_IDENTITY_SERVICE_ACCOUNT` — the service account email to impersonate (e.g., `gha-deployer@PROJECT_ID.iam.gserviceaccount.com`)
- `GCP_SA_KEY` — optional: base64 or JSON service account key if you prefer key-based auth instead of OIDC
- `FIREBASE_SERVICE_ACCOUNT` — optional: older workflows may expect this; include if used by your actions
- `FIREBASE_PROJECT_ID` — your Firebase project id (e.g., `royalcarriagelimoseo`)

6. Test the workflow by pushing to `main` or using `workflow_dispatch`.

Scripts:
- See `scripts/setup-workload-identity.sh` for a templated script to run the steps above (edit before running).
- See `scripts/encode-sa-secret.sh` to base64-encode a JSON key if you prefer the service-account secret method.
