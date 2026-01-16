# Firebase Expansion Plan

## Current State (Quick Audit)
- Hosting: Single site defined in `firebase.json` targeting `dist/public`; GitHub Actions deploys Hosting previews + production but does not deploy functions/rules.
- Functions: Node 20 runtime, TypeScript, scheduled jobs (daily/weekly), HTTP endpoints (analysis, content, images), Firestore trigger for new pages. Dependencies now aligned to `firebase-admin@^13.6.0`, `firebase-functions@^7.0.3`, `@google-cloud/aiplatform@^6.1.0`, `@google-cloud/vertexai@^1.10.0`.
- Firestore: RBAC rules (admin-only) with rate limiting helpers; composite indexes present for key collections.
- Storage: Rules enforce admin-only with size/type validation; temp area scoped to user.
- Environments: `.firebaserc` only defines `royalcarriagelimoseo` (default). No staging project wired. Emulators configured in `firebase.json`.
- DX: No VS Code workspace settings; emulator scripts exist but not surfaced as npm scripts.

## Gaps & Risks
- CI/CD only deploys Hosting; functions, rules, and indexes are manual, risking drift.
- Multi-site Hosting scripts (`deploy:airport` etc.) exist but hosting targets are not defined in `firebase.json`.
- No staging/sandbox project or secrets separation; all workflows assume production.
- Functions lack structured logging/monitoring hooks and rate limiting beyond Firestore rules.
- Allowed origins/backends for HTTP functions come from environment but not documented as required secrets/config.
- No automated tests for rules/functions; emulator use not documented in README.

## Expansion Roadmap
### Near Term (1-3 days)
1) CI/CD: Add workflow job (or separate workflow) to deploy functions + firestore/storage rules + indexes alongside Hosting; gate on `main`, previews on PR with emulators smoke.
2) Environments: Extend `.firebaserc` to include `staging`; add `FIREBASE_PROJECT_ID`/`FIREBASE_SERVICE_ACCOUNT` for each env; parameterize workflows via inputs.
3) Hosting targets: Define per-site hosting configs (airport/corporate/wedding/partybus/admin) in `firebase.json` to match existing scripts, or remove unused scripts.
4) Config surfaces: Document required runtime vars for functions (`BACKEND_API_URL`, `ALLOWED_ORIGINS`, `PAGES_TO_ANALYZE`, `SCHEDULED_TIMEZONE`, `MAX_IMAGES_PER_DAY`, `GOOGLE_CLOUD_PROJECT`) and how to set with `firebase functions:config:set`.
5) Emulator DX: Add npm scripts (`emulators`, `emulators:test:rules`) and README snippet for local iteration.

### Mid Term (1-2 weeks)
1) Observability: Add structured logging (LogEntry/trace IDs), log-based alerts for failures, uptime checks for HTTPS functions, and BigQuery export for audit logs.
2) Auth & rate limits: Add per-user quotas on HTTP functions, API key option for automation, and stricter CORS allowlist sourced from config.
3) Functions hardening: Wrap fetches with retries/backoff, timeouts, and circuit-breaker metrics; enforce input schemas (zod) and validation for Firestore writes.
4) Data lifecycle: Add TTL policies for `page_analyses`/`content_suggestions`/`ai_images` previews to control cost; daily cleanup job.
5) Testing: Add rules unit tests (firebase-rules-unit-testing) and lightweight function contract tests against emulators; wire into CI.

### Longer Term (1-2 months)
1) Multi-region resilience: Consider secondary region for functions (e.g., `us-east1`) for latency-sensitive endpoints; evaluate Cloud Tasks for queued work.
2) Analytics pipeline: Stream Firestore audit logs to BigQuery for reporting; schedule dashboard generation.
3) Secrets management: Migrate sensitive keys to Google Secret Manager with access bound to functions service accounts.
4) Cost controls: Add log-based metrics for invocations, set budgets/alerts, and archive old assets in Storage to Nearline.

## Actions Completed Now
- Updated `functions/package.json` to match root Firebase library versions and rebuilt successfully (`npm run build`).
- Captured this expansion roadmap to guide next implementation steps.

## Recommended Next Implementation Steps
- Decide on staging project ID and extend `.firebaserc`/workflows accordingly.
- Introduce a CI job to deploy functions + rules and add emulator smoke tests.
- Normalize Hosting targets in `firebase.json` to align with existing deploy scripts or retire unused scripts.
