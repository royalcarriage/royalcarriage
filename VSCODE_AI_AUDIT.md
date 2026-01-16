# VSCODE AI AUDIT

This document provides a guide for auditing and extending the system using AI-powered tools.

## System Overview

The system is a monorepo that contains a number of web applications, a Firebase backend, and a number of shared packages. The main application is the admin dashboard, which is located in the `apps/admin` directory. The admin dashboard is an Astro application that is deployed to Firebase Hosting.

## Auditing the System

The following are the steps to audit the system:

1.  **Review the Firebase configuration.** The Firebase configuration is located in the `firebase.json` file. This file contains the configuration for Firebase Hosting, Firebase Functions, and other Firebase services.

2.  **Review the GitHub Actions workflows.** The GitHub Actions workflows are located in the `.github/workflows` directory. These workflows define the continuous integration and continuous deployment (CI/CD) pipelines for the system.

3.  **Review the Firestore rules.** The Firestore rules are located in the `firestore.rules` file. These rules define the security rules for the Firestore database.

4.  **Review the Storage rules.** The Storage rules are located in the `storage.rules` file. These rules define the security rules for the Cloud Storage buckets.

## Extending the System

The following are the steps to extend the system:

1.  **Create a new application.** To create a new application, create a new directory in the `apps` directory.

2.  **Create a new package.** To create a new package, create a new directory in the `packages` directory.

3.  **Create a new Firebase Function.** To create a new Firebase Function, create a new file in the `functions/src` directory.

4.  **Create a new GitHub Actions workflow.** To create a new GitHub Actions workflow, create a new file in the `.github/workflows` directory.