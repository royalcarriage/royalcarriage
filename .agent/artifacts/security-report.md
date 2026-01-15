# Security Report (2026-01-15)

## Summary
- npm audit: 6 moderate vulnerabilities (Vitest/vite/esbuild). Fix = upgrade to vitest 4.x (cascades to vite/esbuild), review breaking changes before bump.
- Firebase/GCP (from prior audits, not yet remediated in code):
  - Functions build previously failing on missing `@types/mime`/`@types/ms` and `@google-cloud/storage`/`node-fetch` usage; rules/auth alignment issues; storage exposures (`ai-images` public, `/temp` unscoped). Pending re-verification.
  - deployImages uses hardcoded bucket/path and local FS writes.
  - Rate limiter uses context paths that don’t exist; claims mismatch.
- Secrets: no keys observed in repo; `.env` absent (stashed earlier). Confirm via targeted scan before deploy.

## Required Actions
1) Upgrade vitest/vite/esbuild to patched versions; rerun tests/build.
2) Re-verify Firebase Functions deps/build; lock storage/firestore rules to least privilege; align auth claims.
3) Replace deployImages local FS writes with Storage/Hosting flow; correct bucket name.
4) Run secret scan (e.g., `gitleaks` or `git secrets`) and ensure env handling is documented.
