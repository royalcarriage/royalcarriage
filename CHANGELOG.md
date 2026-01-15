# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-01-15

### Added
- Master Autonomous Agent Stack configuration for unified AI system behavior
  - `.github/instructions/MASTER.instructions.md` - force plan-first, batch work, gates, no approval needed
  - `.codex/MEMORY.md` - cross-repo memory folder configuration (~/.codex-memory/*)
  - `.codex/FIREBASE_RULES_PLAYBOOK.md` - Firebase security rules requirements (auth, RBAC, tenant isolation)
  - `.codex/DUAL_BRAIN.md` - AI system role separation (Codex/Copilot vs Gemini)
  - `.codex/VSCODE_SETTINGS.md` - VS Code settings documentation for Copilot Chat integration
- Watchdog gates script (`scripts/watchdog.mjs`) runs: npm ci, lint, typecheck, test, build
- Package script: `npm run gates` to run all quality gates
- Shadow deploy script and `deploy:shadow` script
- Smoke-check script and `smoke-check` script
- Emulator role test script for RBAC validation
- Tracking files: PLAN.md, STATUS.md, CHANGELOG.md

### Fixed
- TypeScript error TS2339 in `server/firebase-claims.ts` - proper error type casting
- npm ci failure - regenerate package-lock.json to sync with package.json (missing bufferutil@4.1.0 and @opentelemetry/api@1.9.0)

### Changed
- All AI agents now follow unified autonomous mode: plan-first, batch changes, run gates, auto-fix, commit
- Firebase rules enforcement: require auth, role checks, least-privilege, tenant isolation
- Never ask for approval - agents operate autonomously with safety gates
