import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const DATA_PATH = path.join(__dirname, '..', 'data');
const DOMAINS_FILE = path.join(DATA_PATH, 'ai_domains.json');

function ensureDataPath() {
  if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });
  if (!fs.existsSync(DOMAINS_FILE)) fs.writeFileSync(DOMAINS_FILE, JSON.stringify({ domains: [] }, null, 2));
}

function readDomains() {
  ensureDataPath();
  const raw = fs.readFileSync(DOMAINS_FILE, { encoding: 'utf-8' });
  return JSON.parse(raw).domains || [];
}

function writeDomains(domains: any[]) {
  ensureDataPath();
  fs.writeFileSync(DOMAINS_FILE, JSON.stringify({ domains }, null, 2));
}

function inferPurposeFromDomain(domain: string) {
  const d = domain.toLowerCase();
  if (d.includes('blog')) return 'blog';
  if (d.includes('shop') || d.includes('store')) return 'ecommerce';
  if (d.includes('docs') || d.includes('docs')) return 'documentation';
  return 'website';
}

function suggestTitle(domain: string) {
  const name = domain.replace(/^www\./i, '').split('.')[0];
  const words = name.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return `${words.join(' ')} — Official Site`;
}

router.get('/domains', (req, res) => {
  try {
    const domains = readDomains();
    res.json({ success: true, domains });
  } catch (err) {
    console.error('Failed to read domains', err);
    res.status(500).json({ success: false, error: 'Failed to read domains' });
  }
});

// Accepts { domains: [{ domain, name?, purpose?, title?, headers? }] }
router.post('/domains/sync', (req, res) => {
  try {
    const body = req.body || {};
    const incoming = Array.isArray(body.domains) ? body.domains : [];

    const existing = readDomains();

    // Merge incoming by domain
    const map = new Map<string, any>();
    existing.forEach((d: any) => map.set(d.domain, d));

    incoming.forEach((d: any) => {
      const domain = d.domain;
      if (!domain) return;
      const prev = map.get(domain) || {};
      const merged = {
        domain,
        name: d.name || prev.name || domain,
        purpose: d.purpose || prev.purpose || inferPurposeFromDomain(domain),
        title: d.title || prev.title || suggestTitle(domain),
        headers: d.headers || prev.headers || {},
        updatedAt: new Date().toISOString(),
      };
      map.set(domain, merged);
    });

    const merged = Array.from(map.values());
    writeDomains(merged);

    res.json({ success: true, domains: merged });
  } catch (err) {
    console.error('Failed to sync domains', err);
    res.status(500).json({ success: false, error: 'Failed to sync domains' });
  }
});

export { router as domainsRouter };
