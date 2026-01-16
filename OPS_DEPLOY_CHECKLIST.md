# OPS DEPLOY CHECKLIST

This document provides a checklist for deploying the system.

## Pre-deployment Checklist

*   [x] Ensure that the `firebase.json` file is configured correctly.
*   [x] Ensure that the `.github/workflows` directory contains the correct workflows.
*   [x] Ensure that the `firestore.rules` file is configured correctly.
*   [x] Ensure that the `storage.rules` file is configured correctly.
*   [x] Ensure that all tests pass.
*   [x] Ensure that the application builds successfully.

## Deployment Checklist

*   [x] Push the changes to the `main` branch.
*   [x] Monitor the GitHub Actions workflow to ensure that the deployment is successful.

## Post-deployment Checklist

*   [x] Verify that the application is accessible.
*   [x] Verify that the application is working correctly.