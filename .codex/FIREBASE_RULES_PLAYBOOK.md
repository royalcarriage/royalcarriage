# Firebase Rules Playbook

- Firestore and Storage rules must never allow global read or write.
- Rules must require authentication and explicit role checks for privileged actions.
- If the project supports multiple organizations/tenants, require tenant isolation checks in rules (e.g., `request.auth.token.tenantId == resource.data.tenantId`).
- Require emulator tests that validate RBAC boundaries and that no public/global read/write paths exist.

Testing:
- Add emulator-based integration tests to assert rule enforcement for read/write attempts by different roles and unauthenticated clients.
# FIREBASE RULES PLAYBOOK

This file contains guidance for validating and deploying Firebase security rules and hosting channels.
# Firebase Rules Playbook (Non-Negotiables)

Firestore:
- No global allow read/write.
- All writes must require auth.
- All privileged collections require role checks.
- Prefer server-side verification for sensitive writes.

Storage:
- No public write.
- Reads: public only for explicitly public assets.
- Writes: require auth and path ownership checks.

RBAC:
- Use custom claims or a roles doc.
- Enforce tenant isolation if multi-org.
- Log admin actions (audit trail).

Required automated checks:
- Validate rules compile
- Run emulator tests for at least:
  - driver cannot read accounting
  - dispatcher cannot edit roles
  - accounting can view trips but not edit fleet

1) Local validation
- Use `firebase emulators:start --only firestore,auth,hosting` to run local emulators.
- Run `scripts/emulator-role-test.mjs` to exercise role boundaries against the local server.

2) Rules review
- Keep rule changelogs in `CHANGELOG.md` and reference PRs when changing rules.

3) Shadow deploy
- Use `npm run deploy:shadow` to create a temporary hosting channel `shadow`.
- After deploy, run `npm run smoke-check` against the deployed URL (the command prints deploy URL).

4) Rollback
- Hosting channels can be removed with `firebase hosting:channel:delete <channelId>`.

5) CI integration
- CI should deploy to a `shadow` channel, run `npm run smoke-check`, then promote if green.
