import { Router } from 'express';
import { enqueueContent } from './queue';

const router = Router();

// Accepts { changes: [{ pageUrl, pageName, title?, headers?, body? }], author }
router.post('/apply-changes', async (req, res) => {
  try {
    const { changes, author } = req.body || {};
    if (!changes || !Array.isArray(changes)) return res.status(400).json({ error: 'changes array required' });

    const jobs = [];
    for (const c of changes) {
      // enqueue a content job that will create a draft for review
      const job = await enqueueContent({
        pageType: c.pageType || 'page',
        location: c.location,
        vehicle: c.vehicle,
        currentContent: c.body || '',
        targetKeywords: c.targetKeywords || [],
        tone: c.tone || 'professional',
        maxLength: c.maxLength,
      });
      jobs.push({ pageUrl: c.pageUrl, jobId: job.id });
    }

    res.json({ success: true, jobs, message: 'Changes queued as draft jobs for review' });
  } catch (err) {
    console.error('Apply changes failed', err);
    res.status(500).json({ error: 'Apply changes failed' });
  }
});

export { router as applyChangesRouter };
