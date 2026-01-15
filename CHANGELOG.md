# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-01-15
- Add MASTER agent instructions and playbooks
- Add watchdog (`scripts/watchdog.mjs`) and `gates` script
- Add shadow deploy script and `deploy:shadow` script
- Add smoke-check script and `smoke-check` script
- Add emulator role test script
- Fix TypeScript error TS2339 in `server/firebase-claims.ts` - proper error type casting
- Fix npm ci failure - sync package-lock.json with package.json (bufferutil moved to optionalDependencies)
