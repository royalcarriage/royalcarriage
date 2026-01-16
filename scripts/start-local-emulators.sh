#!/usr/bin/env bash
# Start Firebase emulators for local development with env loading
# Usage: ./scripts/start-local-emulators.sh [.env.local]

set -euo pipefail
ENV_FILE=${1:-.env.local}

if [ -f "$ENV_FILE" ]; then
  echo "Loading environment from $ENV_FILE"
  # export variables from file (ignores comments and blank lines)
  set -a
  # shellcheck disable=SC1090
  source <(grep -v '^\s*#' "$ENV_FILE" | sed -n 's/^\s*\([^=]\+\)=\(.*\)$/export \1=\2/p')
  set +a
else
  echo "No $ENV_FILE found — using current environment"
fi

echo "Starting Firebase emulators (functions, hosting)..."
# Ensure firebase cli is available
if ! command -v firebase >/dev/null 2>&1; then
  echo "firebase CLI not found. Install: npm i -g firebase-tools"
  exit 1
fi

# Start emulators
firebase emulators:start --only functions,hosting
