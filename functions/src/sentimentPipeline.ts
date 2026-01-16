/**
 * P2.2: Sentiment Analysis Pipeline Enhancements
 * - Email notifications for negative feedback
 * - Auto-generate response suggestions
 * - Alert escalation workflow
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { geminiClient } from './shared/gemini-client';

/**
 * Firestore trigger: Send email notification on negative feedback
 * Triggers when a new feedback_alert document is created
 */
export const notifyOnNegativeFeedback = functions.firestore
  .document('feedback_alerts/{alertId}')
  .onCreate(async (snap, context) => {
    const alertData = snap.data();
    const alertId = context.params.alertId;

    functions.logger.info('[notifyOnNegativeFeedback] Processing alert', {
      alertId,
      sentiment: alertData.sentiment,
    });

    try {
      const db = admin.firestore();

      // Get admin users to notify
      const adminsSnapshot = await db
        .collection('users')
        .where('role', 'in', ['admin', 'superadmin'])
        .where('emailNotifications', '==', true)
        .get();

      const adminEmails = adminsSnapshot.docs
        .map(doc => doc.data().email)
        .filter(Boolean);

      // Store notification record
      const notification = {
        type: 'negative_feedback_alert',
        alertId,
        feedbackId: alertData.feedbackId,
        sentiment: alertData.sentiment,
        feedbackText: alertData.text?.substring(0, 200) || 'No text',
        recipients: adminEmails,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('notifications').add(notification);

      // In production, integrate with email service (SendGrid, etc.)
      // For now, we log and store the notification
      functions.logger.info('[notifyOnNegativeFeedback] Notification created', {
        alertId,
        recipientCount: adminEmails.length,
      });

      // Update alert status
      await snap.ref.update({
        notificationSent: true,
        notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        notifiedRecipients: adminEmails.length,
      });

      return null;
    } catch (error) {
      functions.logger.error('[notifyOnNegativeFeedback] Error:', error);
      return null;
    }
  });

/**
 * Generate AI response suggestions for negative feedback
 * Callable function for admin dashboard
 */
export const generateResponseSuggestion = functions.https.onCall(
  async (data, context) => {
    // Verify admin role
    if (!context.auth?.token?.role ||
        !['admin', 'superadmin', 'editor'].includes(context.auth.token.role)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required'
      );
    }

    const { feedbackId } = data;

    if (!feedbackId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'feedbackId is required'
      );
    }

    try {
      const db = admin.firestore();

      // Get feedback document
      const feedbackDoc = await db.collection('feedback').doc(feedbackId).get();

      if (!feedbackDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Feedback not found');
      }

      const feedback = feedbackDoc.data();
      const feedbackText = feedback?.text || feedback?.comment || '';

      const prompt = `You are a customer service representative for Royal Carriage Limousine, a premium luxury transportation company in Chicago.

A customer has left the following feedback:
"${feedbackText}"

Sentiment Analysis: ${feedback?.sentiment || 'negative'}
Categories: ${(feedback?.categories || []).join(', ') || 'general concern'}

Generate 3 professional response options:
1. A brief apology and acknowledgment (2-3 sentences)
2. A detailed response addressing specific concerns (4-5 sentences)
3. A response offering compensation or follow-up (3-4 sentences)

Each response should:
- Be empathetic and professional
- Acknowledge the customer's concerns
- Offer a path to resolution
- Maintain the luxury brand image

Respond with valid JSON:
{
  "suggestions": [
    {
      "type": "brief",
      "response": "...",
      "tone": "apologetic"
    },
    {
      "type": "detailed",
      "response": "...",
      "tone": "empathetic"
    },
    {
      "type": "compensation",
      "response": "...",
      "tone": "resolution-focused"
    }
  ],
  "recommendedAction": "call_customer|send_email|escalate_manager|no_action",
  "urgency": "high|medium|low"
}`;

      functions.logger.info('[generateResponseSuggestion] Generating suggestions', {
        feedbackId,
      });

      const response = await geminiClient.generateContent(prompt, {
        model: 'gemini-1.5-pro',
        temperature: 0.7,
        maxOutputTokens: 2048,
      });

      const result = geminiClient.parseJSON(response, {
        suggestions: [
          {
            type: 'brief',
            response: 'We apologize for your experience and would like to make it right. Please contact us at your convenience.',
            tone: 'apologetic',
          },
        ],
        recommendedAction: 'send_email',
        urgency: 'medium',
      });

      // Store suggestions for reference
      await db.collection('response_suggestions').add({
        feedbackId,
        suggestions: result?.suggestions || [],
        recommendedAction: result?.recommendedAction,
        urgency: result?.urgency,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        generatedBy: context.auth.uid,
      });

      functions.logger.info('[generateResponseSuggestion] Suggestions generated', {
        feedbackId,
        suggestionCount: result?.suggestions?.length,
      });

      return result;
    } catch (error) {
      functions.logger.error('[generateResponseSuggestion] Error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate response suggestions'
      );
    }
  }
);

