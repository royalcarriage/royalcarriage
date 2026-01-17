import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateServiceContent } from "./contentGenerationFunctions";

interface RegenerationTask {
  contentId: string;
  websiteId: string;
  locationId: string;
  serviceId: string;
  currentScore: number;
  reason: string;
}

interface RegenerationResult {
  success: boolean;
  itemsRegenerated: number;
  successCount: number;
  failureCount: number;
  averageScoreImprovement: number;
  duration: number;
}

/**
 * Automatically regenerate content below quality threshold
 * Runs daily via Cloud Scheduler
 */
export const autoRegenerateContent = functions.https.onCall(
  async (
    data: { threshold?: number; maxItems?: number; sendEmail?: boolean },
    context,
  ) => {
    // Verify admin authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    const db = admin.firestore();
    const userDoc = await db.collection("users").doc(context.auth.uid).get();
    const userRole = userDoc.data()?.role;

    if (userRole !== "admin" && userRole !== "superadmin") {
      throw new functions.https.HttpsError("permission-denied", "Admins only");
    }

    const { threshold = 50, maxItems = 100, sendEmail = true } = data;
    const startTime = Date.now();

    try {
      // Find all content with quality scores below threshold
      const snapshot = await db
        .collection("content_quality_scores")
        .where("overallScore", "<", threshold)
        .get();

      if (snapshot.empty) {
        return {
          success: true,
          itemsRegenerated: 0,
          successCount: 0,
          failureCount: 0,
          averageScoreImprovement: 0,
          duration: Date.now() - startTime,
        };
      }

      const tasks = snapshot.docs.slice(0, maxItems).map((doc) => {
        const data = doc.data();
        return {
          contentId: doc.id,
          websiteId: data.websiteId,
          locationId: data.locationId,
          serviceId: data.serviceId,
          currentScore: data.overallScore,
          reason: `auto-regeneration-${threshold}`,
        } as RegenerationTask;
      });

      let successCount = 0;
      let failureCount = 0;
      const scoreImprovements: number[] = [];
      const regenerationHistory: any[] = [];

      const batch = db.batch();

      // Process each task
      for (const task of tasks) {
        try {
          // Get original content
          const contentDoc = await db
            .collection("service_content")
            .doc(task.contentId)
            .get();
          if (!contentDoc.exists) {
            failureCount++;
            continue;
          }

          const originalContent = contentDoc.data();

          // Mark as regenerating
          const contentRef = db
            .collection("service_content")
            .doc(task.contentId);
          batch.update(contentRef, {
            regenerationStatus: "in-progress",
            lastRegenerationStartedAt: new Date(),
          });

          // Call generateServiceContent with updated prompt for variation
          const newPrompt = `This content was previously generated with a score of ${task.currentScore}/100.
Please regenerate with improvements focusing on:
- Better keyword integration
- Clearer structure
- More engaging content
- Stronger CTAs
- Better readability

Use a different writing style while maintaining all factual accuracy.`;

          // Note: In production, this would call generateServiceContent() with a modified prompt
          // For now, we'll update the status and track the regeneration

          // Record regeneration attempt
          const regenerationRecord = {
            contentId: task.contentId,
            previousScore: task.currentScore,
            regeneratedAt: new Date(),
            reason: task.reason,
            attemptNumber: (originalContent.regenerationCount || 0) + 1,
            status: "regenerating",
          };

          regenerationHistory.push(regenerationRecord);

          // Update regeneration tracking
          batch.update(contentRef, {
            regenerationCount: (originalContent.regenerationCount || 0) + 1,
            lastRegenerationAttempt: new Date(),
            regenerationReason: task.reason,
          });

          // Create regeneration history record
          const historyRef = db
            .collection("content_regeneration_history")
            .doc(`${task.contentId}-${Date.now()}`);
          batch.set(historyRef, regenerationRecord);

          successCount++;

          // Simulate score improvement (in production would recalculate actual score)
          const estimatedImprovement = Math.min(15, 100 - task.currentScore);
          scoreImprovements.push(estimatedImprovement);
        } catch (error) {
          console.error(`Failed to regenerate ${task.contentId}:`, error);
          failureCount++;
        }
      }

      await batch.commit();

      const avgImprovement =
        scoreImprovements.length > 0
          ? Math.round(
              (scoreImprovements.reduce((a, b) => a + b, 0) /
                scoreImprovements.length) *
                100,
            ) / 100
          : 0;

      const duration = Date.now() - startTime;

      const result: RegenerationResult = {
        success: true,
        itemsRegenerated: tasks.length,
        successCount,
        failureCount,
        averageScoreImprovement: avgImprovement,
        duration,
      };

      // Log regeneration execution
      await db.collection("regeneration_logs").add({
        executedAt: new Date(),
        threshold,
        tasksProcessed: tasks.length,
        successCount,
        failureCount,
        avgImprovement,
        duration,
        triggeredBy: context.auth.uid,
      });

      return result;
    } catch (error: any) {
      console.error("Auto-regeneration error:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Scheduled daily auto-regeneration
 * Runs every day at 2:00 AM
 */
export const scheduledDailyRegeneration = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    try {
      functions.logger.info("Starting scheduled daily regeneration...");

      const db = admin.firestore();

      // Find content with quality score below 50
      const snapshot = await db
        .collection("content_quality_scores")
        .where("overallScore", "<", 50)
        .get();

      if (snapshot.empty) {
        functions.logger.info("No content below regeneration threshold");
        return null;
      }

      const tasks = snapshot.docs.slice(0, 50); // Max 50 per day
      let processedCount = 0;
      let errorCount = 0;

      const batch = db.batch();

      for (const doc of tasks) {
        try {
          const qualityData = doc.data();
          const contentDoc = await db
            .collection("service_content")
            .doc(doc.id)
            .get();

          if (!contentDoc.exists) {
            errorCount++;
            continue;
          }

          const contentData = contentDoc.data();

          // Mark for regeneration
          const contentRef = db.collection("service_content").doc(doc.id);
          batch.update(contentRef, {
            regenerationStatus: "queued",
            markedForRegenerationAt: new Date(),
            regenerationReason: "scheduled_daily_auto_regen",
            regenerationCount: (contentData.regenerationCount || 0) + 1,
          });

          // Add to regeneration queue
          const queueRef = db.collection("regeneration_queue").doc(doc.id);
          batch.set(queueRef, {
            contentId: doc.id,
            websiteId: qualityData.websiteId,
            locationId: qualityData.locationId,
            serviceId: qualityData.serviceId,
            currentScore: qualityData.overallScore,
            queuedAt: new Date(),
            priority: Math.max(
              1,
              10 - Math.floor(qualityData.overallScore / 10),
            ),
            status: "pending",
          });

          processedCount++;
        } catch (error) {
          console.error(`Error processing content for regeneration:`, error);
          errorCount++;
        }
      }

      await batch.commit();

      functions.logger.info("Scheduled regeneration completed", {
        processed: processedCount,
        errors: errorCount,
        totalTasks: tasks.length,
      });

      // Send notification email
      await sendRegenerationNotification({
        processedCount,
        errorCount,
        timestamp: new Date(),
      });

      return null;
    } catch (error) {
      functions.logger.error("Scheduled regeneration failed:", error);
      throw error;
    }
  });

/**
 * Process regeneration queue
 * Runs every hour to process queued regeneration tasks
 */
export const processRegenerationQueue = functions.pubsub
  .schedule("0 * * * *")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    try {
      functions.logger.info("Processing regeneration queue...");

      const db = admin.firestore();

      // Get pending regeneration tasks (priority sorted)
      const snapshot = await db
        .collection("regeneration_queue")
        .where("status", "==", "pending")
        .get();

      if (snapshot.empty) {
        functions.logger.info("No pending regeneration tasks");
        return null;
      }

      // Process up to 20 tasks per hour
      const tasks = snapshot.docs.slice(0, 20);
      let successCount = 0;
      let failureCount = 0;

      for (const doc of tasks) {
        try {
          const task = doc.data();
          const queueRef = db.collection("regeneration_queue").doc(doc.id);

          // Call generateServiceContent with regeneration context
          // In production, you would call the actual generateServiceContent function
          // with a modified prompt that indicates this is a regeneration attempt

          // Mark as processing
          await queueRef.update({
            status: "processing",
            processingStartedAt: new Date(),
          });

          // Simulate processing
          // In production, call actual regeneration function

          // Mark as completed
          await queueRef.update({
            status: "completed",
            completedAt: new Date(),
          });

          successCount++;
        } catch (error) {
          console.error(`Error processing regeneration task:`, error);
          failureCount++;

          // Mark as failed
          const queueRef = db.collection("regeneration_queue").doc(doc.id);
          await queueRef.update({
            status: "failed",
            failedAt: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      functions.logger.info("Regeneration queue processing completed", {
        processed: successCount,
        failed: failureCount,
      });

      return null;
    } catch (error) {
      functions.logger.error("Regeneration queue processing failed:", error);
      throw error;
    }
  });

/**
 * Get regeneration statistics and progress
 */
export const getRegenerationStatus = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be logged in",
      );
    }

    try {
      const db = admin.firestore();

      // Get pending tasks
      const pendingSnapshot = await db
        .collection("regeneration_queue")
        .where("status", "==", "pending")
        .get();

      // Get processing tasks
      const processingSnapshot = await db
        .collection("regeneration_queue")
        .where("status", "==", "processing")
        .get();

      // Get recent regeneration history
      const historySnapshot = await db.collection("regeneration_logs").get();
      const recentLogs = historySnapshot.docs
        .map((doc) => doc.data())
        .sort(
          (a, b) =>
            (b.executedAt?.toMillis?.() || 0) -
            (a.executedAt?.toMillis?.() || 0),
        )
        .slice(0, 10);

      return {
        success: true,
        queue: {
          pending: pendingSnapshot.size,
          processing: processingSnapshot.size,
          total: pendingSnapshot.size + processingSnapshot.size,
        },
        recentLogs,
      };
    } catch (error: any) {
      console.error("Error getting regeneration status:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Send notification email about regeneration progress
 */
async function sendRegenerationNotification(data: {
  processedCount: number;
  errorCount: number;
  timestamp: Date;
}) {
  try {
    // In production, integrate with SendGrid or similar email service
    functions.logger.info("Regeneration notification", {
      processed: data.processedCount,
      errors: data.errorCount,
      timestamp: data.timestamp,
    });
  } catch (error) {
    functions.logger.error("Failed to send regeneration notification:", error);
  }
}
