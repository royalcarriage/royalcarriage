/**
 * P2.3: Content Suggestion Approval Workflow
 * - Admin approve/reject generated content
 * - Publish workflow with versioning
 * - Batch approval for efficiency
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

/**
 * Get pending content for approval
 * Returns list of content awaiting admin review
 */
export const getPendingContentApprovals = functions.https.onCall(
  async (data, context) => {
    if (
      !context.auth?.token?.role ||
      !["admin", "superadmin", "editor"].includes(context.auth.token.role)
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Editor access required",
      );
    }

    const { websiteId, limit = 50, offset = 0 } = data;

    try {
      const db = admin.firestore();

      let query = db
        .collection("service_content")
        .where("status", "==", "generated")
        .orderBy("generatedAt", "desc");

      if (websiteId) {
        query = query.where("websiteId", "==", websiteId);
      }

      const snapshot = await query.limit(limit).offset(offset).get();

      const pendingContent = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        // Include quality score preview
        qualityIndicator:
          doc.data().qualityScore >= 90
            ? "excellent"
            : doc.data().qualityScore >= 80
              ? "good"
              : doc.data().qualityScore >= 70
                ? "acceptable"
                : "needs_review",
      }));

      // Get total count for pagination
      const countSnapshot = await db
        .collection("service_content")
        .where("status", "==", "generated")
        .count()
        .get();

      return {
        content: pendingContent,
        total: countSnapshot.data().count,
        limit,
        offset,
      };
    } catch (error) {
      functions.logger.error("[getPendingContentApprovals] Error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get pending content",
      );
    }
  },
);

/**
 * Approve content for publishing
 * Updates status and creates approval record
 */
export const approveContent = functions.https.onCall(async (data, context) => {
  if (
    !context.auth?.token?.role ||
    !["admin", "superadmin", "editor"].includes(context.auth.token.role)
  ) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Editor access required",
    );
  }

  const { contentId, notes, publishImmediately = false } = data;

  if (!contentId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "contentId is required",
    );
  }

  try {
    const db = admin.firestore();
    const batch = db.batch();

    const contentRef = db.collection("service_content").doc(contentId);
    const contentDoc = await contentRef.get();

    if (!contentDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Content not found");
    }

    const contentData = contentDoc.data();
    const newStatus = publishImmediately ? "published" : "approved";

    // Update content status
    batch.update(contentRef, {
      status: newStatus,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      approvedBy: context.auth?.uid,
      approvalNotes: notes || "",
      publishedAt: publishImmediately
        ? admin.firestore.FieldValue.serverTimestamp()
        : null,
    });

    // Create approval record
    const approvalRef = db.collection("content_approvals").doc();
    batch.set(approvalRef, {
      contentId,
      locationId: contentData?.locationId,
      serviceId: contentData?.serviceId,
      websiteId: contentData?.websiteId,
      action: "approved",
      notes: notes || "",
      publishedImmediately: publishImmediately,
      approvedBy: context.auth?.uid,
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If publishing immediately, create page mapping
    if (publishImmediately) {
      const pageMappingRef = db.collection("page_mappings").doc(contentId);
      batch.set(
        pageMappingRef,
        {
          contentId,
          locationId: contentData?.locationId,
          serviceId: contentData?.serviceId,
          websiteId: contentData?.websiteId,
          pagePath: `/${contentData?.locationId}/${contentData?.serviceId}`,
          status: "published",
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
          publishedBy: context.auth?.uid,
        },
        { merge: true },
      );
    }

    await batch.commit();

    functions.logger.info("[approveContent] Content approved", {
      contentId,
      publishedImmediately: publishImmediately,
    });

    return { success: true, contentId, status: newStatus };
  } catch (error) {
    functions.logger.error("[approveContent] Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to approve content",
    );
  }
});

/**
 * Reject content with feedback
 * Marks content for revision and stores feedback
 */