/**
 * Submit response to customer feedback
 * Records the response and updates feedback status
 */
export const submitFeedbackResponse = functions.https.onCall(
  async (data, context) => {
    if (!context.auth?.token?.role ||
        !['admin', 'superadmin', 'editor'].includes(context.auth.token.role)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required'
      );
    }

    const { feedbackId, responseText, responseType } = data;

    if (!feedbackId || !responseText) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'feedbackId and responseText are required'
      );
    }

    try {
      const db = admin.firestore();
      const batch = db.batch();

      // Update feedback document
      const feedbackRef = db.collection('feedback').doc(feedbackId);
      batch.update(feedbackRef, {
        status: 'responded',
        response: responseText,
        responseType: responseType || 'manual',
        respondedAt: admin.firestore.FieldValue.serverTimestamp(),
        respondedBy: context.auth?.uid,
      });

      // Update any related alerts
      const alertsSnapshot = await db
        .collection('feedback_alerts')
        .where('feedbackId', '==', feedbackId)
        .get();

      alertsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'resolved',
          resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
          resolvedBy: context.auth?.uid,
        });
      });

      // Create response log
      const responseLogRef = db.collection('feedback_responses').doc();
      batch.set(responseLogRef, {
        feedbackId,
        responseText,
        responseType: responseType || 'manual',
        respondedBy: context.auth?.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      functions.logger.info('[submitFeedbackResponse] Response submitted', {
        feedbackId,
        responseType,
      });

      return { success: true, feedbackId };
    } catch (error) {
      functions.logger.error('[submitFeedbackResponse] Error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to submit response'
      );
    }
  }
);

/**
 * Get feedback alerts dashboard data
 * Returns summary and list of pending alerts
 */
export const getFeedbackAlertsDashboard = functions.https.onCall(
  async (data, context) => {
    if (!context.auth?.token?.role ||
        !['admin', 'superadmin', 'editor', 'viewer'].includes(context.auth.token.role)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Access denied'
      );
    }

    try {
      const db = admin.firestore();

      // Get pending alerts
      const pendingSnapshot = await db
        .collection('feedback_alerts')
        .where('status', '==', 'pending_review')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      // Get counts by status
      const allAlertsSnapshot = await db.collection('feedback_alerts').get();

      const statusCounts = {
        pending_review: 0,
        resolved: 0,
        escalated: 0,
      };

      allAlertsSnapshot.docs.forEach(doc => {
        const status = doc.data().status || 'pending_review';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      // Get sentiment distribution from recent feedback
      const recentFeedbackSnapshot = await db
        .collection('feedback')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();

      const sentimentCounts = {
        positive: 0,
        neutral: 0,
        negative: 0,
      };

      recentFeedbackSnapshot.docs.forEach(doc => {
        const sentiment = doc.data().sentiment || 'neutral';
        sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
      });

      const pendingAlerts = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        alerts: pendingAlerts,
        summary: {
          pending: statusCounts.pending_review,
          resolved: statusCounts.resolved,
          escalated: statusCounts.escalated,
          total: allAlertsSnapshot.size,
        },
        sentimentDistribution: sentimentCounts,
      };
    } catch (error) {
      functions.logger.error('[getFeedbackAlertsDashboard] Error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get dashboard data'
      );
    }
  }
);

/**
 * Escalate feedback alert to management
 */
export const escalateFeedbackAlert = functions.https.onCall(
  async (data, context) => {
    if (!context.auth?.token?.role ||
        !['admin', 'superadmin'].includes(context.auth.token.role)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Admin access required'
      );
    }

    const { alertId, reason, notes } = data;

    if (!alertId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'alertId is required'
      );
    }

    try {
      const db = admin.firestore();

      // Update alert status
      await db.collection('feedback_alerts').doc(alertId).update({
        status: 'escalated',
        escalatedAt: admin.firestore.FieldValue.serverTimestamp(),
        escalatedBy: context.auth?.uid,
        escalationReason: reason || 'Requires management attention',
        escalationNotes: notes || '',
      });

      // Create escalation record
      await db.collection('escalations').add({
        type: 'feedback_alert',
        alertId,
        reason: reason || 'Requires management attention',
        notes: notes || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: context.auth?.uid,
        status: 'open',
      });

      functions.logger.info('[escalateFeedbackAlert] Alert escalated', {
        alertId,
        reason,
      });

      return { success: true, alertId };
    } catch (error) {
      functions.logger.error('[escalateFeedbackAlert] Error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to escalate alert'
      );
    }
  }
);
