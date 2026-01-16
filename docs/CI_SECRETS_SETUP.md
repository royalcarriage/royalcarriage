## Automating GitHub repository secrets

This helper doc explains how to upload the secrets required by the CI OIDC workflow.

Prerequisites:
- `gh` GitHub CLI installed and authenticated (preferred), or `GITHUB_TOKEN` env var set with repo admin privileges.
- `GITHUB_OWNER` and `GITHUB_REPO` env vars set, or pass them to the script.

Script: `scripts/create-github-secrets.sh`

Example:

```bash
export GITHUB_OWNER=royalcarriage
export GITHUB_REPO=royalcarriage

# If you created workload identity already, use its provider path and SA email
./scripts/create-github-secrets.sh \
  --workload-provider "projects/12345/locations/global/workloadIdentityPools/github-pool/providers/github-provider" \
  --service-account "gha-deployer@my-project.iam.gserviceaccount.com" \
  --project-id "royalcarriagelimoseo" \
  --gcp-sa-key-file ./sa.json
```

If you don't have `gh` installed, the script will instruct you to either install it or export `GITHUB_TOKEN` and update the script to call the GitHub REST API.
