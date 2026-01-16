# VSCODE AI Audit

This document outlines how to audit and extend the system.

## Auditing the System

1.  **Firebase:**
    *   Review Firestore rules for security vulnerabilities.
    *   Review Storage rules for security vulnerabilities.
    *   Check Firebase Hosting configuration for correctness.

2.  **GitHub Actions:**
    *   Verify that the deployment workflow is reproducible.

3.  **Application Code:**
    *   Run `npm run lint` to check for code quality issues.
    *   Run `npm test` to ensure all tests pass.
    *   Run `npm run build` to confirm the application builds successfully.

## Extending the System

1.  **Adding a New Feature:**
    *   Create a new branch for the feature.
    *   Implement the feature, following existing code patterns.
    *   Add tests for the new feature.
    *   Update documentation as needed.
    *   Open a pull request for review.

2.  **Updating Dependencies:**
    *   Use `npm update` to update dependencies.
    *   Run all tests to ensure no regressions were introduced.
    *   Deploy to a staging environment for further testing.
