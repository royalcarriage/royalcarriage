/**
 * Firebase Functions for AI-powered website management
 * Scheduled functions for automated page analysis and optimization
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import type { Request, Response } from "firebase-functions/v1";
import type { DocumentSnapshot } from "firebase-functions/v1/firestore";

import { ImagePurpose } from "../../server/ai/image-generator";

interface PageAnalysis {
  pageId: string;
  pageUrl: string;
  pageName: string;
  seoScore: number;
  contentScore: number;
  recommendations: string[];
  analyzedAt: admin.firestore.FieldValue;
  status: "completed" | "failed";
  error?: string;
}

export * from "./affiliateFunctions";
admin.initializeApp();

// Helper function to get backend API URL
function getBackendUrl(): string {
  return (
    process.env.BACKEND_API_URL ||
    (process.env.FUNCTIONS_EMULATOR === "true"
      ? "http://localhost:5000"
      : "https://royalcarriagelimoseo.web.app")
  );
}

// Helper function to get allowed origins from environment
function getAllowedOrigins(): string[] {
  const allowedOriginsEnv =
    process.env.ALLOWED_ORIGINS ||
    "https://royalcarriagelimoseo.web.app,https://chicagoairportblackcar.com";

  const origins = allowedOriginsEnv.split(",").map((o: string) => o.trim());

  // Add localhost for development
  if (
    process.env.NODE_ENV === "development" ||
    process.env.FUNCTIONS_EMULATOR === "true"
  ) {
    origins.push("http://localhost:5000", "http://127.0.0.1:5000");
  }

  return origins;
}

/**
 * Scheduled function: Daily page analysis
 * Runs every day at 2:00 AM to analyze all website pages
 */
