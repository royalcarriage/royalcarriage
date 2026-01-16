#!/bin/bash
# Delete stale branches
# This script removes old feature branches that are no longer needed

echo "🧹 Cleaning up stale branches..."
echo ""

BRANCHES_TO_DELETE=(
  "ai/add-tracing-20260114T211526Z"
  "ai/admin-firestore-fixes-20260114T210256Z"
  "ai/agent-integration"
  "ai/integration-sync"
  "ai/local-work-20260114T234540Z"
  "ai/pr-bodies-20260114T211630Z"
  "ai/storage-rules-deploy-20260114T210025Z"
  "audit/permissions-20260115"
  "ci/oidc-workflows"
  "copilot/sub-pr-30"
  "copilot/sub-pr-30-again"
  "copilot/sub-pr-30-another-one"
  "copilot/sub-pr-30-one-more-time"
  "copilot/sub-pr-30-please-work"
  "copilot/sub-pr-30-yet-again"
  "copilot/sub-pr-30-7bf297f3-6f3b-4542-8c98-2c9aae768582"
  "copilot/sub-pr-30-9c002608-8b8c-4219-afd7-e2e8fec1e49d"
  "copilot/sub-pr-30-a875f752-a85a-4e6a-a9d4-7b80bf406024"
  "copilot/sub-pr-30-e7cb2274-f7b6-4414-8824-54b0a2e88387"
  "copilot/add-kpi-dashboard-component"
  "copilot/audit-google-cloud-settings"
  "copilot/consolidate-merge-ready-pr"
  "copilot/finalize-admin-dashboard-deployment"
  "copilot/implement-admin-dashboard"
  "copilot/implement-ai-seo-system"
  "copilot/implement-csv-import-workflows"
  "copilot/implement-firestore-rules-functions-ui"
  "copilot/rebase-ci-oidc-workflows"
  "copilot/update-documentation-for-usage"
)

SUCCESS_COUNT=0
FAILED_COUNT=0
NOT_FOUND_COUNT=0

for branch in "${BRANCHES_TO_DELETE[@]}"; do
  echo "Attempting to delete: $branch"
  
  # Try to delete the remote branch
  if git push origin --delete "$branch" 2>/dev/null; then
    echo "  ✅ Successfully deleted: $branch"
    ((SUCCESS_COUNT++))
  else
    # Check if branch exists locally or remotely
    if git show-ref --verify --quiet "refs/remotes/origin/$branch" || git show-ref --verify --quiet "refs/heads/$branch"; then
      echo "  ❌ Failed to delete: $branch (may require permissions)"
      ((FAILED_COUNT++))
    else
      echo "  ℹ️  Branch not found: $branch (already deleted)"
      ((NOT_FOUND_COUNT++))
    fi
  fi
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Cleanup Summary:"
echo "  ✅ Deleted: $SUCCESS_COUNT"
echo "  ❌ Failed: $FAILED_COUNT"
echo "  ℹ️  Not Found: $NOT_FOUND_COUNT"
echo "  📊 Total: ${#BRANCHES_TO_DELETE[@]}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILED_COUNT -gt 0 ]; then
  echo "⚠️  Some branches could not be deleted. You may need:"
  echo "   - Repository admin permissions"
  echo "   - To manually delete protected branches"
  echo ""
fi

echo "✨ Cleanup complete!"
