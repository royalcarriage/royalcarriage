/**
 * Firebase Functions for AI-powered website management
 * Scheduled functions for automated page analysis and optimization
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './api/routes';

// Import AI content functions
import {
  generateFAQForCity,
  summarizeCustomerReviews,
  translatePageContent,
  suggestSocialCaptions,
  analyzeSentimentOfFeedback,
} from './contentFunctions';

// Import advanced AI functions
import { aiModelRouter } from './advancedFunctions';

// Import initialization functions
import {
  initializeData,
  seedLocationServiceMappings,
  createCollectionIndexes,
} from './initializeData';

// Import content generation functions - PHASE 2
import {
  generateServiceContent,
  generateContentBatch,
  approveAndPublishContent,
} from './contentGenerationFunctions';

// Import page generation functions - PHASE 2
import {
  generatePageMetadata,
  buildStaticPages,
  publishPages,
} from './pageGenerationFunctions';

// Import quality scoring functions - PHASE 3
import {
  calculateContentQuality,
  bulkScoreContent,
  getQualityScoreSummary,
} from './qualityScoringFunctions';

// Import auto-regeneration functions - PHASE 3
import {
  autoRegenerateContent,
  scheduledDailyRegeneration,
  processRegenerationQueue,
  getRegenerationStatus,
} from './autoRegenerationFunctions';

// Import competitor analysis functions - PHASE 3
import {
  analyzeCompetitors,
  getCompetitorAnalysis,
  identifyServiceGaps,
  getKeywordOpportunities,
} from './competitorAnalysisFunctions';

// Import data initialization function - PHASE 4
import { initializeProductionData } from './dataInitializationFunction';

// Import content enhancement functions - P2 RC-201
import {
  generateLocationFAQ,
  translateContent,
  optimizeContentSEO,
  generateABVariants,
  createContentVersion,
  rollbackContentVersion,
} from './contentEnhancements';

// Import image optimization functions - P2 RC-202
import {
  optimizeImageOnUpload,
  batchOptimizeImages,
  generateSrcset,
  runImageAudit,
  getOptimizedImageUrl,
} from './imageOptimization';

// Import ROI dashboard functions - P2 RC-203
import {
  getMetricTrends,
  getCohortAnalysis,
  generateForecast,
  exportDashboardData,
  getDateRangeSummary,
} from './roiDashboard';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

// Create Express app for API
const app = express();

// CORS Configuration - Whitelist only authorized domains
const allowedOrigins = [
  'https://admin.royalcarriagelimo.com',
  'https://chicagoairportblackcar.com',
  'https://chicagoexecutivecarservice.com',
  'https://chicagoweddingtransportation.com',
  'https://chicago-partybus.com',
  'http://localhost:3000', // Development only
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
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

    try {
      const db = admin.firestore();
      const { geminiClient } = await import('./shared/gemini-client');

      // Fetch all pages from settings/master_spec/pages
      const pagesSnapshot = await db
        .collection('settings')
        .doc('master_spec')
        .collection('pages')
        .get();

      if (pagesSnapshot.empty) {
        functions.logger.info('No pages found to analyze');
        return null;
      }

      const analysisPromises = [];
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      for (const doc of pagesSnapshot.docs) {
        const pageData = doc.data();
        const pageId = doc.id;

        // Create analysis prompt
        const analysisPrompt = `Analyze this page for SEO quality and provide a score from 0-100:

Page URL: ${pageData.path || 'Unknown'}
Page Title: ${pageData.title || 'Unknown'}
Meta Description: ${pageData.metaDescription || 'None'}
Content: ${pageData.content?.substring(0, 500) || 'No content'}

Provide analysis in JSON format:
{
  "seoScore": <number 0-100>,
  "issues": ["list of SEO issues"],
  "strengths": ["list of strengths"],
  "recommendations": ["actionable recommendations"],
  "priority": "low|medium|high"
}`;

        const promise = geminiClient
          .generateContent(analysisPrompt, { temperature: 0.3 })
          .then(async (response) => {
            const analysis = geminiClient.parseJSON(response, {
              seoScore: 50,
              issues: ['Failed to parse analysis'],
              strengths: [],
              recommendations: [],
              priority: 'medium',
            });

            // Store analysis in page_analyses collection
            await db.collection('page_analyses').add({
              pageId,
              pagePath: pageData.path,
              pageTitle: pageData.title,
              seoScore: analysis.seoScore,
              issues: analysis.issues,
              strengths: analysis.strengths,
              recommendations: analysis.recommendations,
              priority: analysis.priority,
              analyzedAt: timestamp,
              analysisType: 'daily_scheduled',
            });

            // Create alert if score is low
            if (analysis.seoScore < 50) {
              await db.collection('reports').add({
                type: 'seo_alert',
                severity: 'high',
                pageId,
                pagePath: pageData.path,
                seoScore: analysis.seoScore,
                message: `Low SEO score detected: ${analysis.seoScore}/100`,
                issues: analysis.issues,
                createdAt: timestamp,
              });
            }

            functions.logger.info(`Analyzed page: ${pageData.path}`, {
              score: analysis.seoScore,
            });
          })
          .catch((error) => {
            functions.logger.error(`Failed to analyze page ${pageId}:`, error);
          });

        analysisPromises.push(promise);
      }

      await Promise.all(analysisPromises);

      functions.logger.info('Daily page analysis completed', {
        totalPages: pagesSnapshot.size,
      });

      return null;
    } catch (error) {
      functions.logger.error('Daily page analysis failed:', error);
      throw error;
    }
  });

/**
 * Scheduled function: Weekly SEO report
 * Runs every Monday at 9:00 AM to generate SEO report
 */
