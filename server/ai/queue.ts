import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ContentGenerator } from './content-generator';

const QUEUE_DIR = process.env.AI_QUEUE_DIR || path.join(process.cwd(), 'data', 'ai_queue');
const DRAFTS_DIR = process.env.AI_DRAFTS_DIR || path.join(process.cwd(), 'data', 'ai_drafts');
const GENERATED_DIR = process.env.AI_GENERATED_DIR || path.join(process.cwd(), 'data', 'generated_content');

async function ensureDirs() {
  await fs.mkdir(QUEUE_DIR, { recursive: true });
  await fs.mkdir(DRAFTS_DIR, { recursive: true });
  await fs.mkdir(GENERATED_DIR, { recursive: true });
}

export interface EnqueueRequest {
  pageType: string;
  location?: string;
  vehicle?: string;
  currentContent?: string;
  targetKeywords: string[];
  tone?: string;
  maxLength?: number;
}

export async function enqueueContent(request: EnqueueRequest) {
  await ensureDirs();
  const id = uuidv4();
  const job = {
    id,
    status: 'queued',
    request,
    createdAt: new Date().toISOString(),
  };

  const jobPath = path.join(QUEUE_DIR, `${id}.json`);
  await fs.writeFile(jobPath, JSON.stringify(job, null, 2), 'utf8');

  // Process immediately in background (best-effort)
  processJob(job).catch(err => console.error('AI queue processing error:', err));

  return { id };
}

async function processJob(job: any) {
  const generator = new ContentGenerator();
  const payload = job.request as EnqueueRequest;

  try {
    const result = await generator.generateContent({
      pageType: payload.pageType,
      location: payload.location,
      vehicle: payload.vehicle,
      currentContent: payload.currentContent,
      targetKeywords: payload.targetKeywords,
      tone: (payload.tone as any) || 'professional',
      maxLength: payload.maxLength,
    });

    // Save draft
    const draft = {
      id: job.id,
      status: 'pending_review',
      request: payload,
      result,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(path.join(DRAFTS_DIR, `${job.id}.json`), JSON.stringify(draft, null, 2), 'utf8');

    // Save generated content copy
    const generated = {
      id: job.id,
      status: 'generated',
      result,
      createdAt: new Date().toISOString(),
    };
    await fs.writeFile(path.join(GENERATED_DIR, `${job.id}.json`), JSON.stringify(generated, null, 2), 'utf8');

    // Remove job file
    const jobPath = path.join(QUEUE_DIR, `${job.id}.json`);
    await fs.rm(jobPath).catch(() => {});
  } catch (error) {
    console.error('Job failed for', job.id, error);
    const failPath = path.join(DRAFTS_DIR, `${job.id}.error.json`);
    await fs.writeFile(failPath, JSON.stringify({ job, error: String(error) }, null, 2), 'utf8').catch(() => {});
  }
}

export async function listDrafts() {
  await ensureDirs();
  const files = await fs.readdir(DRAFTS_DIR).catch(() => []);
  const drafts = [] as any[];
  for (const f of files) {
    if (f.endsWith('.json')) {
      try {
        const data = JSON.parse(await fs.readFile(path.join(DRAFTS_DIR, f), 'utf8'));
        drafts.push(data);
      } catch (e) {
        // skip
      }
    }
  }
  return drafts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getDraft(id: string) {
  const p = path.join(DRAFTS_DIR, `${id}.json`);
  try {
    const data = JSON.parse(await fs.readFile(p, 'utf8'));
    return data;
  } catch (e) {
    return null;
  }
}

export async function updateDraftStatus(id: string, status: 'approved' | 'rejected' | 'published', reviewer?: string, notes?: string) {
  const p = path.join(DRAFTS_DIR, `${id}.json`);
  try {
    const data = JSON.parse(await fs.readFile(p, 'utf8'));
    data.status = status;
    data.reviewedBy = reviewer || 'system';
    data.reviewNotes = notes || '';
    data.reviewedAt = new Date().toISOString();

    await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');

    // If approved/published, copy to published folder
    if (status === 'published') {
      const pubPath = path.join(GENERATED_DIR, `${id}.published.json`);
      await fs.writeFile(pubPath, JSON.stringify(data, null, 2), 'utf8');
    }

    return data;
  } catch (e) {
    return null;
  }
}

export default {
  enqueueContent,
  listDrafts,
  getDraft,
  updateDraftStatus,
};
