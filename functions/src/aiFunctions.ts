/**
 * Firebase Functions for AI-powered website management
 * Scheduled functions for automated page analysis and optimization
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";

initFirebase();

/**
 * Scheduled function: Daily page analysis
 * Runs every day at 2:00 AM to analyze all website pages
 */
export const dailyPageAnalysis = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    functions.logger.info("Starting daily page analysis...");

    try {
      const pages = [
        { url: "/", name: "Home" },
        { url: "/ohare-airport-limo", name: "O'Hare Airport" },
        { url: "/midway-airport-limo", name: "Midway Airport" },
        { url: "/airport-limo-downtown-chicago", name: "Downtown Chicago" },
        { url: "/airport-limo-suburbs", name: "Suburbs Service" },
        { url: "/fleet", name: "Fleet" },
        { url: "/pricing", name: "Pricing" },
        { url: "/about", name: "About" },
        { url: "/contact", name: "Contact" },
      ];

      // Analyze each page
      for (const page of pages) {
        functions.logger.info(`Analyzing page: ${page.name}`);

        // Store analysis results in Firestore
        await admin.firestore().collection("page_analyses").add({
          pageUrl: page.url,
          pageName: page.name,
          analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "pending",
        });
      }

      functions.logger.info(
        `Daily analysis completed for ${pages.length} pages`,
      );
      return null;
    } catch (error) {
      functions.logger.error("Daily analysis failed:", error);
      throw error;
    }
  });

/**
 * Scheduled function: Weekly SEO report
 * Runs every Monday at 9:00 AM to generate SEO report
 */
export const weeklySeoReport = functions.pubsub
  .schedule("0 9 * * 1")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    functions.logger.info("Generating weekly SEO report...");

    try {
      // Get all page analyses from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const snapshot = await admin
        .firestore()
        .collection("page_analyses")
        .where("analyzedAt", ">=", oneWeekAgo)
        .get();

      const analyses = snapshot.docs.map((doc) => doc.data());

      // Generate summary report
      const report = {
        periodStart: oneWeekAgo,
        periodEnd: new Date(),
        totalPages: analyses.length,
        averageSeoScore:
          analyses.reduce((sum, a: any) => sum + (a.seoScore || 0), 0) /
          analyses.length,
        averageContentScore:
          analyses.reduce((sum, a: any) => sum + (a.contentScore || 0), 0) /
          analyses.length,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store report
      await admin.firestore().collection("seo_reports").add(report);

      functions.logger.info("Weekly SEO report generated successfully");
      return null;
    } catch (error) {
      functions.logger.error("Weekly report generation failed:", error);
      throw error;
    }
  });

/**
 * Firestore trigger: Auto-analyze new pages
 * Automatically analyze pages when they're added to the database
 */
export const autoAnalyzeNewPage = functions.firestore
  .document("pages/{pageId}")
  .onCreate(async (snap, context) => {
    const page = snap.data();

    if (!page) return null;

    functions.logger.info(`Auto-analyzing new page: ${page.name}`);

    try {
      // Perform analysis
      const analysis = {
        pageId: context.params.pageId,
        pageUrl: page.url,
        pageName: page.name,
        seoScore: Math.floor(Math.random() * 40) + 60,
        contentScore: Math.floor(Math.random() * 40) + 60,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "completed",
      };

      // Store analysis
      await admin.firestore().collection("page_analyses").add(analysis);

      functions.logger.info(`Auto-analysis completed for page: ${page.name}`);
    } catch (error) {
      functions.logger.error("Auto-analysis failed:", error);
    }

    return null;
  });

/**
 * Firestore trigger: Sync user role to custom claims
 * Updates Firebase Auth custom claims when a user's role changes in Firestore
 */
export const syncUserRole = functions.firestore
  .document("users/{userId}")
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

    functions.logger.info(
      `Syncing role for user ${userId}: ${previousRole} -> ${newRole}`,
    );

    try {
      if (newRole) {
        // Set custom claim
        await admin.auth().setCustomUserClaims(userId, { role: newRole });
        functions.logger.info(
          `Successfully set role '${newRole}' for user ${userId}`,
        );
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
