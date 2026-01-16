# Deployment Actions and Next Steps

What I changed locally:

- Added Cloud Function `hostRedirector` in `functions/src/index.ts` and built functions; exported as `hostRedirector`.
- Updated `firebase.json` for the `admin` hosting target to add a rewrite for `/` to call the `hostRedirector` function.
- Built functions (`npm --prefix functions run build`) and verified `lib/index.js` contains `hostRedirector` export.

Files created/modified:

- `functions/src/index.ts` (updated — added `hostRedirector`)
- `functions/src/hostRedirector.mjs` (added, not required after build but kept)
- `functions/lib/index.js` (built artifact)
- `firebase.json` (updated rewrite for `/` to call function)
- Reports saved under `/reports` (build output and API attempt results).

What I attempted to run:

- `firebase deploy --only functions:hostRedirector --project royalcarriagelimoseo`
  - Result: The deploy attempt failed locally due to a Node.js/depd error coming from local environment during the Firebase CLI run. Details saved to `/reports/deploy-functions-hostRedirector.txt`.

- Hosting domains list via API:
  - Command used:
    ```bash
    TOKEN=$(gcloud auth print-access-token)
    curl -sS -H "Authorization: Bearer $TOKEN" \
      "https://firebasehosting.googleapis.com/v1beta1/projects/-/sites/royalcarriagelimoseo/domains" \
      -o /Users/admin/VSCODE/reports/hosting-domains.json
    ```
  - Result: API returned PERMISSION_DENIED because Application Default Credentials used locally did not set a quota project. See `/reports/hosting-domains.json` for raw response.

Why these failed and how to fix (exact steps):

1) Fix local Firebase deploy errors (recommended):
   - Ensure you are logged into the Firebase CLI with an account that has Owner/Editor rights on the project:
     ```bash
     firebase login --interactive
     firebase projects:list
     firebase use royalcarriagelimoseo
     ```
   - Then deploy the function:
     ```bash
     firebase deploy --only functions:hostRedirector --project royalcarriagelimoseo
     ```
   - If `firebase deploy` errors with Node/depd stack traces, try upgrading/downgrading the local `firebase-tools` to a stable version (e.g., `npm install -g firebase-tools@13.16.0`) and retry.

2) If you prefer to use service account / non-interactive deploy from CI:
   - Create a service account with roles: `roles/cloudfunctions.developer`, `roles/iam.serviceAccountUser`, `roles/viewer` (or `roles/editor`) and `roles/firebase.admin` if needed.
   - Create a JSON key and set `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json` or set `credentials_json` in GitHub Actions.
   - Deploy with:
     ```bash
     gcloud auth activate-service-account --key-file=/path/to/key.json
     firebase deploy --only functions:hostRedirector --project royalcarriagelimoseo
     ```

3) Fix Hosting API quota project error (for API calls using ADC):
   - When using Application Default Credentials (e.g., service account or `gcloud auth application-default login`), include a quota project or use an access token from `gcloud auth print-access-token` tied to a project that has the Hosting API enabled.
   - Quick approach (recommended for manual steps): use `gcloud auth print-access-token` (as done) but ensure the account's project has `firebasehosting.googleapis.com` enabled and the calling identity has permissions.
   - Console alternative: open Firebase Console -> Hosting -> Sites -> select site and inspect Custom Domain list.

Manual steps you may need to finish in the Console (Firebase Hosting + Auth):

- Verify/Add custom domain:
  1. Open https://console.firebase.google.com
  2. Select project `royalcarriagelimoseo`.
  3. Go to Hosting -> Sites -> select site `royalcarriagelimoseo`.
  4. Add custom domain `admin.royalcarriagelimo.com` (if not already added). Follow DNS verification steps and provision SSL.

- Ensure authorized domains for Firebase Auth (if you enable Firebase Auth for admin):
  1. Go to Authentication -> Sign-in method -> Authorized domains.
  2. Add `admin.royalcarriagelimo.com` and the default firebase domains if desired.

- Deploy function from a machine with working Firebase CLI auth or CI with a GCP service account. After successful deploy, verify the function in Cloud Functions and then run a quick curl to the root path of a default domain to confirm redirect:
  ```bash
  curl -I https://royalcarriagelimoseo.web.app/
  # Should return a 301 Location: https://admin.royalcarriagelimo.com/
  ```

Notes/risks:
- The rewrite we added routes only `/` to the `hostRedirector`. Other paths (e.g., `/some/page`) will still serve static content on the default site. If you want all paths to redirect, we can change the rewrite to `"source": "**"` and update the function to proxy static content for admin host; this is more complex and may impact SEO/content serving.
- Because the admin app currently uses Passport local auth, no immediate Firebase Auth domain changes are required unless you switch to Firebase Auth for admin.

Next actions I can take now (pick one):
- Attempt the deploy again using a specific `firebase-tools` version and captured logs.
- Open a PR with the changes (`firebase.json`, `functions/*`) and include these reports.
- Implement full-path redirect behavior (rewrite `**` to function) and make the function serve static content for admin host (more work + careful testing).
- Add automated Playwright smoke test for admin login (requires test credentials).

I can proceed with whichever of these you choose. If you want me to retry deployment here, provide either interactive Firebase credentials or confirm I should use a provided service account key (never paste secrets here; provide path on the machine if already present).

---

CI workflow added:

- File: `.github/workflows/deploy-hosting-redirect.yml` — builds `functions`, deploys `functions:hostRedirector`, deploys `hosting:admin`, and lists hosting domains for verification.

How to use the workflow:

1. Add one of these auth methods to repository secrets:
  - Workload Identity (recommended): `WORKLOAD_IDENTITY_PROVIDER`, `WORKLOAD_IDENTITY_SERVICE_ACCOUNT`
  - OR Service Account key: `GCP_SA_KEY` (JSON)
2. Push this branch and run the `Deploy host redirect + Hosting` workflow from the Actions tab.
3. Inspect job logs — the workflow will attempt to list hosting domains after deploy so you can confirm `admin.royalcarriagelimo.com` is attached (or follow the console DNS steps to attach it).

If you want, I can open a PR with these changes and include a short checklist for running the workflow and DNS verification.