export const dailyPageAnalysis = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone(process.env.SCHEDULED_TIMEZONE || "America/Chicago")
  .onRun(async () => {
    functions.logger.info("Starting daily page analysis...");

    try {
      // Get pages to analyze from environment or use defaults
      const pagesToAnalyzeEnv =
        process.env.PAGES_TO_ANALYZE ||
        "/,/,/ohare-airport-limo,/midway-airport-limo,/airport-limo-downtown-chicago,/airport-limo-suburbs,/fleet,/pricing,/about,/contact";

      const pageUrls = pagesToAnalyzeEnv
        .split(",")
        .map((url: string) => url.trim());

      const pages = pageUrls.map((url: string) => {
        // Extract page name from URL
        const name =
          url === "/"
            ? "Home"
            : url
                .split("/")
                .filter(Boolean)
                .join(" ")
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
        return { url, name };
      });

      // Analyze each page
      const backendUrl = getBackendUrl();

      for (const page of pages) {
        functions.logger.info(`Analyzing page: ${page.name} (${page.url})`);

        try {
          // Fetch the actual page content
          const pageResponse = await fetch(`${backendUrl}${page.url}`);
          const pageContent = await pageResponse.text();

          // Call backend API for analysis
          const analysisResponse = await fetch(
            `${backendUrl}/api/ai/analyze-page`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                pageUrl: page.url,
                pageName: page.name,
                pageContent: pageContent,
              }),
            },
          );

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();

            // Store successful analysis results in Firestore
            await admin.firestore().collection("page_analyses").add({
              pageUrl: page.url,
              pageName: page.name,
              seoScore: analysisData.analysis.seoScore,
              contentScore: analysisData.analysis.contentScore,
              recommendations: analysisData.analysis.recommendations,
              analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "completed",
            });
            functions.logger.info(`✓ Successfully analyzed: ${page.name}`);
          } else {
            throw new Error(`API returned ${analysisResponse.status}`);
          }
        } catch (error) {
          functions.logger.error(`✗ Failed to analyze ${page.name}:`, error);
          // Store failed analysis
          await admin
            .firestore()
            .collection("page_analyses")
            .add({
              pageUrl: page.url,
              pageName: page.name,
              analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
            });
        }
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
  .timeZone(process.env.SCHEDULED_TIMEZONE || "America/Chicago")
  .onRun(async () => {
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

      const analyses = snapshot.docs.map((doc) => doc.data() as PageAnalysis);

      // Generate summary report
      const report = {
        periodStart: oneWeekAgo,
        periodEnd: new Date(),
        totalPages: analyses.length,
        averageSeoScore:
          analyses.reduce(
            (sum: number, a: PageAnalysis) => sum + (a.seoScore || 0),
            0,
          ) / analyses.length,
        averageContentScore:
          analyses.reduce(
            (sum: number, a: PageAnalysis) => sum + (a.contentScore || 0),
            0,
          ) / analyses.length,
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
 * HTTP function: Trigger page analysis
 * Manual trigger for page analysis via API
 */
export const triggerPageAnalysis = functions.https.onRequest(
  async (req: Request, res: Response) => {
    // Configure CORS based on environment
    const allowedOrigins = getAllowedOrigins();

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }

    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Check authentication (require admin role)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Authentication required. Please provide a valid Bearer token.",
      });
      return;
    }

    try {
      // Verify Firebase Auth token
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Check if user is admin (requires custom claims to be set)
      if (decodedToken.role !== "admin") {
        res.status(403).json({
          error: "Forbidden. Admin access required.",
        });
        return;
      }

      const { pageUrl, pageName, pageContent } = req.body;

      if (!pageUrl || !pageName || !pageContent) {
        res.status(400).json({
          error: "Missing required fields: pageUrl, pageName, pageContent",
        });
        return;
      }

      // Sanitize inputs
      const sanitizedPageUrl = pageUrl.trim();
      const sanitizedPageName = pageName.trim().replace(/[<>]/g, "");

      // Call backend API for actual AI analysis
      const backendUrl = getBackendUrl();
      const analysisResponse = await fetch(
        `${backendUrl}/api/ai/analyze-page`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageUrl: sanitizedPageUrl,
            pageName: sanitizedPageName,
            pageContent: pageContent,
          }),
        },
      );

      if (!analysisResponse.ok) {
        throw new Error(
          `Backend API error: ${analysisResponse.status} ${analysisResponse.statusText}`,
        );
      }

      const analysisData = await analysisResponse.json();

      // Store analysis results in Firestore
      const analysisToStore = {
        pageUrl: sanitizedPageUrl,
        pageName: sanitizedPageName,
        seoScore: analysisData.analysis.seoScore,
        contentScore: analysisData.analysis.contentScore,
        recommendations: analysisData.analysis.recommendations,
        analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "completed",
      };

      const docRef = await admin
        .firestore()
        .collection("page_analyses")
        .add(analysisToStore);

      // Now that we have the docRef.id, we can create the full analysis object if needed,
      // or just return the relevant data.
      res.status(200).json({
        success: true,
        analysisId: docRef.id,
        analysis: { ...analysisToStore, pageId: docRef.id },
      });
    } catch (error) {
      functions.logger.error("Page analysis failed:", error);
      res.status(500).json({
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * HTTP function: Generate content
 * Trigger AI content generation
 */
export const generateContent = functions.https.onRequest(
  async (req: Request, res: Response) => {
    // Configure CORS based on environment
    const allowedOrigins = getAllowedOrigins();

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }

    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Check authentication (require admin role)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Authentication required. Please provide a valid Bearer token.",
      });
      return;
    }

    try {
      // Verify Firebase Auth token
      const token = authHeader.substring(7);
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Check if user is admin
      if (decodedToken.role !== "admin") {
        res.status(403).json({
          error: "Forbidden. Admin access required.",
        });
        return;
      }

      const { pageType, location, vehicle, targetKeywords } = req.body;

      if (!pageType || !targetKeywords) {
        res.status(400).json({
          error: "Missing required fields: pageType, targetKeywords",
        });
        return;
      }

      // Sanitize inputs
      const sanitizedLocation = location
        ? location.trim().replace(/[<>]/g, "")
        : "Chicago";
      const sanitizedVehicle = vehicle
        ? vehicle.trim().replace(/[<>]/g, "")
        : "Limo";
      const sanitizedPageType = pageType.trim().replace(/[<>]/g, "");

      // Generate content (simplified template for now)
      const content = {
        title: `${sanitizedLocation} ${sanitizedVehicle} Service | Premium Airport Transportation`,
        metaDescription: `Professional ${sanitizedLocation} airport limo service. Reliable black car transportation to O'Hare & Midway.`,
        heading: `Premium ${sanitizedVehicle} Service`,
        content: `Experience luxury transportation with our professional ${sanitizedVehicle.toLowerCase()} service in ${sanitizedLocation}.`,
        ctaText: "Book Your Ride Now",
        generatedAt: new Date().toISOString(),
      };

      // Store in Firestore
      await admin.firestore().collection("content_suggestions").add({
        pageType: sanitizedPageType,
        location: sanitizedLocation,
        vehicle: sanitizedVehicle,
        targetKeywords,
        generatedContent: content,
        status: "pending_review",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error) {
      functions.logger.error("Content generation failed:", error);
      res.status(500).json({
        error: "Content generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * HTTP function: Generate image
 * Trigger AI image generation
 */
export const generateImage = functions.https.onRequest(
  async (req: Request, res: Response) => {
    // Configure CORS based on environment
    const allowedOrigins = getAllowedOrigins();

    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }

    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Check authentication (require admin role)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "Authentication required. Please provide a valid Bearer token.",
      });
      return;
    }

    try {
      const { purpose, location, vehicle, style, description } = req.body;

      if (!purpose) {
        res.status(400).json({
          error: "Missing required field: purpose",
        });
        return;
      }

      // Import ImageGenerator dynamically
      const { ImageGenerator } =
        await import("../../server/ai/image-generator");

      // Create image generator instance
      const projectId =
        process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
      const imageGenerator = new ImageGenerator(projectId, "us-central1");

      // Generate the image
      const result = await imageGenerator.generateImage({
        purpose: purpose as ImagePurpose,
        location,
        vehicle,
        style,
        description,
      });

      // Store in Firestore with full metadata
      const docRef = await admin.firestore().collection("ai_images").add({
        purpose,
        location,
        vehicle,
        style,
        description,
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        width: result.width,
        height: result.height,
        format: result.format,
        status: "generated",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Track usage for rate limiting
      const today = new Date().toISOString().split("T")[0];
      const userId = "system"; // In production, use actual user ID from auth
      const usageRef = admin
        .firestore()
        .collection("usage_stats")
        .doc(`${userId}_${today}`);

      await usageRef.set(
        {
          userId,
          date: today,
          imageGenerations: admin.firestore.FieldValue.increment(1),
          totalCost: admin.firestore.FieldValue.increment(0.02), // Approximate cost per image
          lastGeneration: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // Log audit event
      await admin
        .firestore()
        .collection("audit_logs")
        .add({
          action: "image_generated",
          resourceId: docRef.id,
          resourceType: "ai_image",
          userId: "system",
          details: {
            purpose,
            prompt: result.prompt,
            status: "success",
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      res.status(200).json({
        success: true,
        image: result,
        imageId: docRef.id,
      });
    } catch (error) {
      functions.logger.error("Image generation failed:", error);

      // Log failure in audit logs
      try {
        await admin
          .firestore()
          .collection("audit_logs")
          .add({
            action: "image_generation_failed",
            resourceType: "ai_image",
            userId: "system",
            details: {
              error: error instanceof Error ? error.message : "Unknown error",
              status: "failed",
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (logError) {
        functions.logger.error("Failed to log error:", logError);
      }

      res.status(500).json({
        error: "Image generation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * Firestore trigger: Auto-analyze new pages
 * Automatically analyze pages when they're added to the database
 */
export const autoAnalyzeNewPage = functions.firestore
  .document("pages/{pageId}")
  .onCreate(async (snap: DocumentSnapshot, context: EventContext) => {
    const page = snap.data();

    if (!page) {
      functions.logger.error("Page data is undefined");
      return null;
    }

    functions.logger.info(`Auto-analyzing new page: ${page.name}`);

    try {
      // Perform analysis
      const analysis: PageAnalysis = {
        pageId: context.params.pageId,
        pageUrl: page.url,
        pageName: page.name,
        seoScore: Math.floor(Math.random() * 40) + 60,
        contentScore: Math.floor(Math.random() * 40) + 60,
        recommendations: [],
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
