# Cloud Audit (2026-01-15)

Scope: Static review of config; Firebase/GCP commands not executed in this pass.

Findings:
- firebase.json defines multi-site hosting (admin + airport/corporate/wedding/partybus), functions (nodejs20), emulators configured. Firestore rules at `firestore.rules`; alternative `firestore.rules.multi-org` exists but unused.
- Storage rules at `storage.rules`; prior audits flagged public `ai-images` reads and unscoped `/temp` paths.
- Functions code includes deployImages with hardcoded bucket and local FS writes; rate-limiter and auth/claims mismatches noted previously.
- App Hosting config (`apphosting.yaml`) targets admin build with env vars.

Commands run:
- `firebase projects:list` ✅ (current project royalcarriagelimoseo).
- `firebase deploy --only firestore:rules,storage --dry-run` ✅.
- Preview deploy hosting: `firebase hosting:channel:deploy canary-1768485534 --expires 1d` ✅ (URL: https://royalcarriagelimoseo--canary-1768485534-berzffmk.web.app).
- Production deploy hosting + rules: `firebase deploy --only hosting,firestore:rules,storage` ✅.
- Functions deploy: `firebase deploy --only functions` ✅ after fixing predeploy to use `npx tsc` + postbuild copy; functions updated (dailyPageAnalysis/weeklySeoReport/triggerPageAnalysis/generateContent/generateImage/autoAnalyzeNewPage). Note deprecation notice: migrate off `functions.config()` before March 2026.

Pending Actions:
1) Align auth claims/rules and rate limiter/deployImages; consider multi-org rules if needed.
2) Add smoke/monitoring for preview/prod; verify Hosting/Functions logs.
3) If multi-org intended, switch firebase.json to `firestore.rules.multi-org` post-migration.
