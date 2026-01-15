# Changelog

## [Unreleased]
- Initialized autonomous audit cycle (2026-01-15): set up `.agent/*`, refreshed PLAN/STATUS/CHANGELOG on branch `merge/consolidation-2026-01-15`.
- Added repository map artifact (`.agent/artifacts/repo-map.md`) summarizing apps/packages/frameworks/Firebase config.
- Completed MD audit and backlog (20 items) logged in `.agent/artifacts/md-audit.md` and `.agent/artifacts/backlog.md`; roadmap injected into PLAN.md.
- Fixed root `package.json` JSON parse error; installed deps; addressed SuburbsService type issues; `npm run check`/`npm run build` passing.
- Merged latest `origin/main` (admin pages, Firebase docs/config updates, tailwind config).
- Hardened `storage.rules` (admin-only ai-images, user-scoped temp); added `node-fetch` dependency and verified `npm --prefix functions run build` passes.
- Upgraded vitest/@vitest/coverage-v8 to 4.0.17; `npm run check`/`npm run build` pass; `npm audit` now clean.
- Fixed Firebase functions predeploy (npx tsc + postbuild copy to lib/index.js); deployed hosting + Firestore/Storage rules and functions; created preview channel (canary-1768485534) and pushed prod hosting/rules. Functions deploy surfaced `functions.config()` deprecation notice (migrate to params).
- Aligned auth checks to accept role/admin claim across functions and rules; Storage/Firestore admins now honor claims + user doc; added smoke check script (`npm run smoke`) for preview/prod.
- Added robots.txt and sitemap.xml to client/public; rebuild successful.
- Repaired local toolchain after stash cleanup (restored node_modules bins, removed stray workflow/admin lockfile) and switched tsx scripts to direct module path.
- Secured image generation function with admin token verification, usage-based rate limiting keyed by start-of-day ms, and user-aware audit logging; made image uploads respect `DEPLOY_IMAGES_BUCKET/PREFIX`.
- `npm run check` and `npm run build` passing post-fixes.
- Documented deploy-images env variables in `.env.example`.
- Added AI Ops control room UI (four-site pipeline, brief builder, image prompt kit, quality/deploy gates, queues) under Admin Dashboard.
- Cleaned Vite config to use explicit dev/prod plugin toggles; gates re-run ✅.
