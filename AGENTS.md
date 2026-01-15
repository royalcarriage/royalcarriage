# AGENTS.md

These instructions apply to any autonomous coding agent working in this repo.

## Core rules
- Always plan first.
- Work in small batches (10-25 changes).
- After each batch: run gates (lint/typecheck/test/build), fix issues, then commit.
- Never ask for approval unless a real safety/security/legal boundary exists.
- Always update PLAN.md, STATUS.md, CHANGELOG.md.

## Quality gates
- Use `npm run gates` when available (lint/typecheck/test/build).
- Keep the UI usable: loading states, empty states, error states, navigation.

## Firebase (if present)
- Enforce least-privilege Firestore and Storage rules.
- Require auth, RBAC, and tenant isolation.
- Validate rules with emulators before deploy.
