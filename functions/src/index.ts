/**
 * Firebase Functions for AI-powered website management
 * Scheduled functions for automated page analysis and optimization
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './api/routes';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Create Express app for API
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Register API routes
registerRoutes(app);

// Export API function
export const api = functions.https.onRequest(app);

/**
 * Scheduled function: Daily page analysis
 * Runs every day at 2:00 AM to analyze all website pages
 */
export const dailyPageAnalysis = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('America/Chicago')
  .onRun(async (context) => {
    functions.logger.info('Starting daily page analysis...');
    // Implementation ...
    return null;
  });

/**
 * Scheduled function: Weekly SEO report
 * Runs every Monday at 9:00 AM to generate SEO report
 */
export const weeklySeoReport = functions.pubsub
  .schedule('0 9 * * 1')
  .timeZone('America/Chicago')
  .onRun(async (context) => {
    // Implementation ...
    return null;
  });

/**
 * Firestore trigger: Auto-analyze new pages
 * Automatically analyze pages when they're added to the database
 */
export const autoAnalyzeNewPage = functions.firestore
  .document('pages/{pageId}')
  .onCreate(async (snap, context) => {
    // Implementation ...
    return null;
  });

/**
 * Firestore trigger: Sync user role to custom claims
 * Updates Firebase Auth custom claims when a user's role changes in Firestore
 */
export const syncUserRole = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const newData = change.after.exists ? change.after.data() : null;
    const previousData = change.before.exists ? change.before.data() : null;

    const newRole = newData?.role;
    const previousRole = previousData?.role;

    // If role hasn't changed, do nothing
    if (newRole === previousRole) {
      return null;
    }

    functions.logger.info(`Syncing role for user ${userId}: ${previousRole} -> ${newRole}`);

    try {
      if (newRole) {
        // Set custom claim
        await admin.auth().setCustomUserClaims(userId, { role: newRole });
        functions.logger.info(`Successfully set role '${newRole}' for user ${userId}`);
      } else {
        // Remove custom claim if role is removed
        await admin.auth().setCustomUserClaims(userId, { role: null });
        functions.logger.info(`Removed role claim for user ${userId}`);
      }
    } catch (error) {
      functions.logger.error(`Failed to sync role for user ${userId}:`, error);
    }

    return null;
  });
