#!/usr/bin/env bash
set -euo pipefail

echo "This script is a template to create a Workload Identity Pool, provider, and bind a service account for GitHub Actions."
echo "Edit the variables below before running."

# === Edit these ===
PROJECT_ID="your-project-id"
PROJECT_NUMBER="your-project-number"
POOL_ID="github-pool"
PROVIDER_ID="github-provider"
SERVICE_ACCOUNT_NAME="gha-deployer"
REPO_OWNER="royalcarriage"
REPO_NAME="royalcarriage"
# ==================

gcloud auth login

echo "Creating workload identity pool..."
gcloud iam workload-identity-pools create "$POOL_ID" \
  --project="$PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions pool"

echo "Creating OIDC provider..."
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="$POOL_ID" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --allowed-audiences="https://gh"

SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "Creating service account: $SERVICE_ACCOUNT_EMAIL"
gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" --project="$PROJECT_ID" --display-name="GitHub Actions Deployer"

echo "Grant firebase hosting admin role to service account"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/firebase.hostingAdmin"

echo "Allow workload identity pool to impersonate the service account (restrict by repository)."
PRINCIPAL="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/$REPO_OWNER/$REPO_NAME"
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_EMAIL" \
  --project="$PROJECT_ID" \
  --role roles/iam.workloadIdentityUser \
  --member "$PRINCIPAL"

echo "Output the provider resource path to set as GitHub secret WORKLOAD_IDENTITY_PROVIDER"
echo "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/providers/$PROVIDER_ID"
echo "Set SERVICE_ACCOUNT_EMAIL to $SERVICE_ACCOUNT_EMAIL"
#!/usr/bin/env bash
set -euo pipefail

if [[ "${BASH_SOURCE[0]}" == "$0" && $# -eq 0 ]]; then
  cat <<'USAGE'
Usage: setup-workload-identity.sh --project PROJECT_ID --project-number PROJECT_NUMBER --owner GITHUB_OWNER --repo GITHUB_REPO [--service-account-name SA_NAME] [--pool-id POOL_ID] [--provider-id PROVIDER_ID]

Creates a Google Cloud service account, Workload Identity Pool and OIDC provider for GitHub Actions.

Examples:
  setup-workload-identity.sh --project my-gcp-project --project-number 123456789012 --owner royalcarriage --repo website
USAGE
  exit 1
fi

PROJECT=""
PROJECT_NUMBER=""
GITHUB_OWNER=""
GITHUB_REPO=""
SA_NAME="github-deployer"
POOL_ID="github-pool"
PROVIDER_ID="github-provider"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJECT="$2"; shift 2;;
    --project-number) PROJECT_NUMBER="$2"; shift 2;;
    --owner) GITHUB_OWNER="$2"; shift 2;;
    --repo) GITHUB_REPO="$2"; shift 2;;
    --service-account-name) SA_NAME="$2"; shift 2;;
    --pool-id) POOL_ID="$2"; shift 2;;
    --provider-id) PROVIDER_ID="$2"; shift 2;;
    -h|--help) echo "See usage"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [[ -z "$PROJECT" || -z "$PROJECT_NUMBER" || -z "$GITHUB_OWNER" || -z "$GITHUB_REPO" ]]; then
  echo "Missing required args. Run with --help for usage." >&2
  exit 2
fi

SA_EMAIL="$SA_NAME@$PROJECT.iam.gserviceaccount.com"

echo "Project: $PROJECT"
echo "Project number: $PROJECT_NUMBER"
echo "GitHub owner: $GITHUB_OWNER"
echo "GitHub repo: $GITHUB_REPO"
echo "Service account: $SA_EMAIL"
echo "Pool ID: $POOL_ID"
echo "Provider ID: $PROVIDER_ID"

echo "Creating service account (if not exists)..."
gcloud iam service-accounts create "$SA_NAME" --project="$PROJECT" --display-name="GitHub Actions Deployer" || true

echo "Assigning roles to service account..."
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA_EMAIL" --role="roles/firebase.admin" || true
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA_EMAIL" --role="roles/storage.admin" || true

echo "Creating Workload Identity Pool (if not exists)..."
gcloud iam workload-identity-pools create "$POOL_ID" --project="$PROJECT" --location="global" --display-name="GitHub Actions Pool" || true

echo "Creating OIDC provider (if not exists)..."
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
  --project="$PROJECT" --location="global" --workload-identity-pool="$POOL_ID" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --allowed-audiences="https://github.com/$GITHUB_OWNER" || true

echo "Binding Workload Identity provider to service account..."
WIF_PRINCIPAL="principal://iam.googleapis.com/projects/$PROJECT/locations/global/workloadIdentityPools/$POOL_ID/subject/*"
gcloud iam service-accounts add-iam-policy-binding "$SA_EMAIL" --project="$PROJECT" \
  --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/$PROJECT/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/$GITHUB_OWNER/$GITHUB_REPO" || true

WIF_PROVIDER="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/providers/$PROVIDER_ID"

echo
echo "Done. Add the following repository/organization secrets in GitHub:"
echo "- WORKLOAD_IDENTITY_PROVIDER=$WIF_PROVIDER"
echo "- WORKLOAD_IDENTITY_SERVICE_ACCOUNT=$SA_EMAIL"

echo
echo "Example workflow auth step (use in GitHub Actions):"
cat <<EOF
- name: Authenticate to GCP
  uses: google-github-actions/auth@v1
  with:
    workload_identity_provider: $WIF_PROVIDER
    service_account_email: $SA_EMAIL
EOF

exit 0
