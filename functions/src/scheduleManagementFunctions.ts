/**
 * Cloud Functions: Schedule Management System
 * Purpose: Manage content generation schedules for automated SEO content creation
 * Features: Create, update, delete schedules; execute scheduled generation; view history
 * Part of Phase 3 - Advanced Content Management
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// ============================================================================
// INTERFACES
// ============================================================================

export interface Schedule {
  id: string;
  name: string;
  description: string;
  websiteId: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  locationIds: string[];
  serviceIds: string[];
  maxItemsPerRun: number;
  qualityThreshold: number;
  notifyOnComplete: boolean;
  notifyEmail?: string;
  createdAt: FirebaseFirestore.Timestamp;
  createdBy: string;
  updatedAt: FirebaseFirestore.Timestamp;
  lastExecutedAt?: FirebaseFirestore.Timestamp;
  nextExecutionAt?: FirebaseFirestore.Timestamp;
}

export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  scheduleName: string;
  status: "pending" | "running" | "completed" | "failed" | "partial";
  startedAt: FirebaseFirestore.Timestamp;
  completedAt?: FirebaseFirestore.Timestamp;
  duration?: number;
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  averageQualityScore?: number;
  errorMessage?: string;
  triggeredBy: "scheduled" | "manual";
  triggeredByUserId?: string;
  generatedContentIds: string[];
}

export interface CreateScheduleInput {
  name: string;
  description?: string;
  websiteId: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  cronExpression?: string;
  timezone?: string;
  locationIds: string[];
  serviceIds: string[];
  maxItemsPerRun?: number;
  qualityThreshold?: number;
  notifyOnComplete?: boolean;
  notifyEmail?: string;
}

export interface UpdateScheduleInput {
  scheduleId: string;
  name?: string;
  description?: string;
  frequency?: "daily" | "weekly" | "monthly" | "custom";
  cronExpression?: string;
  timezone?: string;
  enabled?: boolean;
  locationIds?: string[];
  serviceIds?: string[];
  maxItemsPerRun?: number;
  qualityThreshold?: number;
  notifyOnComplete?: boolean;
  notifyEmail?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert frequency to cron expression
 */
function frequencyToCron(frequency: string): string {
  switch (frequency) {
    case "daily":
      return "0 3 * * *"; // 3:00 AM daily
    case "weekly":
      return "0 3 * * 0"; // 3:00 AM every Sunday
    case "monthly":
      return "0 3 1 * *"; // 3:00 AM on the 1st of each month
    default:
      return "0 3 * * *"; // Default to daily
  }
}

/**
 * Calculate next execution time based on cron expression
 */
function calculateNextExecution(
  cronExpression: string,
  timezone: string,
): Date {
  // Simple implementation - in production, use a proper cron parser library
  const now = new Date();
  const parts = cronExpression.split(" ");

  if (parts.length !== 5) {
    // Default to tomorrow at 3 AM
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(3, 0, 0, 0);
    return next;
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const next = new Date(now);

  // Set hour and minute from cron
  next.setHours(parseInt(hour) || 3, parseInt(minute) || 0, 0, 0);

  // If the time has passed today, move to next occurrence
  if (next <= now) {
    if (dayOfWeek !== "*") {
      // Weekly schedule
      const targetDay = parseInt(dayOfWeek);
      const currentDay = next.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
      next.setDate(next.getDate() + daysUntil);
    } else if (dayOfMonth !== "*") {
      // Monthly schedule
      next.setMonth(next.getMonth() + 1);
      next.setDate(parseInt(dayOfMonth));
    } else {
      // Daily schedule
      next.setDate(next.getDate() + 1);
    }
  }

  return next;
}

/**
 * Verify admin authentication
 */
async function verifyAdmin(
  context: functions.https.CallableContext,
): Promise<string> {
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
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin access required",
    );
  }

  return context.auth.uid;
}

// ============================================================================
// CLOUD FUNCTIONS
// ============================================================================

/**
 * Create a new content generation schedule
 * @param data - CreateScheduleInput
 * @returns Created schedule object
 */
