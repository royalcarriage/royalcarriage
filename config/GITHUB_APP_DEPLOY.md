Deploy using a dedicated GitHub App (deploy-only)

This guide explains how to create a GitHub App with minimal permissions for performing automated deploys from Actions.

Overview

- Create a GitHub App and limit its permissions to the minimum required for the job (e.g., repository contents read, pull-requests write if you need merge ability).
- Install the App into the repository (or organization) and note the installation id.
- Generate and download the App private key. Store the key and metadata as repository secrets:
  - `GITHUB_APP_ID` (numeric App ID)
  - `GITHUB_APP_PRIVATE_KEY` (PEM, the private key file contents)
  - `GITHUB_APP_INSTALLATION_ID` (numeric installation id)

Permissions recommendation

- Repository permissions (least privilege):
  - Contents: Read (or Read & Write only if you need to push commits during deploy)
  - Pull requests: Read (and Write only if you want the App to merge PRs)
  - Actions: Read (so the App can view workflows)

- Webhook events: none required for this workflow — we run on push.

Create the App

1. Go to GitHub → Settings → Developer settings → GitHub Apps → New GitHub App.
2. Fill in a name like "royalcarriage-deploy" and a short description.
3. Set the repository permissions according to the recommendation above.
4. Set the `Webhook URL` and `Webhook secret` blank (not required for our CI flow).
5. Create the App and then Install it into your repository (or organization). When installing, note the "Installation ID".
6. Under the App page, generate a private key and download it (a `.pem` file). Also note the numeric App ID displayed on the App settings page.

Add secrets to the repository

- Store the private key contents into the repository secret `GITHUB_APP_PRIVATE_KEY`.
- Store the App id and installation id into `GITHUB_APP_ID` and `GITHUB_APP_INSTALLATION_ID` respectively.

Using the provided workflow

- The workflow added at `.github/workflows/deploy-github-app.yml` does the following:
  - Creates a signed JWT using the App private key.
  - Calls the GitHub API to exchange the JWT for an installation access token.
  - Masks and sets the installation token in the workflow environment and uses it to `actions/checkout`.
  - Runs build and deploy steps (Firebase deploy step still requires `FIREBASE_TOKEN` if using Firebase).

Why use a GitHub App?

- GitHub Apps give fine-grained permissions and are easier to limit to a dedicated deploy role than reusing personal PATs.
- The private key can be rotated and revoked at any time.

Security notes

- Keep the private key secure and store only in GitHub Secrets.
- Limit the App's permissions to the minimum required.
- Prefer using cloud provider OIDC where possible (e.g., GCP/Azure) to avoid long-lived secrets for deploying to cloud resources.

If you want, I can:
- Provide a script to create the App automatically via the GitHub API (requires a user PAT with appropriate rights), or
- Adjust the workflow to use OIDC for your cloud provider instead of a GitHub App.
