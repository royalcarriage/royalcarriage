#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 path/to/service-account.json"
  exit 2
fi

FILE="$1"
if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 2
fi

if command -v base64 >/dev/null 2>&1; then
  base64 -w 0 "$FILE" | tr -d '\n'
else
  # macOS base64 uses different flags
  base64 "$FILE" | tr -d '\n'
fi
