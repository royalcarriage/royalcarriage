# PLAN

## Goal (2026-01-15)
Audit Firebase and Google Cloud configuration, surface breakages, and list remediation steps.

## Current Status
- Audit report written: `reports/firebase-gcp-audit-2026-01-15.md`.
- Validation run: `npm --prefix functions run build` fails (missing `@types/mime`, `@types/ms`; undeclared `@google-cloud/storage`/`node-fetch` usage).
- Root typecheck: `npm run check` passes after defining `isDev` in `vite.config.ts`.

## Outstanding Actions
1) Fix Cloud Functions build/deps (add storage + type packages; remove or declare `node-fetch`) and rerun build.
2) Align auth claims across HTTP functions, Firestore rules, and claim issuer (`decodedToken.role` vs `request.auth.token.admin` vs `roles` map).
3) Harden Storage rules (`ai-images` public reads, unscoped `/temp`, content-type/size gaps in `/uploads` and `/sites/...`).
4) Repair Firestore rate limiter identity/path and design to work without `context.auth` in triggers.
5) Replace deployImages local-FS workflow; correct bucket name to `<project>.appspot.com`.

## Next Validation
- Re-run `npm --prefix functions run build` after dependency fixes.
- Add back a repo-wide gates script when available (lint/typecheck/test/build) and run it.
