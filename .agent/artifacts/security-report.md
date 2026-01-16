# Security Report (2026-01-15)

## Summary

- npm audit: now clean after upgrading vitest/@vitest/coverage-v8 to 4.0.17 (pulling newer vite/esbuild).
- Firebase/GCP:
  - Functions deps fixed (`node-fetch` added) and build passes (`npm --prefix functions run build`).
  - Storage rules hardened: `/ai-images` no longer public; `/temp` scoped by userId. Further review needed for uploads/screenshot paths.
  - Remaining gaps: deployImages still uses hardcoded bucket/path and local FS writes; rate limiter/auth claims alignment not yet addressed; Firestore rules still minimal (admin-only via users collection).
- Secrets: no keys observed in repo; `.env` absent (stashed earlier). Run a secret scan before deploy.

## Required Actions

1. Upgrade vitest/vite/esbuild to patched versions; rerun tests/build.
2. Re-verify Firebase Functions deps/build; lock storage/firestore rules to least privilege; align auth claims.
3. Replace deployImages local FS writes with Storage/Hosting flow; correct bucket name.
4. Run secret scan (e.g., `gitleaks` or `git secrets`) and ensure env handling is documented.
