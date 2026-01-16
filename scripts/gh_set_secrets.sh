Here I amAlways#!/usr/bin/env bash
# Helper to set common repository secrets via the `gh` CLI.
# Run locally (not in CI). Requires `gh` authenticated and the private key file readable.

set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
PRIVATE_KEY_FILE="${PRIVATE_KEY_FILE:-$HOME/.ssh/deploy_key}"

echo "Using repo: $REPO"

# Helper function
set_secret() {
  name="$1"
  value="$2"
  if [ -z "$value" ]; then
    echo "Skipping $name (empty)"
    return
  fi
  echo "Setting secret $name"
  gh secret set "$name" --body "$value"
}

# Path to SSH private key can be set via PRIVATE_KEY_FILE env var.
# Default is $HOME/.ssh/deploy_key
PRIVATE_KEY_FILE=${PRIVATE_KEY_FILE:-$HOME/.ssh/deploy_key}

echo "Using private key file: $PRIVATE_KEY_FILE"

if [ -f "$PRIVATE_KEY_FILE" ]; then
  SSH_PRIVATE_KEY_VALUE="$(cat "$PRIVATE_KEY_FILE")"
else
  echo "Warning: Private key file not found at $PRIVATE_KEY_FILE. SSH_PRIVATE_KEY will be empty."
  SSH_PRIVATE_KEY_VALUE=""
fi

# Values are read from environment variables.
# Example: export SSH_USER=deploy
ssh_user=${SSH_USER:-deploy}
ssh_host=${SSH_HOST:-}
ssh_port=${SSH_PORT:-22}
ssh_remote_dir=${SSH_REMOTE_DIR:-}

firebase_token=${FIREBASE_TOKEN:-}
firebase_project=${FIREBASE_PROJECT:-}
claude_key=${CLAUDE_API_KEY:-}

# Set secrets
set_secret SSH_PRIVATE_KEY "$SSH_PRIVATE_KEY_VALUE"
set_secret SSH_USER "$ssh_user"
set_secret SSH_HOST "$ssh_host"
set_secret SSH_PORT "$ssh_port"
set_secret SSH_REMOTE_DIR "$ssh_remote_dir"
set_secret FIREBASE_TOKEN "$firebase_token"
set_secret FIREBASE_PROJECT "$firebase_project"
set_secret CLAUDE_API_KEY "$claude_key"

echo "Done. Secrets set for $REPO (verify in GitHub settings)."
