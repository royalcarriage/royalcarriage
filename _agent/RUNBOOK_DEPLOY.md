# Deployment Runbook

This document outlines the steps for deploying the unified system.

**Prerequisites:**

*   Successful completion of all Phase 4 (Build/Test/Emulators) gates.
*   Correct Firebase project configured (`firebase use <project_alias>`).
*   All necessary environment variables (e.g., `GEMINI_API_KEY`, `.env.local`) are set.

**Deployment Steps:**

1.  **Deploy Firestore Rules & Indexes:**
    ```bash
    firebase deploy --only firestore:rules,firestore:indexes
    ```

2.  **Deploy Storage Rules:**
    ```bash
    firebase deploy --only storage
    ```

3.  **Deploy Firebase Functions:**
    ```bash
    firebase deploy --only functions
    ```
    *Ensure functions are built successfully (`pnpm run build` in functions dir or via root build script) before this step.*

4.  **Deploy Hosting Targets:**
    Deploy each hosting target individually or collectively as defined in `firebase.json` and `.firebaserc`.
    *   **For individual targets:**
        ```bash
        firebase deploy --only hosting:admin
        firebase deploy --only hosting:airport
        firebase deploy --only hosting:corporate
        firebase deploy --only hosting:wedding
        firebase deploy --only hosting:partybus
        ```
    *   **For all targets (if correctly configured):**
        ```bash
        firebase deploy --only hosting
        ```
        *(Note: If deploying all at once, ensure `firebase.json` correctly maps all targets.)*

**Verification Steps (Post-Deploy):**

*   Verify main site loads correctly.
*   Verify admin site loads at its designated subdomain/path.
*   Check for 404 errors on critical routes.
*   Confirm function endpoints respond as expected.
*   Check browser console for errors on deployed sites.

**Rollback Procedure:**

*   If deployment fails, identify the failing resource and consult `DEPLOY_REPORT.md` for specific errors.
*   Revert the problematic commit if necessary and re-attempt deployment after fixing.
*   For critical failures, consider reverting the entire deployment or specific resources.