export const weeklySeoReport = functions.pubsub
  .schedule('0 9 * * 1')
  .timeZone('America/Chicago')
  .onRun(async (context) => {
    functions.logger.info('Starting weekly SEO report generation...');

    try {
      const db = admin.firestore();

      // Get analyses from the past 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const analysesSnapshot = await db
        .collection('page_analyses')
        .where('analyzedAt', '>=', sevenDaysAgo)
        .orderBy('analyzedAt', 'desc')
        .get();

      if (analysesSnapshot.empty) {
        functions.logger.info('No analyses found for the past week');
        return null;
      }

      // Aggregate data
      const analyses = analysesSnapshot.docs.map((doc) => doc.data());
      const scores = analyses.map((a) => a.seoScore || 0);
      const avgScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;

      // Sort by score
      const sortedAnalyses = [...analyses].sort(
        (a, b) => (b.seoScore || 0) - (a.seoScore || 0)
      );

      const topPages = sortedAnalyses.slice(0, 10);
      const bottomPages = sortedAnalyses.slice(-10).reverse();

      // Collect all issues
      const allIssues: string[] = [];
      analyses.forEach((a) => {
        if (a.issues && Array.isArray(a.issues)) {
          allIssues.push(...a.issues);
        }
      });

      // Count issue frequency
      const issueFrequency: { [key: string]: number } = {};
      allIssues.forEach((issue) => {
        issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
      });

      // Get top 10 most common issues
      const commonIssues = Object.entries(issueFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([issue, count]) => ({ issue, count }));

      // Create weekly report
      const report = {
        type: 'weekly_seo_report',
        reportPeriod: {
          startDate: sevenDaysAgo.toISOString(),
          endDate: new Date().toISOString(),
        },
        summary: {
          totalPagesAnalyzed: analyses.length,
          averageScore: Math.round(avgScore * 10) / 10,
          highScorePages: topPages.length,
          lowScorePages: bottomPages.filter((p) => p.seoScore < 50).length,
        },
        topPages: topPages.map((p) => ({
          path: p.pagePath,
          title: p.pageTitle,
          score: p.seoScore,
        })),
        bottomPages: bottomPages.map((p) => ({
          path: p.pagePath,
          title: p.pageTitle,
          score: p.seoScore,
        })),
        commonIssues,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Store report
      await db.collection('reports').add(report);

      functions.logger.info('Weekly SEO report generated', {
        totalPages: analyses.length,
        avgScore,
      });

      return null;
    } catch (error) {
      functions.logger.error('Weekly SEO report generation failed:', error);
      throw error;
    }
  });

/**
 * Firestore trigger: Auto-analyze new pages
 * Automatically analyze pages when they're added to the database
 */
export const autoAnalyzeNewPage = functions.firestore
  .document('settings/master_spec/pages/{pageId}')
  .onCreate(async (snap, context) => {
    const pageId = context.params.pageId;
    const pageData = snap.data();

    functions.logger.info(`Auto-analyzing new page: ${pageId}`);

    try {
      const db = admin.firestore();
      const { geminiClient } = await import('./shared/gemini-client');

      // Create analysis prompt
      const analysisPrompt = `Analyze this newly created page for SEO quality and provide a score from 0-100:

Page URL: ${pageData.path || 'Unknown'}
Page Title: ${pageData.title || 'Unknown'}
Meta Description: ${pageData.metaDescription || 'None'}
Content: ${pageData.content?.substring(0, 500) || 'No content'}

Provide analysis in JSON format:
{
  "seoScore": <number 0-100>,
  "issues": ["list of SEO issues"],
  "strengths": ["list of strengths"],
  "recommendations": ["actionable recommendations"],
  "priority": "low|medium|high"
}`;

      const response = await geminiClient.generateContent(analysisPrompt, {
        temperature: 0.3,
      });

      const analysis = geminiClient.parseJSON(response, {
        seoScore: 50,
        issues: ['Failed to parse analysis'],
        strengths: [],
        recommendations: [],
        priority: 'medium',
      });

      // Store analysis
      await db.collection('page_analyses').add({
        pageId,
        pagePath: pageData.path,
        pageTitle: pageData.title,
        seoScore: analysis.seoScore,
        issues: analysis.issues,
        strengths: analysis.strengths,
        recommendations: analysis.recommendations,
        priority: analysis.priority,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        analysisType: 'auto_on_create',
      });

      functions.logger.info(`Successfully analyzed new page: ${pageId}`, {
        score: analysis.seoScore,
      });

      return null;
    } catch (error) {
      functions.logger.error(`Failed to auto-analyze page ${pageId}:`, error);
      // Don't throw - we don't want to fail page creation
      return null;
    }
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

// --- AI CONTENT FUNCTIONS ---

// Export AI content functions
export {
  generateFAQForCity,
  summarizeCustomerReviews,
  translatePageContent,
  suggestSocialCaptions,
  analyzeSentimentOfFeedback,
};

// Export advanced AI functions
export { aiModelRouter };

// --- INITIALIZATION & DATA MANAGEMENT FUNCTIONS ---

// Export initialization functions
export {
  initializeData,
  seedLocationServiceMappings,
  createCollectionIndexes,
};

// --- CONTENT GENERATION FUNCTIONS ---

// Export content generation functions
export {
  generateServiceContent,
  generateContentBatch,
  approveAndPublishContent,
};

// --- PAGE GENERATION FUNCTIONS ---

// Export page generation functions
export {
  generatePageMetadata,
  buildStaticPages,
  publishPages,
};

// --- QUALITY SCORING FUNCTIONS - PHASE 3 ---

// Export quality scoring functions
export {
  calculateContentQuality,
  bulkScoreContent,
  getQualityScoreSummary,
};

// --- AUTO-REGENERATION FUNCTIONS - PHASE 3 ---

// Export auto-regeneration functions
export {
  autoRegenerateContent,
  scheduledDailyRegeneration,
  processRegenerationQueue,
  getRegenerationStatus,
};

// --- COMPETITOR ANALYSIS FUNCTIONS - PHASE 3 ---

// Export competitor analysis functions
export {
  analyzeCompetitors,
  getCompetitorAnalysis,
  identifyServiceGaps,
  getKeywordOpportunities,
};

// --- PHASE 4: PRODUCTION DATA INITIALIZATION ---

// Export data initialization function
export { initializeProductionData };

// --- P2 RC-201: CONTENT GENERATION ENHANCEMENTS ---

// Export content enhancement functions
export {
  generateLocationFAQ,
  translateContent,
  optimizeContentSEO,
  generateABVariants,
  createContentVersion,
  rollbackContentVersion,
};

// --- P2 RC-202: IMAGE OPTIMIZATION PIPELINE ---

// Export image optimization functions
export {
  optimizeImageOnUpload,
  batchOptimizeImages,
  generateSrcset,
  runImageAudit,
  getOptimizedImageUrl,
};

// --- P2 RC-203: ROI DASHBOARD ENHANCEMENTS ---

// Export ROI dashboard functions
export {
  getMetricTrends,
  getCohortAnalysis,
  generateForecast,
  exportDashboardData,
  getDateRangeSummary,
};
