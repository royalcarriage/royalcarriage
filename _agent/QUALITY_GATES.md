# Quality Gates for Autonomous Operations

These are the quality gates that autonomous processes must pass before proceeding with changes or deployments.

## Phase 0: Environment & Discovery
*   **System Versions:** Node.js, npm/pnpm, Git, Firebase CLI must be functional.
*   **Git Status:** Repository must be clean or local changes stashed/committed safely.
*   **Remote Connection:** Git must be connected to a valid remote repository.

## Phase 1: Git Reliability
*   **Commit/Push:** `git commit` and `git push` must succeed without errors.
*   **No Detached HEAD:** Repository must not be in a detached HEAD state.
*   **Hooks:** Git hooks must not block commits; they should either pass or be stable.
*   **Large Files:** Handled via Git LFS or excluded from repo.

## Phase 4: Install, Build, Test
*   **Package Manager Install:** All dependencies must install successfully without critical errors (`pnpm install`, `npm install`, etc.). **(CURRENTLY BLOCKED BY JSON PARSING ERROR)**
*   **Formatting:** Code must adhere to formatting standards (run `pnpm format` or `npm run format`).
*   **Linting:** Code must pass linting checks (`pnpm lint` or `npm run lint`). Fixable errors (`--fix`) should be applied.
*   **Type Checking:** Code must pass type checking (`pnpm check` or `npm run check`, `tsc`).
*   **App Builds:** All applications (`admin`, `marketing` sites, etc.) must build successfully.
*   **Function Builds:** Firebase Functions must build successfully.
*   **Emulator Smoke Test:** Firebase emulators must start, and core application routes/endpoints must be accessible and functional without immediate 404s or security errors.

## Phase 7: Deployment Verification
*   **Deployment Success:** Firebase deployment commands must complete without errors.
*   **Live Verification:** Deployed sites and functions must be accessible at their respective URLs.
*   **Core Functionality:** Main site, admin site, and critical routes must not return 404s. Functions must respond.
*   **Console Errors:** No critical errors in deployed application consoles.

## General Autonomous Operation Rules:

*   **No Silent Failures:** All failures must be documented or lead to agent halting.
*   **Batch Changes:** Adhere to max 20 files or 500 LOC per batch, committing after each.
*   **Secrets:** Never expose secrets; use `.env.local`.
*   **Data Integrity:** Never destroy data; back up before destructive operations.