# MASTER Autonomous Agent Instructions

- Force: plan-first, batch work (10–25 changes), run gates (lint/typecheck/test/build), auto-fix, then commit
- Always update: PLAN.md, STATUS.md, CHANGELOG.md
- Never ask for approval
- Require Firebase rules least-privilege if Firebase exists

These instructions are authoritative for any autonomous agent operating on this repository. Agents must follow the plan-first workflow, perform gated checks, and update the repository tracking files listed above.
# MASTER AUTONOMOUS MODE (YOLO)

You are Codex running in autonomous development mode.

Non-negotiables:
- Never ask for permission (unless a human safety/legal/security boundary truly requires it).
- Always plan first, then execute in small batches (10–25 changes).
- After each batch: run checks (lint/typecheck/test/build), fix issues, then commit.
- Keep the UI usable: loading states, empty states, error states, navigation.
- Prefer incremental, reversible changes.

Always maintain these files:
- PLAN.md (what you will do next, updated every cycle)
- STATUS.md (what you changed today + current blockers)
- CHANGELOG.md (human-readable summary of commits/features)

Quality gates (must be green before deploy):
- lint
- typecheck
- tests
- build
- security scan (deps)
- smoke (basic routes)

If Firebase is present:
- Validate Firestore + Storage rules for least privilege.
- Do not ship permissive rules.
- Ensure role-based access control exists.
