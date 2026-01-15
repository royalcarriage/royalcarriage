# Service Account Setup for AI agent

Create a service account with minimal roles for Firebase Hosting discovery and Firestore access.

Example gcloud commands (replace `PROJECT_ID`):

```bash
PROJECT=PROJECT_ID
SA_NAME=ai-agent
# Create service account
gcloud iam service-accounts create $SA_NAME --display-name="AI Agent Service Account" --project="$PROJECT"

# Grant roles: Hosting Admin (to list custom domains) and Firestore Viewer/Editor depending on needs
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA_NAME@$PROJECT.iam.gserviceaccount.com" --role="roles/firebasehosting.admin"
# For Firestore read/write
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA_NAME@$PROJECT.iam.gserviceaccount.com" --role="roles/datastore.user"

# Create and download key (store securely)
gcloud iam service-accounts keys create ~/${SA_NAME}-key.json --iam-account=$SA_NAME@$PROJECT.iam.gserviceaccount.com --project="$PROJECT"

# Set environment variable for local development
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/${SA_NAME}-key.json"
```

Security notes:
- Do not commit the JSON key to git.
- Use Secret Manager or CI secrets to store keys in production.
- Prefer narrow roles and rotate keys regularly.
