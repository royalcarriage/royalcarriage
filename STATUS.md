# STATUS

- 2026-01-15: Firebase/GCP audit completed (see `reports/firebase-gcp-audit-2026-01-15.md`); functions build failing due to missing type deps (`@types/mime`, `@types/ms`) and undeclared runtime deps (`@google-cloud/storage`, `node-fetch` import). 
- 2026-01-15: Storage rules issues identified (`ai-images` world-readable; `/temp` unscoped; `/uploads` lacks content-type/size checks). 
- 2026-01-15: Rate limiter ineffective (no `context.auth`, wrong path `/adminUsers`, keyed by uid vs email). 
- 2026-01-15: deployImages misconfigured bucket (`royalcarriagelimoseo.firebasestorage.app`) and hardcoded local filesystem paths that will fail on Cloud Functions.
- 2026-01-15: Restored Vite config typecheck by defining `isDev`; `npm run check` now passes.