export const rejectContent = functions.https.onCall(async (data, context) => {
  if (
    !context.auth?.token?.role ||
    !["admin", "superadmin", "editor"].includes(context.auth.token.role)
  ) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Editor access required",
    );
  }

  const {
    contentId,
    reason,
    feedbackDetails,
    requestRegeneration = false,
  } = data;

  if (!contentId || !reason) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "contentId and reason are required",
    );
  }

  try {
    const db = admin.firestore();
    const batch = db.batch();

    const contentRef = db.collection("service_content").doc(contentId);
    const contentDoc = await contentRef.get();

    if (!contentDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Content not found");
    }

    const contentData = contentDoc.data();

    // Update content status
    batch.update(contentRef, {
      status: requestRegeneration ? "pending_regeneration" : "rejected",
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
      rejectedBy: context.auth?.uid,
      rejectionReason: reason,
      rejectionFeedback: feedbackDetails || "",
    });

    // Create rejection record
    const rejectionRef = db.collection("content_approvals").doc();
    batch.set(rejectionRef, {
      contentId,
      locationId: contentData?.locationId,
      serviceId: contentData?.serviceId,
      websiteId: contentData?.websiteId,
      action: "rejected",
      reason,
      feedbackDetails: feedbackDetails || "",
      requestedRegeneration: requestRegeneration,
      rejectedBy: context.auth?.uid,
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If regeneration requested, add to queue
    if (requestRegeneration) {
      const queueRef = db.collection("regeneration_queue").doc(contentId);
      batch.set(queueRef, {
        locationId: contentData?.locationId,
        serviceId: contentData?.serviceId,
        websiteId: contentData?.websiteId,
        reason: `Rejected: ${reason}`,
        priority: 10, // High priority for rejected content
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        requestedBy: context.auth?.uid,
        feedbackToIncorporate: feedbackDetails || "",
      });
    }

    await batch.commit();

    functions.logger.info("[rejectContent] Content rejected", {
      contentId,
      reason,
      requestedRegeneration: requestRegeneration,
    });

    return {
      success: true,
      contentId,
      status: requestRegeneration ? "pending_regeneration" : "rejected",
    };
  } catch (error) {
    functions.logger.error("[rejectContent] Error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to reject content",
    );
  }
});

/**
 * Batch approve multiple content items
 * Efficient bulk approval for high-quality content
 */
export const batchApproveContent = functions.https.onCall(
  async (data, context) => {
    if (
      !context.auth?.token?.role ||
      !["admin", "superadmin"].includes(context.auth.token.role)
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Admin access required",
      );
    }

    const { contentIds, publishImmediately = false, notes } = data;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "contentIds array is required",
      );
    }

    if (contentIds.length > 100) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Maximum 100 items per batch",
      );
    }

    try {
      const db = admin.firestore();
      const results = {
        approved: [] as string[],
        failed: [] as { id: string; error: string }[],
      };

      // Process in batches of 10 (Firestore batch limit is 500, but we're being conservative)
      const batchSize = 10;
      for (let i = 0; i < contentIds.length; i += batchSize) {
        const chunk = contentIds.slice(i, i + batchSize);
        const batch = db.batch();

        for (const contentId of chunk) {
          try {
            const contentRef = db.collection("service_content").doc(contentId);
            const contentDoc = await contentRef.get();

            if (!contentDoc.exists) {
              results.failed.push({ id: contentId, error: "Not found" });
              continue;
            }

            const contentData = contentDoc.data();
            const newStatus = publishImmediately ? "published" : "approved";

            batch.update(contentRef, {
              status: newStatus,
              approvedAt: admin.firestore.FieldValue.serverTimestamp(),
              approvedBy: context.auth?.uid,
              approvalNotes: notes || "Batch approved",
              publishedAt: publishImmediately
                ? admin.firestore.FieldValue.serverTimestamp()
                : null,
            });

            // Create approval record
            const approvalRef = db.collection("content_approvals").doc();
            batch.set(approvalRef, {
              contentId,
              locationId: contentData?.locationId,
              serviceId: contentData?.serviceId,
              websiteId: contentData?.websiteId,
              action: "batch_approved",
              notes: notes || "Batch approved",
              publishedImmediately: publishImmediately,
              approvedBy: context.auth?.uid,
              approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            // If publishing immediately, create page mapping
            if (publishImmediately) {
              const pageMappingRef = db
                .collection("page_mappings")
                .doc(contentId);
              batch.set(
                pageMappingRef,
                {
                  contentId,
                  locationId: contentData?.locationId,
                  serviceId: contentData?.serviceId,
                  websiteId: contentData?.websiteId,
                  pagePath: `/${contentData?.locationId}/${contentData?.serviceId}`,
                  status: "published",
                  publishedAt: admin.firestore.FieldValue.serverTimestamp(),
                  publishedBy: context.auth?.uid,
                },
                { merge: true },
              );
            }

            results.approved.push(contentId);
          } catch (err) {
            results.failed.push({
              id: contentId,
              error: err instanceof Error ? err.message : "Unknown error",
            });
          }
        }

        await batch.commit();
      }

      functions.logger.info("[batchApproveContent] Batch approval complete", {
        approved: results.approved.length,
        failed: results.failed.length,
      });

      return results;
    } catch (error) {
      functions.logger.error("[batchApproveContent] Error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to batch approve content",
      );
    }
  },
);

