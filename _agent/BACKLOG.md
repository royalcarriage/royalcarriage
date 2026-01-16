# Backlog & Future Enhancements

This document outlines items for future development and expansion.

## 1. Recover Marketing App Sources

*   **Description:** The airport/corporate/wedding/partybus hosting targets only have built `dist` assets checked in. Source code is missing, preventing reproducible builds.
*   **Action:** Restore or recreate source apps for each target, wire them into the workspace, and regenerate `dist` outputs before redeploying.

## 2. Enhancing `yolo-agent.mjs` Autonomy

*   **Description:** The current `yolo-agent.mjs` script has a simulated modification. It needs to be integrated with the Gemini API to truly parse objectives, generate complex code changes, and manage multi-step workflows.
*   **Action:** Implement robust parsing of Gemini's output (e.g., JSON output for actions), dynamic file modification logic, improved error handling for gate failures, and a more sophisticated decision-making loop.

## 3. Robust Firebase Emulator Smoke Tests

*   **Description:** The `gateEmulatorSmokeTest` in `yolo-agent.mjs` is a placeholder. It needs specific, project-relevant tests to ensure core Firebase functionalities (Auth, Firestore CRUD, Functions endpoints) are operational before deployment.
*   **Action:** Develop specific `firebase emulators:exec` commands or custom Node.js scripts to hit key API endpoints and data models.

## 4. Comprehensive UI Testing

*   **Description:** End-to-end coverage of admin flows is missing. Marketing sites need tests once sources are recovered.
*   **Action:** Implement Playwright E2E for admin and, after source recovery, for marketing flows; wire into CI.

## 5. SEO and AI System Refinements

*   **Description:** The SEO and AI systems have structural definitions but require detailed implementation and wiring.
*   **Action:** Implement content generation pipelines, detailed analytics hooks, robust image management strategies, and specific audit logic as described in Phase 5.

## 6. Git LFS Implementation for Large Assets

*   **Description:** Identify and migrate any large binary assets (images, videos, etc.) that might be in the repository to Git LFS to prevent push failures.
*   **Action:** Audit repository for large files, implement LFS tracking, and re-commit/push as necessary.

## 7. CI/CD Pipeline Integration

*   **Description:** Integrate the project with CI/CD pipelines (e.g., GitHub Actions, as indicated by `.github/workflows/`) for automated testing and deployment.
*   **Action:** Configure workflows to run `pnpm install`, tests, builds, and deployments automatically on code changes.
