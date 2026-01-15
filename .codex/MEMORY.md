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
