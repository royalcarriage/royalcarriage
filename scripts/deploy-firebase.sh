#!/usr/bin/env bash
set -euo pipefail

if [ -z "${GCP_SA_KEY:-}" ]; then
  echo "GCP_SA_KEY not set. Set it to base64-encoded service account JSON."
  exit 1
fi

echo "$GCP_SA_KEY" | base64 --decode > /tmp/gcp-key.json
export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-key.json

if [ -z "${FIREBASE_PROJECT_ID:-}" ]; then
  echo "FIREBASE_PROJECT_ID not set"
  exit 1
fi

npm install -g firebase-tools
firebase deploy --project "$FIREBASE_PROJECT_ID" --only hosting --non-interactive
