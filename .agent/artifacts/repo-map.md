# Repo Map (2026-01-15)

## Top-Level

- apps: admin (Next/React), airport/corporate/partybus/wedding (Astro sites with public image manifests), other client assets.
- packages: astro-components, astro-utils, content, integrations (google-adk-bso), types.
- server: Express/TS (`server/index.ts`, build via `script/build.ts`), shared schema (`shared/schema.ts`).
- functions: Firebase Functions (Node 20) with index/rate-limiter/backup-service/deployImages/org-rbac.
- firebase.json + firestore.rules + storage.rules present; hosting targets for multiple microsites.
- tests: Vitest config (`vitest.config.ts`), test folder; playwright configs present in history.

## Tooling / Scripts

- Root scripts: `dev` (Express server via tsx), `build` (tsx script/build.ts), `start` (dist), `check` (tsc). No consolidated gates script in root.
- Functions scripts: build/serve/shell/deploy/logs (in `functions/package.json`).
- Deploy helper: `deploy.sh`; Firebase hosting multiple targets.

## Key Frameworks

- Frontend: React 18 + Vite; Astro for microsites; Radix UI components.
- Backend: Express with Drizzle ORM; Firebase Admin/Functions; Google Cloud Vertex/AI Platform client libs.
- Styling: TailwindCSS + typography plugin; animate helpers.

## Firebase/GCP

- firebase.json defines functions + hosting targets admin/airport/corporate/wedding/partybus; Firestore/Storage rules paths; emulators configured.
- Firestore rules variants: `firestore.rules`, `firestore.rules.multi-org`, `firestore-content.rules`.
- Storage rules: `storage.rules`.
- App Hosting config: `apphosting.yaml` (Node 20, admin app build).

## Packages Overview

- `packages/integrations/google-adk-bso`: Python BigQuery/keyword utilities + pytest.
- `packages/content`, `astro-components`, `astro-utils`, `types`: local shared libs (details to inspect if needed).

## Stashes (for reference)

- yolo-pre-sync, rebase-untracked-safety (contain prior cherry-pick/rebase artifacts).