export const createSchedule = functions.https.onCall(
  async (data: CreateScheduleInput, context) => {
    const userId = await verifyAdmin(context);
    const db = admin.firestore();

    // Validate required fields
    if (
      !data.name ||
      !data.websiteId ||
      !data.locationIds?.length ||
      !data.serviceIds?.length
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Name, websiteId, locationIds, and serviceIds are required",
      );
    }

    // Validate frequency
    const validFrequencies = ["daily", "weekly", "monthly", "custom"];
    if (!validFrequencies.includes(data.frequency)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid frequency. Must be daily, weekly, monthly, or custom",
      );
    }

    // If custom frequency, require cronExpression
    if (data.frequency === "custom" && !data.cronExpression) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Custom frequency requires a cronExpression",
      );
    }

    try {
      const cronExpression =
        data.cronExpression || frequencyToCron(data.frequency);
      const timezone = data.timezone || "America/Chicago";
      const nextExecution = calculateNextExecution(cronExpression, timezone);

      const scheduleData: Omit<Schedule, "id"> = {
        name: data.name,
        description: data.description || "",
        websiteId: data.websiteId,
        frequency: data.frequency,
        cronExpression,
        timezone,
        enabled: true,
        locationIds: data.locationIds,
        serviceIds: data.serviceIds,
        maxItemsPerRun: data.maxItemsPerRun || 50,
        qualityThreshold: data.qualityThreshold || 70,
        notifyOnComplete: data.notifyOnComplete ?? true,
        notifyEmail: data.notifyEmail,
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: userId,
        updatedAt: admin.firestore.Timestamp.now(),
        nextExecutionAt: admin.firestore.Timestamp.fromDate(nextExecution),
      };

      const docRef = await db.collection("content_schedules").add(scheduleData);

      functions.logger.info(`Schedule created: ${docRef.id}`, {
        name: data.name,
        websiteId: data.websiteId,
        frequency: data.frequency,
      });

      return {
        success: true,
        scheduleId: docRef.id,
        schedule: { id: docRef.id, ...scheduleData },
        message: `Schedule "${data.name}" created successfully`,
      };
    } catch (error: any) {
      functions.logger.error("Error creating schedule:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Update an existing schedule
 * @param data - UpdateScheduleInput
 * @returns Updated schedule object
 */
export const updateSchedule = functions.https.onCall(
  async (data: UpdateScheduleInput, context) => {
    await verifyAdmin(context);
    const db = admin.firestore();

    if (!data.scheduleId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "scheduleId is required",
      );
    }

    try {
      const scheduleRef = db
        .collection("content_schedules")
        .doc(data.scheduleId);
      const scheduleDoc = await scheduleRef.get();

      if (!scheduleDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Schedule not found");
      }

      const currentSchedule = scheduleDoc.data() as Schedule;
      const updateData: Partial<Schedule> = {
        updatedAt: admin.firestore.Timestamp.now(),
      };

      // Update fields if provided
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.enabled !== undefined) updateData.enabled = data.enabled;
      if (data.locationIds !== undefined)
        updateData.locationIds = data.locationIds;
      if (data.serviceIds !== undefined)
        updateData.serviceIds = data.serviceIds;
      if (data.maxItemsPerRun !== undefined)
        updateData.maxItemsPerRun = data.maxItemsPerRun;
      if (data.qualityThreshold !== undefined)
        updateData.qualityThreshold = data.qualityThreshold;
      if (data.notifyOnComplete !== undefined)
        updateData.notifyOnComplete = data.notifyOnComplete;
      if (data.notifyEmail !== undefined)
        updateData.notifyEmail = data.notifyEmail;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;

      // Handle frequency/cron changes
      if (data.frequency !== undefined || data.cronExpression !== undefined) {
        const frequency = data.frequency || currentSchedule.frequency;
        const cronExpression =
          data.cronExpression ||
          (data.frequency
            ? frequencyToCron(data.frequency)
            : currentSchedule.cronExpression);
        const timezone = data.timezone || currentSchedule.timezone;

        updateData.frequency = frequency;
        updateData.cronExpression = cronExpression;
        updateData.nextExecutionAt = admin.firestore.Timestamp.fromDate(
          calculateNextExecution(cronExpression, timezone),
        );
      }

      await scheduleRef.update(updateData);

      const updatedDoc = await scheduleRef.get();

      functions.logger.info(`Schedule updated: ${data.scheduleId}`);

      return {
        success: true,
        scheduleId: data.scheduleId,
        schedule: { id: data.scheduleId, ...updatedDoc.data() },
        message: "Schedule updated successfully",
      };
    } catch (error: any) {
      functions.logger.error("Error updating schedule:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Delete a schedule
 * @param data - { scheduleId: string }
 * @returns Success confirmation
 */
export const deleteSchedule = functions.https.onCall(
  async (data: { scheduleId: string }, context) => {
    await verifyAdmin(context);
    const db = admin.firestore();

    if (!data.scheduleId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "scheduleId is required",
      );
    }

    try {
      const scheduleRef = db
        .collection("content_schedules")
        .doc(data.scheduleId);
      const scheduleDoc = await scheduleRef.get();

      if (!scheduleDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Schedule not found");
      }

      const scheduleName = scheduleDoc.data()?.name;

      // Delete the schedule
      await scheduleRef.delete();

      // Optionally archive execution history (keep for audit purposes)
      // In production, you might move history to an archive collection instead of deleting

      functions.logger.info(`Schedule deleted: ${data.scheduleId}`, {
        name: scheduleName,
      });

      return {
        success: true,
        scheduleId: data.scheduleId,
        message: `Schedule "${scheduleName}" deleted successfully`,
      };
    } catch (error: any) {
      functions.logger.error("Error deleting schedule:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Get all schedules with optional filtering
 * @param data - { websiteId?: string, enabled?: boolean }
 * @returns List of schedules
 */
export const getSchedules = functions.https.onCall(
  async (data: { websiteId?: string; enabled?: boolean }, context) => {
    await verifyAdmin(context);
    const db = admin.firestore();

    try {
      let query: FirebaseFirestore.Query = db.collection("content_schedules");

      // Apply filters
      if (data.websiteId) {
        query = query.where("websiteId", "==", data.websiteId);
      }
      if (data.enabled !== undefined) {
        query = query.where("enabled", "==", data.enabled);
      }

      // Order by creation date
      query = query.orderBy("createdAt", "desc");

      const snapshot = await query.get();
      const schedules: Schedule[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Schedule[];

      // Get execution counts for each schedule
      const schedulesWithStats = await Promise.all(
        schedules.map(async (schedule) => {
          const executionsSnapshot = await db
            .collection("schedule_executions")
            .where("scheduleId", "==", schedule.id)
            .limit(1)
            .get();

          const totalExecutionsSnapshot = await db
            .collection("schedule_executions")
            .where("scheduleId", "==", schedule.id)
            .get();

          const successfulExecutionsSnapshot = await db
            .collection("schedule_executions")
            .where("scheduleId", "==", schedule.id)
            .where("status", "==", "completed")
            .get();

          return {
            ...schedule,
            totalExecutions: totalExecutionsSnapshot.size,
            successfulExecutions: successfulExecutionsSnapshot.size,
          };
        }),
      );

      return {
        success: true,
        schedules: schedulesWithStats,
        total: schedules.length,
      };
    } catch (error: any) {
      functions.logger.error("Error fetching schedules:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Execute a scheduled content generation manually or via scheduler
 * @param data - { scheduleId: string, triggeredBy?: 'scheduled' | 'manual' }
 * @returns Execution result
 */
export const executeScheduledGeneration = functions.https.onCall(
  async (
    data: { scheduleId: string; triggeredBy?: "scheduled" | "manual" },
    context,
  ) => {
    let userId: string | undefined;

    // For manual triggers, require admin auth
    if (data.triggeredBy !== "scheduled") {
      userId = await verifyAdmin(context);
    }

    const db = admin.firestore();
    const startTime = Date.now();

    if (!data.scheduleId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "scheduleId is required",
      );
    }

    try {
      // Get schedule
      const scheduleRef = db
        .collection("content_schedules")
        .doc(data.scheduleId);
      const scheduleDoc = await scheduleRef.get();

      if (!scheduleDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Schedule not found");
      }

      const schedule = scheduleDoc.data() as Schedule;

      // Check if schedule is enabled (skip for manual triggers)
      if (!schedule.enabled && data.triggeredBy === "scheduled") {
        return {
          success: false,
          message: "Schedule is disabled",
          skipped: true,
        };
      }

      // Create execution record
      const executionData: Omit<ScheduleExecution, "id"> = {
        scheduleId: data.scheduleId,
        scheduleName: schedule.name,
        status: "running",
        startedAt: admin.firestore.Timestamp.now(),
        itemsProcessed: 0,
        itemsSucceeded: 0,
        itemsFailed: 0,
        triggeredBy: data.triggeredBy || "manual",
        triggeredByUserId: userId,
        generatedContentIds: [],
      };

      const executionRef = await db
        .collection("schedule_executions")
        .add(executionData);
      const executionId = executionRef.id;

      functions.logger.info(`Starting scheduled generation: ${executionId}`, {
        scheduleId: data.scheduleId,
        scheduleName: schedule.name,
      });

      // Process content generation
      let itemsProcessed = 0;
      let itemsSucceeded = 0;
      let itemsFailed = 0;
      const generatedContentIds: string[] = [];
      const qualityScores: number[] = [];

      // Get existing content to avoid duplicates
      const existingContentSnapshot = await db
        .collection("service_content")
        .where("websiteId", "==", schedule.websiteId)
        .get();

      const existingContentIds = new Set(
        existingContentSnapshot.docs.map((doc) => doc.id),
      );

      // Generate combinations of locations and services
      const combinations: Array<{ locationId: string; serviceId: string }> = [];
      for (const locationId of schedule.locationIds) {
        for (const serviceId of schedule.serviceIds) {
          const contentId = `${serviceId}-${locationId}`;
          // Skip if content already exists
          if (!existingContentIds.has(contentId)) {
            combinations.push({ locationId, serviceId });
          }
        }
      }

      // Limit to maxItemsPerRun
      const itemsToProcess = combinations.slice(0, schedule.maxItemsPerRun);

      functions.logger.info(
        `Processing ${itemsToProcess.length} items for schedule ${schedule.name}`,
      );

      // Process each combination
      for (const { locationId, serviceId } of itemsToProcess) {
        try {
          itemsProcessed++;

          // Get location and service data
          const [locationDoc, serviceDoc] = await Promise.all([
            db.collection("locations").doc(locationId).get(),
            db.collection("services").doc(serviceId).get(),
          ]);

          if (!locationDoc.exists || !serviceDoc.exists) {
            functions.logger.warn(
              `Location or service not found: ${locationId}, ${serviceId}`,
            );
            itemsFailed++;
            continue;
          }

          const location = locationDoc.data();
          const service = serviceDoc.data();

          // Create content entry (in production, this would call the AI content generator)
          const contentId = `${serviceId}-${locationId}`;

          // Generate placeholder content (in production, call generateServiceContent)
          const contentData = {
            serviceId,
            locationId,
            websiteId: schedule.websiteId,
            title: `${service?.name || serviceId} in ${location?.name || locationId}`,
            metaDescription: `Professional ${service?.name?.toLowerCase() || "service"} in ${location?.name || locationId}. Royal Carriage Limousine provides premium transportation services.`,
            content: "", // Would be AI-generated in production
            keywords: service?.keywords || [],
            approvalStatus: "pending",
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            generatedBySchedule: data.scheduleId,
            scheduleName: schedule.name,
            aiQualityScore: Math.floor(Math.random() * 30) + 70, // Simulated score
          };

          await db
            .collection("service_content")
            .doc(contentId)
            .set(contentData);

          // Add to approval queue
          await db.collection("content_approval_queue").add({
            contentId,
            contentType: "service-location",
            status: "pending",
            serviceId,
            locationId,
            websiteId: schedule.websiteId,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            generatedBySchedule: data.scheduleId,
          });

          generatedContentIds.push(contentId);
          qualityScores.push(contentData.aiQualityScore);
          itemsSucceeded++;

          functions.logger.info(`Generated content: ${contentId}`);
        } catch (error) {
          functions.logger.error(
            `Failed to generate content for ${locationId}-${serviceId}:`,
            error,
          );
          itemsFailed++;
        }

        // Update progress periodically
        if (itemsProcessed % 10 === 0) {
          await executionRef.update({
            itemsProcessed,
            itemsSucceeded,
            itemsFailed,
          });
        }
      }

      // Calculate average quality score
      const averageQualityScore =
        qualityScores.length > 0
          ? Math.round(
              qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length,
            )
          : undefined;

      // Determine final status
      let finalStatus: ScheduleExecution["status"] = "completed";
      if (itemsFailed > 0 && itemsSucceeded === 0) {
        finalStatus = "failed";
      } else if (itemsFailed > 0) {
        finalStatus = "partial";
      }

      const duration = Date.now() - startTime;

      // Update execution record
      await executionRef.update({
        status: finalStatus,
        completedAt: admin.firestore.Timestamp.now(),
        duration,
        itemsProcessed,
        itemsSucceeded,
        itemsFailed,
        averageQualityScore,
        generatedContentIds,
      });

      // Update schedule with last execution time and next execution
      const nextExecution = calculateNextExecution(
        schedule.cronExpression,
        schedule.timezone,
      );
      await scheduleRef.update({
        lastExecutedAt: admin.firestore.Timestamp.now(),
        nextExecutionAt: admin.firestore.Timestamp.fromDate(nextExecution),
      });

      functions.logger.info(`Scheduled generation completed: ${executionId}`, {
        status: finalStatus,
        itemsProcessed,
        itemsSucceeded,
        itemsFailed,
        duration,
      });

      // Send notification if enabled
      if (schedule.notifyOnComplete && schedule.notifyEmail) {
        await sendExecutionNotification(schedule, {
          status: finalStatus,
          itemsProcessed,
          itemsSucceeded,
          itemsFailed,
          averageQualityScore,
          duration,
        });
      }

      return {
        success: true,
        executionId,
        status: finalStatus,
        itemsProcessed,
        itemsSucceeded,
        itemsFailed,
        averageQualityScore,
        duration,
        generatedContentIds,
        message: `Schedule "${schedule.name}" execution ${finalStatus}. ${itemsSucceeded} items generated.`,
      };
    } catch (error: any) {
      functions.logger.error("Error executing scheduled generation:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Get execution history for a schedule
 * @param data - { scheduleId?: string, limit?: number, offset?: number }
 * @returns List of executions
 */
export const getScheduleHistory = functions.https.onCall(
  async (
    data: { scheduleId?: string; limit?: number; offset?: number },
    context,
  ) => {
    await verifyAdmin(context);
    const db = admin.firestore();

    try {
      const limit = Math.min(data.limit || 50, 100);

      let query: FirebaseFirestore.Query = db
        .collection("schedule_executions")
        .orderBy("startedAt", "desc");

      if (data.scheduleId) {
        query = query.where("scheduleId", "==", data.scheduleId);
      }

      query = query.limit(limit);

      const snapshot = await query.get();
      const executions: ScheduleExecution[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduleExecution[];

      // Get total count
      let countQuery: FirebaseFirestore.Query = db.collection(
        "schedule_executions",
      );
      if (data.scheduleId) {
        countQuery = countQuery.where("scheduleId", "==", data.scheduleId);
      }
      const countSnapshot = await countQuery.count().get();
      const total = countSnapshot.data().count;

      // Calculate aggregate statistics
      const completedExecutions = executions.filter(
        (e) => e.status === "completed",
      );
      const totalItemsGenerated = executions.reduce(
        (sum, e) => sum + (e.itemsSucceeded || 0),
        0,
      );
      const avgDuration =
        executions.length > 0
          ? Math.round(
              executions.reduce((sum, e) => sum + (e.duration || 0), 0) /
                executions.length,
            )
          : 0;

      return {
        success: true,
        executions,
        total,
        statistics: {
          totalExecutions: total,
          completedExecutions: completedExecutions.length,
          totalItemsGenerated,
          averageDuration: avgDuration,
          successRate:
            total > 0
              ? Math.round((completedExecutions.length / total) * 100)
              : 0,
        },
      };
    } catch (error: any) {
      functions.logger.error("Error fetching schedule history:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Pub/Sub scheduled function to run enabled schedules
 * Runs every hour to check for schedules that need execution
 */
export const processScheduledGenerations = functions.pubsub
  .schedule("0 * * * *") // Every hour
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    functions.logger.info("Processing scheduled generations...");

    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    try {
      // Find enabled schedules that are due for execution
      const schedulesSnapshot = await db
        .collection("content_schedules")
        .where("enabled", "==", true)
        .where("nextExecutionAt", "<=", now)
        .get();

      if (schedulesSnapshot.empty) {
        functions.logger.info("No scheduled generations due");
        return null;
      }

      functions.logger.info(
        `Found ${schedulesSnapshot.size} schedules to execute`,
      );

      for (const doc of schedulesSnapshot.docs) {
        try {
          const schedule = doc.data() as Schedule;

          functions.logger.info(`Executing schedule: ${schedule.name}`);

          // Execute the generation
          await executeScheduledGeneration.run(
            { scheduleId: doc.id, triggeredBy: "scheduled" },
            {} as any, // No auth context for scheduled execution
          );
        } catch (error) {
          functions.logger.error(
            `Failed to execute schedule ${doc.id}:`,
            error,
          );
        }
      }

      return null;
    } catch (error) {
      functions.logger.error("Error processing scheduled generations:", error);
      throw error;
    }
  });

/**
 * Helper function to send execution notification
 */
async function sendExecutionNotification(
  schedule: Schedule,
  result: {
    status: string;
    itemsProcessed: number;
    itemsSucceeded: number;
    itemsFailed: number;
    averageQualityScore?: number;
    duration: number;
  },
): Promise<void> {
  try {
    // In production, integrate with SendGrid or similar email service
    functions.logger.info("Sending execution notification", {
      scheduleName: schedule.name,
      email: schedule.notifyEmail,
      result,
    });

    // Store notification in Firestore for now
    const db = admin.firestore();
    await db.collection("notifications").add({
      type: "schedule_execution",
      recipientEmail: schedule.notifyEmail,
      scheduleName: schedule.name,
      scheduleId: schedule.id,
      result,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
  } catch (error) {
    functions.logger.error("Failed to send execution notification:", error);
  }
}

/**
 * Toggle schedule enabled status
 * @param data - { scheduleId: string, enabled: boolean }
 * @returns Updated schedule
 */
export const toggleSchedule = functions.https.onCall(
  async (data: { scheduleId: string; enabled: boolean }, context) => {
    await verifyAdmin(context);
    const db = admin.firestore();

    if (!data.scheduleId || data.enabled === undefined) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "scheduleId and enabled are required",
      );
    }

    try {
      const scheduleRef = db
        .collection("content_schedules")
        .doc(data.scheduleId);
      const scheduleDoc = await scheduleRef.get();

      if (!scheduleDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Schedule not found");
      }

      const schedule = scheduleDoc.data() as Schedule;

      // Calculate next execution if enabling
      const updateData: Partial<Schedule> = {
        enabled: data.enabled,
        updatedAt: admin.firestore.Timestamp.now(),
      };

      if (data.enabled) {
        const nextExecution = calculateNextExecution(
          schedule.cronExpression,
          schedule.timezone,
        );
        updateData.nextExecutionAt =
          admin.firestore.Timestamp.fromDate(nextExecution);
      }

      await scheduleRef.update(updateData);

      functions.logger.info(
        `Schedule ${data.scheduleId} ${data.enabled ? "enabled" : "disabled"}`,
      );

      return {
        success: true,
        scheduleId: data.scheduleId,
        enabled: data.enabled,
        message: `Schedule "${schedule.name}" ${data.enabled ? "enabled" : "disabled"}`,
      };
    } catch (error: any) {
      functions.logger.error("Error toggling schedule:", error);
      if (error instanceof functions.https.HttpsError) throw error;
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);
