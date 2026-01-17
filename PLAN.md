# PLAN: MASTER AGENT STACK - COMPLETE

## Completed (2026-01-15)

1. Created unified instruction + playbook files - DONE
   - `.github/instructions/MASTER.instructions.md` - autonomous agent rules
   - `.codex/MEMORY.md` - cross-repo memory configuration
   - `.codex/FIREBASE_RULES_PLAYBOOK.md` - Firebase security requirements
   - `.codex/DUAL_BRAIN.md` - AI system role separation
   - `.codex/VSCODE_SETTINGS.md` - VS Code AI configuration docs

2. Added watchdog gates script - DONE
   - `scripts/watchdog.mjs` runs: npm ci, lint, typecheck, test, build
   - `npm run gates` command available in package.json

3. Tracking files in place and updated - DONE
   - PLAN.md, STATUS.md, CHANGELOG.md maintained

4. Shadow deploy + smoke-check scripts - DONE
   - `scripts/shadow-deploy.sh` and `npm run deploy:shadow`
   - `scripts/smoke-check.mjs` and `npm run smoke-check`

5. RBAC baseline enforced - DONE
   - Role helpers, client/server guards, emulator test
   - `shared/roles.ts`, `server/firebase-claims.ts`, `scripts/emulator-role-test.mjs`

6. All changes committed - DONE
   - Commits: master agent stack, VS Code settings docs
   - STATUS.md and CHANGELOG.md updated

7. Added AGENTS.md - DONE
   - Repository-wide autonomous agent instructions

8. Synced npm ci dependencies - DONE
   - Added @opentelemetry/api optional dependency and updated lockfile

## Next Actions

The Master Autonomous Agent Stack is complete and operational. All AI systems in VS Code will now:

- Follow plan-first workflow
- Batch changes (10-25 at a time)
- Run gates before committing
- Auto-fix issues
- Never ask for approval
- Enforce Firebase security rules
- Update PLAN.md, STATUS.md, CHANGELOG.md

### To Run:

1. `npm run gates` - verify all quality gates pass
2. `npm run deploy:shadow` - deploy to Firebase shadow channel (if Firebase configured)
3. `npm run smoke-check` - run smoke tests against deployed URL

### If Firebase Deployment:

- Ensure Firebase rules in `firestore.rules` and `storage.rules` enforce least-privilege
- Run `scripts/emulator-role-test.mjs` to validate RBAC boundaries
- Deploy only if all gates pass
