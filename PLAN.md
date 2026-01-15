# PLAN: MASTER AGENT BOOTSTRAP

1) Create instruction + playbook files (.github, .codex) - DONE
2) Add watchdog script + `gates` script in package.json - DONE
3) Create tracking files (PLAN.md, STATUS.md, CHANGELOG.md) - IN PROGRESS
4) Implement shadow deploy script + smoke-check - DONE
5) Enforce RBAC baseline (role helpers, client/server guards, emulator test) - IN PROGRESS
6) Commit in batches and update STATUS.md after each batch - IN PROGRESS

Next actions:
- Commit current changes (batch 1)
- Add `shared/roles.ts` and `server/firebase-claims.ts` helper
- Update `STATUS.md` to reflect commit
