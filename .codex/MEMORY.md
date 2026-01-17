# Codex Memory Folder

- Cross-repo memory folder path: `~/.codex-memory/{global,royalcarriage,playbooks,schemas,rbac}`
- Rule: never store secrets in this folder or anywhere in repository-managed memory
- Rule: write stable learnings to these folders as markdown files

Usage notes:

- Store non-sensitive artifacts (design notes, playbooks, schema snippets, RBAC learnings) as plain markdown.
- Do not persist API keys, tokens, credentials, or personal data.

## MEMORY (Persistent Notes)

- Primary branch: main
- Active working branch: ai/e2e-fixes/compact-20260114T190653Z
- Key services: Express server, Firebase hosting, Postgres via Drizzle
- RBAC: `users.role` with values: `user`, `admin`, `super_admin` (db schema in `shared/schema.ts`)
- Watchdog: `scripts/watchdog.mjs` (health checks)
- Shadow deploy: `scripts/shadow-deploy.sh` and `npm run deploy:shadow`
- Smoke checks: `scripts/smoke-check.mjs` and `npm run smoke-check`

Notes:

- The codebase supports Passport local auth and session cookies; server-side RBAC middleware lives in `server/security.ts`.
- Use emulator scripts (`scripts/emulator-role-test.mjs`) to validate role boundaries before pushing to prod.

# Royal Carriage Memory Index

## Repos

- royalcarriage/royalcarriage: admin dashboard + sites + firebase

## Conventions

- Role names:
  - owner_admin, dispatcher, fleet_manager, accounting, seo_manager, developer, affiliate_admin, driver

## Deploy

- Primary target: Firebase Hosting + Firestore + Storage
- Always run gates before deploy
