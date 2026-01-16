#!/usr/bin/env bash
set -euo pipefail

# Usage:
# GITHUB_OWNER=royalcarriage GITHUB_REPO=royalcarriage \
#   ./scripts/create-github-secrets.sh \
#   --workload-provider "projects/12345/locations/global/workloadIdentityPools/pool/providers/prov" \
#   --service-account "gha-deployer@project.iam.gserviceaccount.com" \
#   --project-id "royalcarriagelimoseo" \
#   --gcp-sa-key-file ./sa.json

OWNER=${GITHUB_OWNER:-}
REPO=${GITHUB_REPO:-}

if [ -z "$OWNER" ] || [ -z "$REPO" ]; then
  echo "Set GITHUB_OWNER and GITHUB_REPO environment variables or export before running." >&2
  exit 2
fi

WORKLOAD_PROVIDER=""
SERVICE_ACCOUNT_EMAIL=""
FIREBASE_PROJECT_ID=""
GCP_SA_KEY_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --workload-provider) WORKLOAD_PROVIDER="$2"; shift 2;;
    --service-account) SERVICE_ACCOUNT_EMAIL="$2"; shift 2;;
    --project-id) FIREBASE_PROJECT_ID="$2"; shift 2;;
    --gcp-sa-key-file) GCP_SA_KEY_FILE="$2"; shift 2;;
    -h|--help) echo "Usage: $0 --workload-provider PROVIDER --service-account SA_EMAIL --project-id PROJECT_ID [--gcp-sa-key-file sa.json]"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [ -z "$WORKLOAD_PROVIDER" ] || [ -z "$SERVICE_ACCOUNT_EMAIL" ] || [ -z "$FIREBASE_PROJECT_ID" ]; then
  echo "Missing required args. See --help." >&2
  exit 2
fi

echo "Will create/update secrets in $OWNER/$REPO:"
echo " - WORKLOAD_IDENTITY_PROVIDER=$WORKLOAD_PROVIDER"
echo " - WORKLOAD_IDENTITY_SERVICE_ACCOUNT=$SERVICE_ACCOUNT_EMAIL"
echo " - FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID"
if [ -n "$GCP_SA_KEY_FILE" ]; then
  echo " - GCP_SA_KEY_FILE=$GCP_SA_KEY_FILE (will be uploaded as GCP_SA_KEY)"
fi

set_secret_via_gh() {
  local name=$1
  local value=$2
  if command -v gh >/dev/null 2>&1; then
    echo "$value" | gh secret set "$name" --body - -R "$OWNER/$REPO"
  else
    if [ -z "${GITHUB_TOKEN:-}" ]; then
      echo "gh CLI not found and GITHUB_TOKEN not set; cannot set secrets programmatically." >&2
      exit 3
    fi
    # Use GitHub REST API to create/update secret via libsodium: use gh if possible; otherwise, instruct user.
    echo "gh CLI not installed. Please install GitHub CLI or set secrets manually with GITHUB_TOKEN." >&2
    exit 3
  fi
}

set_secret_via_gh WORKLOAD_IDENTITY_PROVIDER "$WORKLOAD_PROVIDER"
set_secret_via_gh WORKLOAD_IDENTITY_SERVICE_ACCOUNT "$SERVICE_ACCOUNT_EMAIL"
set_secret_via_gh FIREBASE_PROJECT_ID "$FIREBASE_PROJECT_ID"

if [ -n "$GCP_SA_KEY_FILE" ]; then
  if [ ! -f "$GCP_SA_KEY_FILE" ]; then
    echo "GCP SA key file not found: $GCP_SA_KEY_FILE" >&2
    exit 4
  fi
  # Upload raw JSON (not base64) to secret
  set_secret_via_gh GCP_SA_KEY "$(cat "$GCP_SA_KEY_FILE")"
fi

echo "Secrets created/updated."
