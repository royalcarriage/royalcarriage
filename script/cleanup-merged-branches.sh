#!/usr/bin/env bash
set -euo pipefail

# Remove remote-tracking branches that are fully merged into main.
DEFAULT_REMOTE="${1:-origin}"

echo "Fetching latest refs..."
git fetch --prune "$DEFAULT_REMOTE"

echo "Deleting merged remote branches..."
git branch -r --merged "$DEFAULT_REMOTE/main" \
  | grep "$DEFAULT_REMOTE/" \
  | grep -vE "$DEFAULT_REMOTE/(main|HEAD)" \
  | sed "s#^ *$DEFAULT_REMOTE/##" \
  | while read -r branch; do
      echo "Deleting $DEFAULT_REMOTE/$branch"
      git push "$DEFAULT_REMOTE" ":$branch" || true
    done

echo "Done. Remaining branches:"
git branch -r
