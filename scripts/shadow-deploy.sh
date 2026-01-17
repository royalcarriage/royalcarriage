#!/usr/bin/env bash
set -euo pipefail

# Shadow deploy to a temporary Firebase hosting channel named 'shadow'
# Usage: npm run deploy:shadow

CHANNEL_NAME="shadow"
EXPIRES="7d"

echo "Starting shadow deploy to channel: $CHANNEL_NAME"

if [ -z "${FIREBASE_TOKEN:-}" ]; then
  echo "WARNING: FIREBASE_TOKEN is not set; interactive login may be required"
fi

firebase hosting:channel:deploy "$CHANNEL_NAME" --expires "$EXPIRES" --only hosting || {
  echo "Shadow deploy failed"
  exit 1
}

echo "Shadow deploy complete. Run 'npm run smoke-check' against the printed URL to validate." 
