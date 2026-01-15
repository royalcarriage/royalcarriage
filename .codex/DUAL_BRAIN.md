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