/**
 * Publish approved content
 * Moves approved content to published status and creates page mappings
 */
export const publishApprovedContent = functions.https.onCall(
  async (data, context) => {
    if (
      !context.auth?.token?.role ||
      !["admin", "superadmin"].includes(context.auth.token.role)
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Admin access required",
      );
    }

    const { websiteId, publishAll = false, contentIds } = data;

    try {
      const db = admin.firestore();

      let query = db
        .collection("service_content")
        .where("status", "==", "approved");

      if (websiteId) {
        query = query.where("websiteId", "==", websiteId);
      }

      let snapshot;
      if (publishAll) {
        snapshot = await query.get();
      } else if (contentIds && contentIds.length > 0) {
        // Get specific content items
        const docs = await Promise.all(
          contentIds.map((id) =>
            db.collection("service_content").doc(id).get(),
          ),
        );
        snapshot = {
          docs: docs.filter((d) => d.exists && d.data()?.status === "approved"),
          size: docs.filter((d) => d.exists && d.data()?.status === "approved")
            .length,
        };
      } else {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Either publishAll or contentIds is required",
        );
      }

      if (snapshot.size === 0) {
        return { published: 0, message: "No approved content to publish" };
      }

      const results = {
        published: 0,
        failed: 0,
      };

      // Process in batches
      const batchSize = 100;
      const docs = Array.isArray(snapshot.docs) ? snapshot.docs : [];

      for (let i = 0; i < docs.length; i += batchSize) {
        const chunk = docs.slice(i, i + batchSize);
        const batch = db.batch();

        for (const doc of chunk) {
          const contentData = doc.data();

          batch.update(doc.ref, {
            status: "published",
            publishedAt: admin.firestore.FieldValue.serverTimestamp(),
            publishedBy: context.auth?.uid,
          });

          // Create page mapping
          const pageMappingRef = db.collection("page_mappings").doc(doc.id);
          batch.set(
            pageMappingRef,
            {
              contentId: doc.id,
              locationId: contentData?.locationId,
              serviceId: contentData?.serviceId,
              websiteId: contentData?.websiteId,
              pagePath: `/${contentData?.locationId}/${contentData?.serviceId}`,
              status: "published",
              publishedAt: admin.firestore.FieldValue.serverTimestamp(),
              publishedBy: context.auth?.uid,
            },
            { merge: true },
          );

          results.published++;
        }

        await batch.commit();
      }

      functions.logger.info("[publishApprovedContent] Content published", {
        published: results.published,
        websiteId,
      });

      return results;
    } catch (error) {
      functions.logger.error("[publishApprovedContent] Error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to publish content",
      );
    }
  },
);

/**
 * Get content approval statistics
 * Dashboard summary of approval workflow status
 */
