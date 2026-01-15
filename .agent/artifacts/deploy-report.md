# Deploy Report (2026-01-15)

- Firebase dry-run: `firebase deploy --only firestore:rules,storage:rules --dry-run` ❌ error: "Could not find rules for the following storage targets: rules" (likely requires storage target adjustment).

Pending steps:
- Fix storage deploy target/command, then rerun dry-run for rules.
- After rules/functions fixes and gates, run Firebase preview deploy (`firebase hosting:channel:deploy canary-<timestamp> --expires 1d`) and record URL.
- Run smoke (home/admin/auth/key flows) against preview.
- Promote to production via `firebase deploy` once green; log results here and in STATUS.
