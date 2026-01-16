import { Router } from 'express';
import { PageAnalyzer } from './page-analyzer';
import { ContentGenerator } from './content-generator';
import { ImageGenerator } from './image-generator';
import queue, { enqueueContent, listDrafts, getDraft, updateDraftStatus } from './queue';

const router = Router();

const pageAnalyzer = new PageAnalyzer();
const contentGenerator = new ContentGenerator();
const imageGenerator = new ImageGenerator();

router.post('/analyze-page', async (req, res) => {
  try {
    const { pageUrl = '', pageContent = '', pageName = '' } = req.body || {};
    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl is required' });
    }

    const analysis = await pageAnalyzer.analyzePage(pageContent, pageUrl, pageName || pageUrl);
    res.json({ success: true, analysis, analyzedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Page analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze page' });
  }
});

router.post('/batch-analyze', async (req, res) => {
  const pages = Array.isArray(req.body?.pages) ? req.body.pages : [];
  const results: any[] = [];

  for (const page of pages) {
    try {
      const analysis = await pageAnalyzer.analyzePage(
        page.content || '',
        page.url || '',
        page.name || page.url || 'Page'
      );
      results.push({ url: page.url, name: page.name, success: true, analysis });
    } catch (error) {
      console.error('Batch analyze failed for', page?.url, error);
      results.push({ url: page?.url, name: page?.name, success: false, error: String(error) });
    }
  }

  const successCount = results.filter(r => r.success).length;
  res.json({
    success: successCount === results.length,
    successCount,
    totalPages: results.length,
    results,
  });
});

router.post('/generate-content', async (req, res) => {
  try {
    const {
      pageType,
      location,
      vehicle,
      currentContent,
      targetKeywords,
      tone = 'professional',
      maxLength,
    } = req.body || {};

    if (!pageType || !targetKeywords) {
      return res.status(400).json({ error: 'pageType and targetKeywords are required' });
    }

    const normalizedKeywords = Array.isArray(targetKeywords) ? targetKeywords : [String(targetKeywords)];

    const content = await contentGenerator.generateContent({
      pageType,
      location,
      vehicle,
      currentContent,
      targetKeywords: normalizedKeywords,
      tone,
      maxLength,
    });

    res.json({
      success: true,
      content,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Content generation failed:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

router.post('/improve-content', async (req, res) => {
  try {
    const { currentContent, recommendations = [], pageType = 'page', targetKeywords = [] } = req.body || {};
    if (!currentContent) {
      return res.status(400).json({ error: 'currentContent is required' });
    }

    const content = await contentGenerator.generateContent({
      pageType,
      currentContent,
      targetKeywords: Array.isArray(targetKeywords) ? targetKeywords : [String(targetKeywords)],
      tone: 'professional',
    });

    res.json({
      success: true,
      content,
      recommendationsApplied: recommendations,
    });
  } catch (error) {
    console.error('Improve content failed:', error);
    res.status(500).json({ error: 'Failed to improve content' });
  }
});

router.post('/enqueue-content', async (req, res) => {
  try {
    const payload = req.body;
    const job = await enqueueContent({
      pageType: payload.pageType,
      location: payload.location,
      vehicle: payload.vehicle,
      currentContent: payload.currentContent,
      targetKeywords: Array.isArray(payload.targetKeywords)
        ? payload.targetKeywords
        : [String(payload.targetKeywords || '')].filter(Boolean),
      tone: payload.tone,
      maxLength: payload.maxLength,
    });

    res.json({
      success: true,
      job,
      message: 'Generation job queued. Draft will be available for review when ready.',
    });
  } catch (error) {
    console.error('Enqueue content failed:', error);
    res.status(500).json({ error: 'Failed to enqueue content' });
  }
});

router.get('/drafts', async (_req, res) => {
  try {
    const drafts = await listDrafts();
    res.json({ success: true, drafts });
  } catch (error) {
    console.error('Failed to list drafts:', error);
    res.status(500).json({ error: 'Failed to list drafts' });
  }
});

router.get('/drafts/:id', async (req, res) => {
  try {
    const draft = await getDraft(req.params.id);
    if (!draft) return res.status(404).json({ error: 'Draft not found' });
    res.json({ success: true, draft });
  } catch (error) {
    console.error('Failed to get draft:', error);
    res.status(500).json({ error: 'Failed to get draft' });
  }
});

router.post('/drafts/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;
    const actionMap: Record<string, 'approved' | 'rejected' | 'published'> = {
      approve: 'approved',
      reject: 'rejected',
      publish: 'published',
    };

    const nextStatus = actionMap[action];
    if (!nextStatus) return res.status(400).json({ error: 'Invalid draft action' });

    const updated = await updateDraftStatus(id, nextStatus, req.body?.reviewer, req.body?.notes);
    if (!updated) return res.status(404).json({ error: 'Draft not found' });

    res.json({ success: true, draft: updated });
  } catch (error) {
    console.error('Failed to update draft:', error);
    res.status(500).json({ error: 'Failed to update draft' });
  }
});

router.post('/generate-image', async (req, res) => {
  try {
    const result = await imageGenerator.generateImage(req.body);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Image generation failed:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

router.post('/generate-image-variations', async (req, res) => {
  try {
    const variations = await imageGenerator.generateImage(req.body);
    res.json({ success: true, variations: [variations] });
  } catch (error) {
    console.error('Image variation generation failed:', error);
    res.status(500).json({ error: 'Failed to generate image variations' });
  }
});

router.post('/location-content', async (req, res) => {
  try {
    const { location, targetKeywords = [] } = req.body || {};
    const content = await contentGenerator.generateContent({
      pageType: 'location',
      location,
      targetKeywords: Array.isArray(targetKeywords) ? targetKeywords : [String(targetKeywords)],
      tone: 'professional',
    });
    res.json({ success: true, content });
  } catch (error) {
    console.error('Location content generation failed:', error);
    res.status(500).json({ error: 'Failed to generate location content' });
  }
});

router.post('/vehicle-content', async (req, res) => {
  try {
    const { vehicle, targetKeywords = [] } = req.body || {};
    const content = await contentGenerator.generateContent({
      pageType: 'vehicle',
      vehicle,
      targetKeywords: Array.isArray(targetKeywords) ? targetKeywords : [String(targetKeywords)],
      tone: 'professional',
    });
    res.json({ success: true, content });
  } catch (error) {
    console.error('Vehicle content generation failed:', error);
    res.status(500).json({ error: 'Failed to generate vehicle content' });
  }
});

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    services: {
      pageAnalyzer: true,
      contentGenerator: true,
      imageGenerator: true,
      queue: Boolean(queue),
    },
  });
});

router.get('/config-status', (_req, res) => {
  res.json({
    vertexAIEnabled: Boolean(process.env.GOOGLE_CLOUD_PROJECT),
    queueDir: process.env.AI_QUEUE_DIR || 'data/ai_queue',
  });
});

export const aiRoutes = router;
export default router;
