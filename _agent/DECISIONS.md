# Architectural Decisions

This document outlines key architectural decisions made during the system unification process.

## 1. Package Manager Strategy

*   **Decision:** Adopt `pnpm` as the primary package manager.
*   **Rationale:** The project's `package.json` and `pnpm-lock.yaml` strongly indicated `pnpm` as the intended package manager. The initial failure of `npm install` with `workspace:` protocol further validated this. `pnpm` was installed globally to facilitate its use.

## 2. AI Agent Integration

*   **Decision:** Designate **GitHub Copilot as the primary 'Driver'** for inline code suggestions and **Google Gemini as the 'Navigator'** for chat-based assistance.
*   **Rationale:** To avoid conflicts and reduce workflow interruptions from multiple AI agents, a division of labor was established. This configuration aims to leverage Copilot for real-time code completion and Gemini for more complex, context-aware queries and task decomposition.

## 3. YOLO Mode Implementation

*   **Decision:** Externalize complex, multiline shell commands from `package.json` into separate `.mjs` files (`scripts/yolo-agent.mjs`, `scripts/audit-images-content.mjs`, `scripts/audit-images-dist.mjs`).
*   **Rationale:** Direct embedding of complex shell commands, especially those using heredoc syntax (`<<'NODE'`), in `package.json` led to persistent JSON parsing errors. Externalizing these commands into dedicated Node.js modules resolves these parsing issues and improves maintainability.

## 4. Firebase Hosting Configuration

*   **Decision:** Restructure `firebase.json` to support multiple named hosting targets (`admin`, `airport`, `corporate`, `wedding`, `partybus`).
*   **Rationale:** The monorepo structure and `package.json`'s deploy scripts indicated multiple distinct hosting deployments. The `firebase.json` was updated from a single `public` directory to an array of targets, mapping each to its respective build output (`apps/<app_name>/dist`).

## 5. Firebase Target Alignment

*   **Decision:** Align hosting targets in `.firebaserc` with the names defined in `firebase.json`.
*   **Rationale:** Correcting the `.firebaserc` ensures that commands like `firebase deploy --only hosting:admin` correctly target the intended Firebase projects and hosting sites. The previous `chicagoairportblackcar` and similar aliases were mapped to the primary project `royalcarriagelimoseo` for consistency.

## 6. Package Manager Stability

*   **Decision:** Proceed with `pnpm` as the workspace manager; root `package.json` now contains build/deploy scripts and parses cleanly.
*   **Rationale:** The earlier JSON parsing blocker is no longer reproducible. Standard `pnpm` commands (build admin/functions) succeed locally.
