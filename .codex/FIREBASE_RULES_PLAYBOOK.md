# FIREBASE RULES PLAYBOOK

This file contains guidance for validating and deploying Firebase security rules and hosting channels.

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
