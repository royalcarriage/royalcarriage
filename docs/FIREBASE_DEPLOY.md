# Firebase Deployment & Environment Setup

This document describes the minimal steps and environment variables required to run and deploy the admin dashboard and functions that use Firebase.

Required environment variables for client apps (Next/Vercel/Netlify):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (optional)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (optional)
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

Server / Functions (Cloud Functions runtime or CI deploy):

- Prefer using Cloud runtime default credentials (no additional env needed).
- For local development or CI, set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of a service account JSON file.

Steps to enable Google sign-in (Firebase Console):

1. Open Firebase Console → Authentication → Sign-in method.
2. Enable `Google` provider.
3. Add authorized domains (e.g., `localhost`, your production domain, and any preview host domains).

Deploy commands (using Firebase CLI):

```bash
# Deploy functions and hosting
firebase deploy --only functions,hosting

# Deploy only functions
firebase deploy --only functions

# Start local emulators (see docs/FIREBASE_LOCAL_SETUP.md)
./scripts/start-local-emulators.sh .env.local
```

CI / GitHub Actions

- Add the service account JSON as a secret or use Workload Identity / default service account in the cloud runner.
- Add the `NEXT_PUBLIC_FIREBASE_*` values as repository environment secrets for the hosting job.

Security notes

- Do not commit `.env.local` or service account files.
- Use least-privilege service accounts for deployments.

If you want, I can create a GitHub Actions workflow snippet that sets the env vars and deploys automatically.
