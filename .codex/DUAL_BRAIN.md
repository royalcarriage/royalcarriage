# Dual Brain: Role Separation

- Codex / Copilot: builder and executor (implementation-focused)
- Gemini: researcher, reviewer, and content drafter (analysis-focused)

Process:
- Gemini produces a brief and test plan
- Codex/Copilot implement the plan and run gates
- Run automated gates (lint, typecheck, test, build)
- Gemini reviews results and approves deploy
# DUAL BRAIN ARCHITECTURE (Playbook)

This repository follows a dual-brain pattern:

- MASTER (Orchestrator): automation agent that runs deploys, tests, and operations (watchdog, shadow deploy, smoke checks).
- WORKER (Execution): domain services (server, functions, AI workers) that perform the work.

Coordination:
- MASTER triggers shadow deploys and runs smoke checks.
- WORKER exposes health endpoints (`/health`), and admin UI (`/admin`) which MASTER verifies.

When extending:
- Add health endpoints to any new worker.
- Update the watchdog to monitor them.
# Dual-Brain Orchestration

When research or current info is needed:
1) Ask Gemini to research and return a structured brief:
   - risks, best practices, sample code patterns, pitfalls
2) Codex implements based on that brief
3) Codex runs gates + deploy pipeline

When generating SEO content:
1) Gemini drafts unique copy blocks + outlines
2) Codex integrates into templates/components and ensures no duplication spam
