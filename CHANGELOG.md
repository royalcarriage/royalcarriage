# Changelog

## [Unreleased]
- Initialized autonomous audit cycle (2026-01-15): set up `.agent/*`, refreshed PLAN/STATUS/CHANGELOG on branch `merge/consolidation-2026-01-15`.
- Added repository map artifact (`.agent/artifacts/repo-map.md`) summarizing apps/packages/frameworks/Firebase config.
- Completed MD audit and backlog (20 items) logged in `.agent/artifacts/md-audit.md` and `.agent/artifacts/backlog.md`; roadmap injected into PLAN.md.
- Fixed root `package.json` JSON parse error; installed deps; addressed SuburbsService type issues; `npm run check`/`npm run build` passing.
- Merged latest `origin/main` (admin pages, Firebase docs/config updates, tailwind config).
- Hardened `storage.rules` (admin-only ai-images, user-scoped temp); added `node-fetch` dependency and verified `npm --prefix functions run build` passes.
