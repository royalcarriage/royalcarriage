# Admin App Hosting Deployment

Target domain: `royalcarriage--royalcarriagelimoseo.us-east4.hosted.app`

## What’s configured
- New GitHub workflow: `.github/workflows/apphosting-admin.yml`
  - Creates an App Hosting rollout against backend `royalcarriage` in region `us-east4` for project `royalcarriagelimoseo`.
  - Deploys Cloud Functions in the same project after the rollout is created.
  - Triggered on push to `main` touching client/functions/config files, or manually via **Run workflow** with overrides for backend/project/region.

## Prerequisites
1) Backend already exists in App Hosting with id `royalcarriage` and is wired to repo root for builds. If not, create it once:
   ```bash
   firebase apphosting:backends:create \
     --backend royalcarriage \
     --primary-region us-east4 \
     --root-dir client \
     --project royalcarriagelimoseo
   ```
   Adjust `--root-dir` if the admin frontend lives elsewhere.

2) Permissions/secrets in GitHub:
   - `WORKLOAD_IDENTITY_PROVIDER` + `WORKLOAD_IDENTITY_SERVICE_ACCOUNT` **or** `GCP_SA_KEY` with App Hosting + Cloud Functions deploy roles.
   - Optional override via workflow dispatch inputs: `backend_id`, `project_id`, `region`.

3) Firebase CLI auth is handled by the workflow; no tokens are required if Workload Identity is configured.

## Manual Run (if you want to trigger now)
1) Go to Actions → “Deploy Admin via App Hosting”.
2) Click “Run workflow”.
3) Leave defaults or set:
   - `backend_id`: `royalcarriage`
   - `project_id`: `royalcarriagelimoseo`
   - `region`: `us-east4`
4) The workflow will:
   - Create a rollout pointing to the current commit.
   - Deploy Cloud Functions to the same project.

## Notes
- The rollout assumes the backend is already connected to this GitHub repo in App Hosting; otherwise, the rollout command will fail and the logs will show the missing connection.
- Functions deploy uses the latest code from `functions/` (Node 20 runtime).
- If you add a staging backend, run the workflow with the staging backend id/project id via dispatch inputs.
