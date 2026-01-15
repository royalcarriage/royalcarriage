# Cloud Audit (2026-01-15)

Scope: Static review of config; Firebase/GCP commands not executed in this pass.

Findings:
- firebase.json defines multi-site hosting (admin + airport/corporate/wedding/partybus), functions (nodejs20), emulators configured. Firestore rules at `firestore.rules`; alternative `firestore.rules.multi-org` exists but unused.
- Storage rules at `storage.rules`; prior audits flagged public `ai-images` reads and unscoped `/temp` paths.
- Functions code includes deployImages with hardcoded bucket and local FS writes; rate-limiter and auth/claims mismatches noted previously.
- App Hosting config (`apphosting.yaml`) targets admin build with env vars.

Commands run:
- `firebase projects:list` ✅ (projects visible; current: royalcarriagelimoseo).
- `firebase deploy --only firestore:rules,storage:rules --dry-run` ❌ fails: "Could not find rules for the following storage targets: rules" (likely CLI expects storage target names; adjust deploy command/targets).

Pending Actions:
1) Adjust deploy command (e.g., `firebase deploy --only storage,firestore:rules` or define storage target) and retry once storage rules finalized.
2) Validate functions build/deploy locally or via emulator; align auth claims with rules.
3) If multi-org intended, switch firebase.json to `firestore.rules.multi-org` post-migration.
4) Confirm hosting targets/buckets align with production resources.
