SSH Deploy Key

Provided deploy key metadata:

- Repository: royalcarriage
- User: info@royalcarriagelimo.com
- Fingerprint: SHA256:PBSHISgg1GBUeQDNrcmpzwE/KUn3NA1TgMcawWQFL34
- Added on: Jan 15, 2026
- Added by: @royalcarriage
- Access: Read/write
- Never used yet

Important: Do NOT commit private keys into the repository.

How to configure GitHub Actions to use an SSH deploy key (recommended flow):

1) Add the private key as a repository secret named `SSH_PRIVATE_KEY` (or organization secret):

   - Using `gh` CLI locally:

```bash
# assuming you have the private key in ~/.ssh/deploy_key
gh secret set SSH_PRIVATE_KEY --body "$(cat ~/.ssh/deploy_key)"
gh secret set SSH_USER --body "deployuser"
gh secret set SSH_HOST --body "example.com"
gh secret set SSH_PORT --body "22"
gh secret set SSH_REMOTE_DIR --body "/var/www/site"
```

2) The repository CI pipeline will use `webfactory/ssh-agent` to install the key prior to running rsync/ssh commands (see `.github/workflows/deploy.yml`).

3) On the remote server, add the corresponding public key to the authorized keys for the `SSH_USER` account. Verify the fingerprint matches:

```bash
ssh-keygen -lf ~/.ssh/deploy_key.pub
# should display: SHA256:PBSHISgg1GBUeQDNrcmpzwE/KUn3NA1TgMcawWQFL34
```

Security recommendations

- Use a dedicated deploy account with minimal privileges.
- Limit access by IP (server firewall) and/or enforce a drop-in `authorized_keys` forced command if needed.
- Rotate deploy keys periodically and remove old/unused keys.

If you want, I can generate a `scripts/gh_set_secrets.sh` helper to set these secrets locally (it will not store any secret in the repo). Run it locally where you have the private key file.
