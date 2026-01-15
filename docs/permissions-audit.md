# Permissions & Deployment Audit

Date: 2026-01-15

## Summary
- Quick repo scan found no committed JSON service-account keys (good).
- Several CI/deploy references and docs mention `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`, and `FIREBASE_TOKEN`.
- GitHub Actions workflows do not appear to expose long-lived secrets in the repo files, but workflows should be audited to prefer OIDC where possible.

## Findings
- Remote branches cleaned (copilot/*) — see git history for deletions performed.
- Files referencing deployment/env keys:
  - `./client/src/components/admin/DeployDashboard.tsx` references `FIREBASE_PROJECT_ID`.
  - `./reports/repo-audit.md` documents `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_PROJECT_ID`.

## Recommendations / Next actions
1. Create a dedicated GCP service account for CI with the minimal roles required (prefer least-privilege). Suggested roles:
   - `roles/firebase.admin` (or `firebasehosting.admin` + `cloudfunctions.admin` as applicable)
   - `roles/storage.admin` (if deploy or functions write to Storage)
   - `roles/datastore.user` / Firestore roles as needed
2. Prefer Workload Identity Federation (OIDC) via `google-github-actions/auth` instead of storing JSON keys in GitHub secrets.
3. If using a service account key JSON, store it as a repository or organization secret (e.g., `GCLOUD_SERVICE_KEY` or `FIREBASE_SERVICE_ACCOUNT`) and restrict usage to CI workflows that need it.
4. For `firebase-tools` deploys you can use a `FIREBASE_TOKEN` (shorter-lived) or OIDC flow; add it as a repo secret if chosen.
5. Ensure branch protection on `main` enforces PRs, required status checks, and required reviewers to prevent direct force-pushes.
6. In GitHub Actions workflows, set `permissions:` minimally and `permissions: id-token: write` for OIDC flows.

## How to set up CI deploy (recommended, OIDC)
1. In GCP create service account `github-actions-deployer@<project>.iam.gserviceaccount.com` and grant required roles.
2. In IAM enable Workload Identity Federation and configure a provider for GitHub.
3. In GitHub Actions workflows, use `google-github-actions/auth@v1` with `workload_identity_provider` and `service_account` values; remove JSON-key usage.

## How to set up CI deploy (alternative, JSON key)
1. Create a service account and generate a JSON key.
2. Add the key to GitHub as a secret named `GCLOUD_SERVICE_KEY` (or `FIREBASE_SERVICE_ACCOUNT`).
3. Update deploy workflows to load the secret and authenticate (e.g., `gcloud auth activate-service-account --key-file=/tmp/key.json`).

---

If you want I can:
- open a PR with this audit file (branch `audit/permissions-20260115`),
- attempt to configure Workload Identity instructions for your repo's workflows, or
- run further checks (CI run, dependency install) — tell me which.
