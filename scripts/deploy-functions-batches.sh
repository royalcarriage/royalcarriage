#!/usr/bin/env bash
# Deploy Firebase functions in staggered batches to avoid quota and IAM throttling

set -euo pipefail

PROJECT=${1:-royalcarriagelimoseo}
REGION=us-central1
BATCH_SIZE=${2:-10}

echo "Listing functions for project $PROJECT..."
FUNCTIONS=()
while IFS= read -r line; do
  # skip header lines and empty lines
  if [ -z "$line" ]; then
    continue
  fi
  # extract function name (first column)
  name=$(echo "$line" | awk '{print $1}')
  # skip table header lines
  if [ "$name" = "Function" ] || [ "$name" = "---" ]; then
    continue
  fi
  FUNCTIONS+=("$name")
done < <(firebase functions:list --project "$PROJECT" 2>/dev/null)

if [ ${#FUNCTIONS[@]} -eq 0 ]; then
  echo "No functions found or firebase CLI returned none. Exiting."
  exit 1
fi

echo "Found ${#FUNCTIONS[@]} functions. Deploying in batches of $BATCH_SIZE..."

i=0
total=${#FUNCTIONS[@]}
while [ $i -lt $total ]; do
  batch=()
  for j in $(seq 0 $((BATCH_SIZE-1))); do
    idx=$((i+j))
    if [ $idx -ge $total ]; then
      break
    fi
    batch+=("${FUNCTIONS[$idx]}")
  done
  join=$(IFS=, ; echo "${batch[*]}")
  echo "Deploying batch $((i/BATCH_SIZE+1)): ${join}"
  firebase deploy --only functions:$join --project "$PROJECT"
  echo "Sleeping 10s to avoid quota spikes..."
  sleep 10
  i=$((i+BATCH_SIZE))
done

echo "All batches deployed."
