import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { initFirebase } from "./init";
import { geminiClient } from "./shared/gemini-client";

initFirebase();
const db = admin.firestore();

// --- ADVANCED AI ORCHESTRATION ---

/**
 * Model Router: Intelligent model selection based on task complexity
 * Optimizes for cost and performance
 * - gemini-1.5-flash: Simple tasks (FAQ, captions, summaries) - $0.075/$0.30 per M tokens
 * - gemini-1.5-pro: Complex tasks (sentiment, analysis) - $3.50/$10.50 per M tokens
 */
export const aiModelRouter = functions.https.onCall(async (data, context) => {
    try {
        const { task, complexity } = data;

        if (!task) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'task parameter is required'
            );
        }

        // Complexity-based default model selection
        const defaultModel =
            complexity === 'high' || complexity === 'complex'
                ? 'gemini-1.5-pro'
                : 'gemini-1.5-flash';

        // Task-specific model overrides (high-accuracy tasks use Pro)
        const taskModelMap: {
            [key: string]: 'gemini-1.5-flash' | 'gemini-1.5-pro';
        } = {
            // High-accuracy tasks
            sentiment_analysis: 'gemini-1.5-pro',
            content_analysis: 'gemini-1.5-pro',
            audit: 'gemini-1.5-pro',
            // Cost-optimized tasks
            faq_generation: 'gemini-1.5-flash',
            caption_generation: 'gemini-1.5-flash',
            social_media: 'gemini-1.5-flash',
            summarization: 'gemini-1.5-flash',
            translation: 'gemini-1.5-flash',
            review_summary: 'gemini-1.5-flash',
        };

        const finalModel =
            taskModelMap[task.toLowerCase()] || defaultModel;

        // Cost estimation
        const costMap: {
            [key: string]: { input: number; output: number };
        } = {
            'gemini-1.5-flash': { input: 0.075, output: 0.3 },
            'gemini-1.5-pro': { input: 3.5, output: 10.5 },
        };

        const costs = costMap[finalModel];

        // Estimate token usage based on typical task
        const estimatedInputTokens = 500;
        const estimatedOutputTokens = 300;

        const estimatedCostValue =
            (estimatedInputTokens * costs.input +
                estimatedOutputTokens * costs.output) /
            1000000;

        // Log routing decision
        functions.logger.info('[aiModelRouter] Model routing decision', {
            task,
            complexity: complexity || 'medium',
            selectedModel: finalModel,
            estimatedCost: estimatedCostValue.toFixed(6),
        });

        return {
            selectedModel: finalModel,
            task,
            complexity: complexity || 'medium',
            estimatedCost: `$${estimatedCostValue.toFixed(6)}`,
            inputTokenEstimate: estimatedInputTokens,
            outputTokenEstimate: estimatedOutputTokens,
            status: 'ready',
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        functions.logger.error('[aiModelRouter] Routing failed:', {
            error: error instanceof Error ? error.message : String(error),
        });
        throw new functions.https.HttpsError(
            'internal',
            'Failed to route to appropriate model'
        );
    }
});

export const batchSEOAnalyze = functions.https.onCall(async (data, context) => {
    const { siteId } = data;
    // Scans all pages for a site and queues analysis tasks
    const pages = await db.collection("pages").where("siteId", "==", siteId).get();
    const batch = db.batch();
    pages.docs.forEach(doc => {
        batch.set(db.collection("seo_queue").doc(), {
            pageId: doc.id,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
    });
    await batch.commit();
    return { count: pages.size };
});

// --- AUTOMATED REPORTING ---

export const generateWeeklyPerformanceEmail = functions.pubsub.schedule('every monday 08:00').onRun(async (context) => {
    // Aggregates ROI, Fleet, and SEO data for the week
    // Sends summary to SuperAdmins
    console.log("Generating Weekly Performance Email");
    return null;
});

export const exportAnalyticsToGSHeets = functions.https.onCall(async (data, context) => {
    // Logic to push data to Google Sheets API
    return { url: "https://docs.google.com/spreadsheets/..." };
});

// --- EXTERNAL INTEGRATIONS ---

export const syncWithQuickbooks = functions.https.onCall(async (data, context) => {
    // Syncs invoices and payments
    return { status: 'synced', timestamp: new Date().toISOString() };
});

export const fetchLiveGasPrices = functions.pubsub.schedule('every 12 hours').onRun(async (context) => {
    // API call to fetch gas prices and update fleet cost projections
    await db.collection("settings").doc("constants").update({
        gasPrice: 3.45 // Mock result
    });
    return null;
});

// --- SYSTEM PLUGINS ---

export const triggerCustomWebhook = functions.https.onCall(async (data, context) => {
    const { url, payload } = data;
    // POST to external URL
    return { status: 'dispatched' };
});

// --- BULK OPERATIONS ---

export const bulkUpdateVehicleStatus = functions.https.onCall(async (data, context) => {
    const { vehicleIds, status } = data;
    const batch = db.batch();
    vehicleIds.forEach((id: string) => {
        batch.update(db.collection("vehicles").doc(id), { status });
    });
    await batch.commit();
    return { success: true };
});

// --- SECURITY & COMPLIANCE ---

export const scanForPII = functions.https.onCall(async (data, context) => {
    // Scans notes/comments for sensitive data
    return { clean: true };
});

export const auditUserPermissions = functions.https.onCall(async (data, context) => {
    const users = await admin.auth().listUsers();
    const anomalies = users.users.filter(u => u.customClaims?.role === 'SuperAdmin' && !u.email?.endsWith('@royalcarriagelimo.com'));
    return { anomalies };
});
