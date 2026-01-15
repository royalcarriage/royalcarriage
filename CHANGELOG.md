# Changelog

## [Unreleased]

### Added
- Firebase/GCP audit report documenting current risks (`reports/firebase-gcp-audit-2026-01-15.md`).

### Fixed
- Defined `isDev` in `vite.config.ts` so `npm run check`/tsc succeeds.

### Known Issues
- Cloud Functions build fails: `npm --prefix functions run build` reports missing type defs for `mime` and `ms`; `@google-cloud/storage` and `node-fetch` imports are undeclared.
- deployImages uses wrong bucket name and writes to hardcoded local filesystem paths; will fail in production.
- Storage rules gaps: `ai-images` public reads, unscoped `/temp`, and missing MIME/size enforcement on `/uploads` and `/sites/...`.
