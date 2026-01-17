#!/usr/bin/env bash
# Safe cleanup for Artifact Registry Docker images
# Usage:
#  ./scripts/clean-artifact-registry.sh <LOCATION> <REPOSITORY> [--days N] [--confirm]
# Example:
#  ./scripts/clean-artifact-registry.sh us-central1 gcf-artifacts --days 30 --confirm

set -euo pipefail

LOCATION=${1:-us-central1}
REPO=${2:-gcf-artifacts}
DAYS=${3:---days}
CONFIRM=false

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  sed -n '1,120p' "$0"
  exit 0
fi

# parse optional args
shift 2 || true
while [ $# -gt 0 ]; do
  case "$1" in
    --days)
      DAYS_VAL=${2:-30}
      shift 2
      ;;
    --confirm)
      CONFIRM=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

DAYS_VAL=${DAYS_VAL:-30}
PROJECT=$(gcloud config get-value project 2>/dev/null || echo "royalcarriagelimoseo")
REPO_PATH="${LOCATION}-docker.pkg.dev/${PROJECT}/${REPO}"

echo "Artifact Registry repo: $REPO_PATH"
echo "Dry-run: listing images older than $DAYS_VAL days (no deletion unless --confirm supplied)"

THRESHOLD_DATE=$(date -v -${DAYS_VAL}d +%s 2>/dev/null || date -d "${DAYS_VAL} days ago" +%s)

gcloud artifacts docker images list $REPO_PATH --project="$PROJECT" --limit=1000 --format="get(digest,createTime,updateTime,images)" | while IFS=$'\t' read -r digest createTime updateTime images; do
  # convert createTime to epoch
  createEpoch=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$createTime" +%s 2>/dev/null || date -d "$createTime" +%s 2>/dev/null || echo 0)
  if [ "$createEpoch" -eq 0 ]; then
    continue
  fi
  if [ $createEpoch -lt $THRESHOLD_DATE ]; then
    echo "Candidate: $REPO_PATH@$digest  created:$createTime  tags:$images"
    if [ "$CONFIRM" = true ]; then
      echo "Deleting $REPO_PATH@$digest"
      gcloud artifacts docker images delete "$REPO_PATH@$digest" --project="$PROJECT" --quiet || echo "Failed to delete $digest"
    fi
  fi
done

echo "Done."
