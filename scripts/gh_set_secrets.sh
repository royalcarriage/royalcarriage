#!/usr/bin/env bash
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

read -p "Path to SSH private key (default: $PRIVATE_KEY_FILE): " inputpath
if [ -n "$inputpath" ]; then PRIVATE_KEY_FILE="$inputpath"; fi

if [ -f "$PRIVATE_KEY_FILE" ]; then
  SSH_PRIVATE_KEY_VALUE="$(cat "$PRIVATE_KEY_FILE")"
else
  SSH_PRIVATE_KEY_VALUE=""
fi

read -p "SSH user (deploy user) [deploy]: " ssh_user
ssh_user=${ssh_user:-deploy}
read -p "SSH host (example.com): " ssh_host
read -p "SSH port [22]: " ssh_port
ssh_port=${ssh_port:-22}
read -p "SSH remote dir (/var/www/site): " ssh_remote_dir

read -p "Firebase token (leave blank to skip): " firebase_token
read -p "Firebase project id (leave blank to skip): " firebase_project
read -p "Claude/Anthropic API key (leave blank to skip): " claude_key

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
