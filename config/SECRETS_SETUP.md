Secrets and credentials setup

This project uses CI workflows that reference secrets and tokens. For security, DO NOT commit secrets into the repository. Add them to the repository or organization secrets via GitHub settings or the `gh` CLI.

Required secret names (examples):

- `FIREBASE_TOKEN` — CI deploy token for Firebase. Create with `firebase login:ci` on your machine and copy the token.
- `FIREBASE_PROJECT` — (optional) the Firebase project id to pass to `firebase deploy`.
- `CLAUDE_API_KEY` or `ANTHROPIC_API_KEY` — API key for Anthropic / Claude when running the agent in production.

How to add secrets (GitHub UI):

1. Go to your repository on GitHub.
2. Settings → Secrets and variables → Actions → New repository secret.
3. Enter the name (e.g. `FIREBASE_TOKEN`) and the value, then save.

How to add secrets with `gh` CLI:

```bash
gh secret set FIREBASE_TOKEN --body "$(firebase login:ci)"
gh secret set FIREBASE_PROJECT --body "your-firebase-project-id"
gh secret set CLAUDE_API_KEY --body "sk-..."
```

Generate a Firebase CI token:

```bash
npm install -g firebase-tools
firebase login:ci
# copy the printed token and save into GitHub secret FIREBASE_TOKEN
```

Permissions and branch protections

- If you want the deploy workflow to push commits or update protected branches, configure the branch protection rules to allow GitHub Actions to bypass restrictions or set a dedicated deploy service account with an appropriate token stored as a secret.
- Auto-merging PRs via the provided `automerge.yml` requires that workflows have `pull-requests: write` permission (provided in the workflow). If your repository disallows merges from workflows or requires specific review approvals, update repository settings accordingly.

Security recommendations

- Use a dedicated service account for CI/CD with the minimal permissions required.
- Rotate tokens regularly and store them only in GitHub Secrets or a secure vault.
- Avoid enabling fully automatic approvals unless you understand the security implications.

If you want, I can:
- Add example `gh` CLI commands to create all secrets at once (you must run them locally), or
- Add a more advanced deployment job that obtains short-lived credentials from a cloud provider identity provider (OIDC) instead of long-lived tokens.
