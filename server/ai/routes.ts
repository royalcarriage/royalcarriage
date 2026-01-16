++ /Users/admin/VSCODE/server/ai/routes.ts
/**
 * AI Routes
 * API endpoints for AI-powered website management

/**
 * AI Routes
 * API endpoints for AI-powered website management
 */

import { Router, Request, Response } from "express";
import { PageAnalyzer } from "./page-analyzer";
import { ContentGenerator } from "./content-generator";
import { ImageGenerator } from "./image-generator";
import queue, {
  enqueueContent as enqueueContentHelper,
  listDrafts as listDraftsHelper,
  getDraft as getDraftHelper,
  updateDraftStatus as updateDraftStatusHelper,
} from "./queue";

const router = Router();

// Initialize AI services
const pageAnalyzer = new PageAnalyzer();
const contentGenerator = new ContentGenerator();
const imageGenerator = new ImageGenerator();

/* Analyze a page for SEO and content quality */
router.post("/analyze-page", async (req: Request, res: Response) => {
  try {
    const { pageUrl, pageContent, pageName } = req.body;

    if (!pageUrl || !pageContent || !pageName) {
      return res.status(400).json({ error: "Missing required fields: pageUrl, pageContent, pageName" });
    }

    const analysis = await pageAnalyzer.analyzePage(pageContent, pageUrl, pageName);

    return res.json({ success: true, analysis, analyzedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Page analysis error:", error);
    return res.status(500).json({ error: "Failed to analyze page", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

/* Enqueue generation job (preferred): POST /api/ai/generate-content */
router.post("/generate-content", async (req: Request, res: Response) => {
  try {
    const { pageType, location, vehicle, currentContent, targetKeywords, tone, maxLength } = req.body;

    if (!pageType || !targetKeywords) {
      return res.status(400).json({ error: "Missing required fields: pageType, targetKeywords" });
    }

    const payload = {
      pageType,
      location,
      vehicle,
      currentContent,
      targetKeywords: Array.isArray(targetKeywords) ? targetKeywords : [targetKeywords],
      tone: tone || "professional",
      maxLength,
    };

    const job = await enqueueContentHelper(payload as any);

    return res.json({ success: true, job, message: "Generation job queued. Draft will be available for review when ready.", queuedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Content generation enqueue error:", error);
    return res.status(500).json({ error: "Failed to enqueue generation job", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

/* Direct content generation (sync) - optional convenience endpoint */
router.post("/generate-content-sync", async (req: Request, res: Response) => {
  try {
    const { pageType, location, vehicle, currentContent, targetKeywords, tone, maxLength } = req.body;

    if (!pageType || !targetKeywords) {
      return res.status(400).json({ error: "Missing required fields: pageType, targetKeywords" });
    }

    const content = await contentGenerator.generateContent({
      pageType,
      location,
      vehicle,
      currentContent,
      targetKeywords: Array.isArray(targetKeywords) ? targetKeywords : [targetKeywords],
      tone: tone || "professional",
      maxLength,
    });

    return res.json({ success: true, content, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Content generation error:", error);
    return res.status(500).json({ error: "Failed to generate content", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

/* Improve existing content (sync) */
router.post("/improve-content", async (req: Request, res: Response) => {
  try {
    const { currentContent, recommendations } = req.body;
    if (!currentContent || !recommendations) {
      return res.status(400).json({ error: "Missing required fields: currentContent, recommendations" });
    }

    const improvedContent = await contentGenerator.improveContent(currentContent, Array.isArray(recommendations) ? recommendations : [recommendations]);

    return res.json({ success: true, improvedContent, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Content improvement error:", error);
    return res.status(500).json({ error: "Failed to improve content", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

/* Enqueue content directly - POST /api/ai/enqueue-content */
router.post("/enqueue-content", async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const job = await enqueueContentHelper(payload as any);
    return res.json({ success: true, job });
  } catch (error) {
    console.error("Enqueue content failed:", error);
    return res.status(500).json({ error: "Failed to enqueue content" });
  }
});

/* Drafts endpoints */
router.get("/drafts", async (_req: Request, res: Response) => {
  try {
    const drafts = await listDraftsHelper();
    return res.json({ success: true, drafts });
  } catch (error) {
    console.error("Failed to list drafts:", error);
    return res.status(500).json({ error: "Failed to list drafts" });
  }
});

router.get("/drafts/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const draft = await getDraftHelper(id);
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    return res.json({ success: true, draft });
  } catch (error) {
    console.error("Failed to get draft:", error);
    return res.status(500).json({ error: "Failed to get draft" });
  }
});

router.post("/drafts/:id/:action", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const action = req.params.action as string;
    const reviewer = req.body.reviewer || "admin";
    const notes = req.body.notes || "";

    if (!["approve", "reject", "publish"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const map: Record<string, any> = { approve: "approved", reject: "rejected", publish: "published" };
    const status = map[action];

    const updated = await updateDraftStatusHelper(id, status, reviewer, notes);
    if (!updated) return res.status(404).json({ error: "Draft not found" });
    return res.json({ success: true, draft: updated });
  } catch (error) {
    console.error("Draft action failed:", error);
    return res.status(500).json({ error: "Failed to update draft status" });
  }
});

/* Image generation endpoints (keep existing behavior) */
router.post("/generate-image", async (req: Request, res: Response) => {
  try {
    const { purpose, location, vehicle, style, description } = req.body;
    if (!purpose) return res.status(400).json({ error: "Missing required field: purpose" });
    const image = await imageGenerator.generateImage({ purpose, location, vehicle, style, description });
    return res.json({ success: true, image, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Image generation error:", error);
    return res.status(500).json({ error: "Failed to generate image", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

router.post("/generate-image-variations", async (req: Request, res: Response) => {
  try {
    const { purpose, location, vehicle, style, description, count } = req.body;
    if (!purpose) return res.status(400).json({ error: "Missing required field: purpose" });
    const images = await imageGenerator.generateVariations({ purpose, location, vehicle, style, description }, count || 3);
    return res.json({ success: true, images, count: images.length, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Image variations generation error:", error);
    return res.status(500).json({ error: "Failed to generate image variations", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

/* Location & vehicle content helpers */
router.post("/location-content", async (req: Request, res: Response) => {
  try {
    const { location, pageType } = req.body;
    if (!location || !pageType) return res.status(400).json({ error: "Missing required fields: location, pageType" });
    const content = pageAnalyzer.generateLocationContent(location, pageType);
    return res.json({ success: true, content, location, pageType });
  } catch (error) {
    console.error("Location content generation error:", error);
    return res.status(500).json({ error: "Failed to generate location content", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

router.post("/vehicle-content", async (req: Request, res: Response) => {
  try {
    const { vehicle } = req.body;
    if (!vehicle) return res.status(400).json({ error: "Missing required field: vehicle" });
    const content = pageAnalyzer.generateVehicleContent(vehicle);
    return res.json({ success: true, content, vehicle });
  } catch (error) {
    console.error("Vehicle content generation error:", error);
    return res.status(500).json({ error: "Failed to generate vehicle content", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

/* Batch analyze */
router.post("/batch-analyze", async (req: Request, res: Response) => {
  try {
    const { pages } = req.body;
    if (!pages || !Array.isArray(pages)) return res.status(400).json({ error: "Missing required field: pages (array)" });

    const results = await Promise.all(pages.map(async (page: any) => {
      try {
        const analysis = await pageAnalyzer.analyzePage(page.content, page.url, page.name);
        return { url: page.url, name: page.name, analysis, success: true };
      } catch (error) {
        return { url: page.url, name: page.name, error: error instanceof Error ? error.message : "Analysis failed", success: false };
      }
    }));

    return res.json({ success: true, results, totalPages: pages.length, successCount: results.filter((r) => r.success).length, analyzedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Batch analysis error:", error);
    return res.status(500).json({ error: "Failed to perform batch analysis", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

/* Health and config */
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", services: { pageAnalyzer: "active", contentGenerator: "active", imageGenerator: "active" }, timestamp: new Date().toISOString() });
});

router.get("/config-status", async (_req: Request, res: Response) => {
  try {
    const { ConfigurationValidator } = await import("./config-validator");
    const validator = new ConfigurationValidator();
    const results = await validator.validateAll();
    const readiness = await validator.isSystemReady();
    const instructions = validator.generateSetupInstructions(results);
    return res.json({ ready: readiness.ready, message: readiness.message, validationResults: results, setupInstructions: instructions, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Configuration status check error:", error);
    return res.status(500).json({ error: "Failed to check configuration status", message: error instanceof Error ? error.message : "Unknown error" });
  }
});

export { router as aiRoutes };
        description,
      },
      count || 3,
    );

    res.json({
      success: true,
      images,
      count: images.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Image variations generation error:", error);
    res.status(500).json({
      error: "Failed to generate image variations",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get location-specific content suggestions
 * POST /api/ai/location-content
 */
router.post("/location-content", async (req, res) => {
  try {
    const { location, pageType } = req.body;

    if (!location || !pageType) {
      return res.status(400).json({
        error: "Missing required fields: location, pageType",
      });
    }

    const content = pageAnalyzer.generateLocationContent(location, pageType);

    res.json({
      success: true,
      content,
      location,
      pageType,
    });
  } catch (error) {
    console.error("Location content generation error:", error);
    res.status(500).json({
      error: "Failed to generate location content",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get vehicle-specific content suggestions
 * POST /api/ai/vehicle-content
 */
router.post("/vehicle-content", async (req, res) => {
  try {
    const { vehicle } = req.body;

    if (!vehicle) {
      return res.status(400).json({
        error: "Missing required field: vehicle",
      });
    }

    const content = pageAnalyzer.generateVehicleContent(vehicle);

    res.json({
      success: true,
      content,
      vehicle,
    });
  } catch (error) {
    console.error("Vehicle content generation error:", error);
    res.status(500).json({
      error: "Failed to generate vehicle content",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Batch analyze multiple pages
 * POST /api/ai/batch-analyze
 */
router.post("/batch-analyze", async (req, res) => {
  try {
    const { pages } = req.body;

    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({
        error: "Missing required field: pages (array)",
      });
    }

    const results = await Promise.all(
      pages.map(async (page) => {
        try {
          const analysis = await pageAnalyzer.analyzePage(
            page.content,
            page.url,
            page.name,
          );
          return {
            url: page.url,
            name: page.name,
            analysis,
            success: true,
          };
        } catch (error) {
          return {
            url: page.url,
            name: page.name,
            error: error instanceof Error ? error.message : "Analysis failed",
            success: false,
          };
        }
      }),
    );

    res.json({
      success: true,
      results,
      totalPages: pages.length,
      successCount: results.filter((r) => r.success).length,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Batch analysis error:", error);
    res.status(500).json({
      error: "Failed to perform batch analysis",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Health check endpoint
 * GET /api/ai/health
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    services: {
      pageAnalyzer: "active",
      contentGenerator: "active",
      imageGenerator: "active",
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Configuration status check
 * GET /api/ai/config-status
 */
router.get("/config-status", async (req, res) => {
  try {
    const { ConfigurationValidator } = await import("./config-validator");
    const validator = new ConfigurationValidator();

    const results = await validator.validateAll();
    const readiness = await validator.isSystemReady();
    const instructions = validator.generateSetupInstructions(results);

    res.json({
      ready: readiness.ready,
      message: readiness.message,
      validationResults: results,
      setupInstructions: instructions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Configuration status check error:", error);
    res.status(500).json({
      error: "Failed to check configuration status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export { router as aiRoutes };
