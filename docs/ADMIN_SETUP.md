# Admin setup

## Create an admin user and set custom claims

1. Create or obtain a GCP service account with Firebase Admin permissions and download the JSON key.
2. Keep the JSON key out of the repo. Prefer Secret Manager or a secure vault.
3. Run the script:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
# or pass the path directly with --serviceAccount
node scripts/create-admin.mjs --email admin@example.com --create --password 'S3cret123' --serviceAccount /path/to/service-account.json
```

4. Verify the user has custom claims via Admin SDK or Firebase Console.

## Security
- Delete any service account JSON keys from the repo and rotate the key if it was committed.
- Use `gcloud iam service-accounts keys delete <key-id>` to revoke keys when needed.