export const getApprovalStatistics = functions.https.onCall(
  async (data, context) => {
    if (
      !context.auth?.token?.role ||
      !["admin", "superadmin", "editor", "viewer"].includes(
        context.auth.token.role,
      )
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Access denied",
      );
    }

    const { websiteId, dateRange = 30 } = data;

    try {
      const db = admin.firestore();

      // Get counts by status
      const statuses = [
        "generated",
        "approved",
        "published",
        "rejected",
        "pending_regeneration",
      ];
      const statusCounts: { [key: string]: number } = {};

      for (const status of statuses) {
        let query = db
          .collection("service_content")
          .where("status", "==", status);

        if (websiteId) {
          query = query.where("websiteId", "==", websiteId);
        }

        const countSnapshot = await query.count().get();
        statusCounts[status] = countSnapshot.data().count;
      }

      // Get recent approval activity
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dateRange);

      const recentApprovalsSnapshot = await db
        .collection("content_approvals")
        .where("approvedAt", ">=", cutoffDate)
        .orderBy("approvedAt", "desc")
        .limit(100)
        .get();

      const approvalsByDay: {
        [key: string]: { approved: number; rejected: number };
      } = {};

      recentApprovalsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const date =
          data.approvedAt?.toDate?.()?.toISOString?.()?.split("T")[0] ||
          data.rejectedAt?.toDate?.()?.toISOString?.()?.split("T")[0];

        if (date) {
          if (!approvalsByDay[date]) {
            approvalsByDay[date] = { approved: 0, rejected: 0 };
          }

          if (data.action === "approved" || data.action === "batch_approved") {
            approvalsByDay[date].approved++;
          } else if (data.action === "rejected") {
            approvalsByDay[date].rejected++;
          }
        }
      });

      // Calculate quality score distribution
      const qualitySnapshot = await db
        .collection("service_content")
        .where("qualityScore", ">", 0)
        .get();

      const qualityDistribution = {
        excellent: 0, // 90-100
        good: 0, // 80-89
        acceptable: 0, // 70-79
        needsWork: 0, // <70
      };

      qualitySnapshot.docs.forEach((doc) => {
        const score = doc.data().qualityScore;
        if (score >= 90) qualityDistribution.excellent++;
        else if (score >= 80) qualityDistribution.good++;
        else if (score >= 70) qualityDistribution.acceptable++;
        else qualityDistribution.needsWork++;
      });

      return {
        statusCounts,
        approvalsByDay,
        qualityDistribution,
        totalContent: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        pendingApproval: statusCounts.generated || 0,
        readyToPublish: statusCounts.approved || 0,
      };
    } catch (error) {
      functions.logger.error("[getApprovalStatistics] Error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get approval statistics",
      );
    }
  },
);

/**
 * Request content revision with specific feedback
 */
export const requestContentRevision = functions.https.onCall(
  async (data, context) => {
    if (
      !context.auth?.token?.role ||
      !["admin", "superadmin", "editor"].includes(context.auth.token.role)
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Editor access required",
      );
    }

    const { contentId, revisionNotes, specificChanges } = data;

    if (!contentId || !revisionNotes) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "contentId and revisionNotes are required",
      );
    }

    try {
      const db = admin.firestore();

      const contentRef = db.collection("service_content").doc(contentId);
      const contentDoc = await contentRef.get();

      if (!contentDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Content not found");
      }

      const contentData = contentDoc.data();

      // Update content with revision request
      await contentRef.update({
        status: "revision_requested",
        revisionNotes,
        specificChanges: specificChanges || [],
        revisionRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
        revisionRequestedBy: context.auth?.uid,
      });

      // Add to regeneration queue with revision feedback
      await db
        .collection("regeneration_queue")
        .doc(contentId)
        .set({
          locationId: contentData?.locationId,
          serviceId: contentData?.serviceId,
          websiteId: contentData?.websiteId,
          reason: "Revision requested",
          priority: 8, // High priority for revisions
          status: "pending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          requestedBy: context.auth?.uid,
          revisionNotes,
          specificChanges: specificChanges || [],
          originalContentId: contentId,
        });

      functions.logger.info("[requestContentRevision] Revision requested", {
        contentId,
      });

      return { success: true, contentId, status: "revision_requested" };
    } catch (error) {
      functions.logger.error("[requestContentRevision] Error:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to request revision",
      );
    }
  },
);
