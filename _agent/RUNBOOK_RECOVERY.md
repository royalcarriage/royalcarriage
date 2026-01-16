# Recovery Runbook

This document outlines procedures for recovering from failures or unexpected states.

## 1. Git Commit/Push Failures

*   **Issue:** Git commit/push failures due to auth, hooks, large files, permissions, or config.
*   **Recovery Steps:**
    1.  **Audit Git Reliability:** Run `git config --list --show-origin` to inspect all Git configurations.
    2.  **Check Authentication:** Verify SSH keys or PATs for GitHub are correctly configured and accessible.
    3.  **Inspect Hooks:** Examine `.git/hooks/` for failing scripts. If lint/test hooks fail, fix the underlying issues in the code or tests.
    4.  **Large Files:** If large files are detected, use Git LFS (`git lfs install`, `git lfs track "*.ext"`) to manage them.
    5.  **Permissions:** Ensure correct file permissions, especially for executable scripts in hooks or build processes.
    6.  **Commit/Push:** Re-attempt `git commit` and `git push` after fixes.

## 2. Package Manager Install Failures (`pnpm`/`npm`)

*   **Issue:** `pnpm install` or `npm install` fails due to missing packages, incorrect versions, or JSON parsing errors in `package.json`.
*   **Recovery Steps:**
    1.  **Identify Error:** Carefully read the error message (e.g., `EUNSUPPORTEDPROTOCOL`, `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`, JSON parsing errors).
    2.  **Check `package.json`:** If JSON errors, manually correct the file or revert to a known good commit.
    3.  **Verify Workspace Config:** Ensure `package.json` (and `pnpm-workspace.yaml` if used) correctly lists all workspace packages.
    4.  **Reinstall:** Clean `node_modules` and `pnpm-store` (if `pnpm`) and re-run install.
    5.  **Blocker:** If `package.json` parsing issues persist, this becomes a critical blocker for all subsequent build/test steps.

## 3. Build/Test/Emulator Failures

*   **Issue:** Build processes, linters, type checkers, or Firebase emulators fail.
*   **Recovery Steps:**
    1.  **Examine Logs:** Carefully read the output of the failing command for specific error messages.
    2.  **Fix Code/Config:** Address errors in code, TypeScript types, ESLint/Prettier rules, or configuration files (`.eslintrc`, `tsconfig.json`, `tailwind.config.js`, etc.).
    3.  **Emulator Issues:** If emulators fail, check their ports, configuration (`firebase.json`), and ensure they are started correctly.
    4.  **Dependency Issues:** Revisit peer dependency warnings/errors from `pnpm install` and attempt to resolve them.

## 4. Deployment Failures

*   **Issue:** Firebase deployment fails (rules, functions, hosting).
*   **Recovery Steps:**
    1.  **Check Firebase CLI Output:** The CLI will provide specific error messages.
    2.  **Consult `DEPLOY_REPORT.md`:** Review this file for detailed errors and any automated recovery steps.
    3.  **Resource Issues:** If rules/indexes fail, check their syntax and ensure they match data models. If functions fail, check their logs and local emulation.
    4.  **Hosting Issues:** Ensure hosting targets and build outputs in `firebase.json` are correct.
    5.  **Retry/Revert:** Attempt to re-deploy specific resources or rollback if necessary.

## 5. Critical Blocker Recovery

*   **Issue:** Unresolvable environmental issues (e.g., persistent `pnpm` `package.json` parsing errors) prevent critical gates.
*   **Recovery Steps:**
    1.  **Document Blocker:** Create a detailed entry in `DEPLOY_REPORT.md` explaining the issue and its impact.
    2.  **External Assistance:** Seek help from project stakeholders or DevOps to resolve the environment-specific problem.
    3.  **Manual Workarounds:** If possible, implement manual workarounds for critical features (e.g., manually running builds) until the environment is fixed.