## MASTER AGENT: Playbook & Instructions

This document outlines the responsibilities, runbook, and escalation paths for the MASTER agent stack used by this repository.

1) Purpose
- Coordinate CI/CD shadow deploys, smoke checks, RBAC enforcement, and watchdoging.

2) Primary Commands
- `npm run gates` — starts the watchdog that runs health checks.
- `npm run deploy:shadow` — deploys to a Firebase hosting channel named `shadow`.
- `npm run smoke-check` — performs HTTP checks against `/` and `/admin`.

3) Health / Escalation
- Watchdog will exit non-zero on fatal failures; CI should capture logs and notify on failure.

4) RBAC
- Roles live in the primary DB (`users.role`). System can optionally sync into Firebase custom claims via server helper `server/firebase-claims.ts`.

5) Tests
- `scripts/emulator-role-test.mjs` is a minimal emulator-run guide to validate role boundaries.

6) Change control
- Use `CHANGELOG.md` for public-facing changes; `STATUS.md` for ongoing work.

Quick links
- Plan: PLAN.md
- Status: STATUS.md
- Changelog: CHANGELOG.md

---
Playbook maintained by MASTER agent automation.
