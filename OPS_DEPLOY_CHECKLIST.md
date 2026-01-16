# Operations Deployment Checklist

This document outlines the steps for deploying the Royal Carriage application.

## Prerequisites

*   **Firebase CLI:** Ensure you are logged into the Firebase CLI using `firebase login`.
*   **pnpm:** Ensure pnpm is installed and available.
*   **Node.js:** Ensure a compatible Node.js version is installed (as per `firebase.json` functions runtime and `package.json` dependencies).
*   **Project Directory:** Navigate to the project root where `package.json` and `firebase.json` are located (e.g., `/Users/admin/VSCODE`).

## Building the Application

Before deployment, components of the application may need to be built.

*   **Build Admin Dashboard:**
    ```bash
    pnpm run build:admin
    ```
    This command builds the admin dashboard. The output is typically placed in `apps/admin/dist/`.

*   **Build Functions:**
    ```bash
    pnpm run build:functions
    ```
    This command builds the Firebase Cloud Functions. Ensure the functions directory has its own build script if necessary.

*   **Full Build:**
    ```bash
    pnpm run build
    ```
    This command executes both `build:admin` and `build:functions`.

## Deployment

Deployments are managed using the Firebase CLI. Ensure you are in the correct directory (`/Users/admin/VSCODE`) before running deploy commands.

*   **Deploy Admin Hosting:**
    Deploys only the admin dashboard to Firebase Hosting. This is intended to serve `https://admin.royalcarriagelimo.com`.
    ```bash
    pnpm run deploy:admin
    # or directly:
    firebase deploy --only hosting:admin
    ```
    **Note:** Ensure the custom domain `admin.royalcarriagelimo.com` is correctly configured in the Firebase console to point to the 'admin' hosting target.

*   **Deploy Functions:**
    Deploys the Firebase Cloud Functions.
    ```bash
    pnpm run deploy:functions
    # or directly:
    firebase deploy --only functions
    ```

*   **Deploy Hosting (All):**
    Deploys all hosting configurations defined in `firebase.json`.
    ```bash
    pnpm run deploy:hosting
    # or directly:
    firebase deploy --only hosting
    ```

*   **Full Project Deploy:**
    Deploys all configured Firebase services (Hosting, Functions, Firestore, etc.).
    ```bash
    pnpm run deploy
    # or directly:
    firebase deploy
    ```

## Audit and Verification

*   **Verify Deployments:** After deployment, access the relevant URLs to confirm the changes are live. Check Firebase console for deployment status and logs.
*   **Security Rules:** Review `firestore.rules` and `storage.rules` for security compliance.
*   **GitHub Integration:** While automated CI/CD pipelines are not explicitly configured, ensure that Git best practices are followed for merges and rollouts. Commits to the main branch should be well-tested and deployed according to this checklist.

## Primary Objectives Reference

Refer to `gemini.md` for the current primary objectives and hard constraints.