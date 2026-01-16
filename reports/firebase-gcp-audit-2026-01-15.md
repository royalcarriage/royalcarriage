# Firebase & GCP Audit — 2026-01-15

## Scope

- Firestore and Storage security rules
- Cloud Functions code and build health
- Hosting/App Hosting configuration

## Validation Run

- `npm --prefix functions run build` ❌ fails: missing type definition files for `mime` and `ms` (functions package lacks the required dev dependencies).
- No `npm run gates` script in root package; only `check`/`test`/`build` exist.

## Critical Findings

- Functions build currently broken; missing types (`@types/mime`, `@types/ms`) prevent deployment. Additional missing runtime deps: `@google-cloud/storage` and `node-fetch` are imported but not declared in `functions/package.json`.
- Image deployment functions (`functions/src/deployImages.ts`) target bucket `royalcarriagelimoseo.firebasestorage.app` (likely incorrect; default should be `<project>.appspot.com`) and write to hardcoded local path `/Users/admin/VSCODE/...` inside Cloud Functions. This will fail in production (ephemeral FS, wrong path) and bypasses Hosting/CDN.
- Firestore rate limiter (`functions/src/rate-limiter.ts`) never enforces: triggers lack `context.auth`, it looks up `/adminUsers` at the root (actual data lives under `/orgs/royalcarriage/adminUsers` keyed by email), so writes proceed without throttling.

## High-Risk Issues

- Admin/role mismatch across stack: HTTP functions gate on `decodedToken.role === 'admin'`, Firestore rules expect `request.auth.token.admin == true`, and multi-org claims use `roles`/`isSuperAdmin`. No component sets a `role` claim, so HTTP functions will 403 legitimate admins or rely on an unset field.
- Storage rules exposures:
  - `match /ai-images/{imageId}` is world-readable; AI prompts/URLs leak publicly.
  - `match /temp/{tempFile}` allows any signed-in user to read/write any object (no user scoping, no content-type check).
  - `match /uploads/{uploadId}` is admin-gated but lacks content-type/size enforcement (only size for some paths).
- `firestore-content.rules` checks adminUsers by `request.auth.uid` (actual keys are email) and does not guard `get(...)` with `exists(...)`; admins cannot write content, and reads rely on potentially missing docs.

## Medium Observations

- `firestore.rules.multi-org` exists but is not referenced in `firebase.json`; multi-tenant isolation is not active.
- Backup service uses bucket `royalcarriage-firestore-backups` with no existence/permission check; audit logs written to top-level `auditLogs` vs. org-scoped `audit_logs/auditLogs` naming used elsewhere.
- Hosting CSP still allows `'unsafe-inline'`/`'unsafe-eval'`; consider tightening once frontends are CSP-clean.

## Recommended Remediations

1. Fix functions build/deps: add `@types/mime`, `@types/ms`, `@google-cloud/storage`; drop `node-fetch` import in favor of global `fetch` (or add dependency) and re-run `npm --prefix functions run build`.
2. Align auth model: pick one claims schema (`admin` boolean or `roles` map) and update HTTP functions + rules + claim setter to match; ensure claims are issued centrally.
3. Rewrite rate limiter to consume audit logs or request metadata instead of `context.auth`; point to `/orgs/royalcarriage/adminUsers/{email}` and key users by email/uid consistently.
4. Lock Storage: make `/ai-images` readable only to admins or signed-in org users; scope `/temp` to `/temp/{uid}/{file}` with content-type/size guards; add MIME/size checks to `/uploads` and `/sites/...`.
5. Replace deployImages with a Hosting/Storage pipeline (no local FS writes); correct bucket name to `<project>.appspot.com` and move generated manifests to Storage/Firestore if needed.
6. If multi-org is required, switch `firebase.json` to `firestore.rules.multi-org` and ensure data model + claims are migrated; otherwise remove the unused file to avoid drift.
