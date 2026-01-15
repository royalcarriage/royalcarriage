# Future Builds Integration Plan
**Created:** January 15, 2026  
**Purpose:** Coordinate with other agents and plan next 6 months of development

---

## Overview

This document synthesizes work from multiple agents and creates a unified roadmap for the Royal Carriage SEO + Ads + Analytics system across 4 Firebase-hosted marketing sites.

---

## Agent Work Summary

### Agent 1: AI System Foundation (Previous)
**Delivered:**
- Complete AI infrastructure (Vertex AI Gemini + Imagen)
- Page analyzer with SEO scoring (0-100)
- Content generator with template fallback
- Image generator with prompt engineering
- Admin dashboard (6 tabs)
- Firebase Functions (scheduled tasks)
- Database schema (7 tables, RBAC)
- 9 API endpoints

**Files Created:**
- `server/ai/*` (4 files)
- `client/src/pages/admin/*` (2 files)
- `functions/src/index.ts`
- `docs/AI_SYSTEM_GUIDE.md`
- `docs/IMPLEMENTATION_SUMMARY.md`

### Agent 2: ROI Intelligence (Current - Me)
**Delivered:**
- Comprehensive audits (repo, site UX, technical SEO)
- Metrics import pipeline (Google Ads, Moovs, keywords)
- Profit model with editable margins
- Keyword clustering by intent
- Landing page matrix
- Master roadmap (9 phases)
- Phase 1 implementations (GA4, trust signals, pricing)

**Files Created:**
- `scripts/metrics-import.mjs`
- `data/{google-ads,moovs,keyword-research}/README.md`
- `packages/content/profit_model.json`
- `reports/*.md` (5 audit reports)
- `docs/MASTER_ROADMAP.md`
- `docs/ADMIN_DASHBOARD_REDESIGN.md`

---

## Integration Map

### 1. ROI-Driven Content Prioritization

**Problem:** AI generates content but doesn't know which topics drive revenue.

**Solution:**
```typescript
// Enhance PageAnalyzer with profit scoring
interface EnhancedPageAnalysis extends PageAnalysisResult {
  profitScore: number; // 0-100, calculated from keyword clusters
  revenueImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: 'SCALE' | 'OPTIMIZE' | 'PAUSE';
  keywordMatch: {
    primaryKeyword: string;
    avgCPA: number;
    avgROAS: number;
    conversionValue: number;
  };
}

// server/ai/page-analyzer.ts
import keywordClusters from '@/packages/content/metrics/keyword_clusters.json';

async analyzePage(url: string): Promise<EnhancedPageAnalysis> {
  const baseAnalysis = await this.analyzePageContent(url);
  const profitData = this.matchKeywordProfit(url, baseAnalysis.keywords);
  
  return {
    ...baseAnalysis,
    profitScore: profitData.score,
    revenueImpact: profitData.impact,
    recommendedAction: profitData.action,
    keywordMatch: profitData.match
  };
}
```

**Implementation:** Week 2-3

---

### 2. Keyword-Driven Content Generation

**Problem:** Content generator creates generic content, not profit-optimized.

**Solution:**
```typescript
// server/ai/content-generator.ts
import { keywordClusters } from '@/packages/content/metrics/keyword_clusters.json';
import { adsLandingPageMatrix } from '@/packages/content/ads_landing_page_matrix.csv';

async generateContent(topic: string, context: ContentContext) {
  // Find profitable keywords for this topic
  const profitableKeywords = keywordClusters
    .filter(cluster => cluster.intent === context.intent)
    .sort((a, b) => b.profit_proxy - a.profit_proxy)
    .slice(0, 5);

  // Get landing page recommendations
  const lpRecommendation = adsLandingPageMatrix
    .find(row => row.cluster_name === context.intent);

  const prompt = `
    Generate SEO-optimized content for: ${topic}
    
    Target these high-value keywords (in order of importance):
    ${profitableKeywords.map(k => `- ${k.keyword} (ROAS: ${k.roas})`).join('\n')}
    
    Recommended H1: ${lpRecommendation.recommended_h1}
    CTA emphasis: ${lpRecommendation.recommended_cta}
    
    Requirements:
    - Naturally integrate top 3 keywords in first 200 words
    - Include pricing anchors (transparent, non-binding)
    - Differentiate from ride-share (no surge, scheduled, professional)
    - 1200+ words with FAQ section
  `;
  
  return await this.generateWithGemini(prompt);
}
```

**Implementation:** Week 3-4

---

### 3. Metrics Dashboard in Admin

**Problem:** Metrics import runs CLI-only, results not visible in dashboard.

**Solution:**

**Backend:**
```typescript
// server/routes/admin.ts
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

// Upload CSV endpoint
app.post('/api/admin/upload-csv', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { type } = req.body; // 'google_ads', 'moovs', 'keywords'
  
  // Save to appropriate folder
  const targetPath = `/data/${type}/${file.originalname}`;
  await fs.copyFile(file.path, targetPath);
  
  // Log to database
  await db.insert(csv_uploads).values({
    file_type: type,
    filename: file.originalname,
    file_path: targetPath,
    uploaded_by: req.user.id,
    uploaded_at: new Date(),
    processed: false
  });
  
  res.json({ success: true, path: targetPath });
});

// Run metrics import endpoint
app.post('/api/admin/run-metrics-import', async (req, res) => {
  try {
    const { stdout, stderr } = await execAsync('npm run metrics:import');
    
    // Read generated reports
    const roiReport = await fs.readFile('/reports/roi-report.md', 'utf-8');
    const keywordsTop100 = await fs.readFile('/reports/keyword-top100.md', 'utf-8');
    const roiSummary = await fs.readFile('/packages/content/metrics/roi_summary.json', 'utf-8');
    
    res.json({
      success: true,
      reports: {
        roi: roiReport,
        keywords: keywordsTop100,
        summary: JSON.parse(roiSummary)
      },
      logs: { stdout, stderr }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Frontend:**
```typescript
// client/src/pages/admin/AnalyticsDashboard.tsx
export default function AnalyticsDashboard() {
  const [csvType, setCsvType] = useState('google_ads');
  const [uploading, setUploading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', csvType);
    
    await fetch('/api/admin/upload-csv', {
      method: 'POST',
      body: formData
    });
  };

  const runMetricsImport = async () => {
    const response = await fetch('/api/admin/run-metrics-import', {
      method: 'POST'
    });
    const results = await response.json();
    setImportResults(results);
  };

  return (
    <div>
      <CSVUploader onUpload={handleUpload} />
      <Button onClick={runMetricsImport}>Run Metrics Import</Button>
      {importResults && <ROISummaryDisplay data={importResults.summary} />}
    </div>
  );
}
```

**Implementation:** Week 2

---

### 4. Multi-Site Architecture

**Problem:** All systems assume single site. Need to manage 4 domains.

**Solution:**

**Firebase Hosting Config:**
```json
// firebase.json
{
  "hosting": [
    {
      "target": "airport",
      "public": "dist/public/airport",
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    },
    {
      "target": "partybus",
      "public": "dist/public/partybus",
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    },
    {
      "target": "executive",
      "public": "dist/public/executive",
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    },
    {
      "target": "wedding",
      "public": "dist/public/wedding",
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    },
    {
      "target": "admin",
      "public": "dist/public/admin",
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    }
  ]
}
```

**Build Script:**
```typescript
// scripts/build-multisite.mjs
const sites = [
  { name: 'airport', domain: 'chicagoairportblackcar.com' },
  { name: 'partybus', domain: 'chicago-partybus.com' },
  { name: 'executive', domain: 'chicagoexecutivecarservice.com' },
  { name: 'wedding', domain: 'chicagoweddingtransportation.com' }
];

for (const site of sites) {
  console.log(`Building ${site.name}...`);
  
  // Set environment variables
  process.env.VITE_SITE_NAME = site.name;
  process.env.VITE_DOMAIN = site.domain;
  process.env.VITE_GA4_ID = 'G-CC67CH86JR'; // Same GA4 for all
  
  // Build with Vite
  await exec(`vite build --outDir=dist/public/${site.name}`);
  
  // Generate sitemap
  await generateSitemap(site);
  
  // Copy site-specific content
  await copyContent(site);
}
```

**Site Context Provider:**
```typescript
// client/src/contexts/SiteContext.tsx
export const SiteContext = createContext<SiteConfig>({
  name: 'airport',
  domain: 'chicagoairportblackcar.com',
  theme: { primary: '#000', accent: '#FFD700' },
  services: ['airport-transfer', 'black-car'],
  fleet: ['sedan', 'suv'],
  hero: {
    title: 'Chicago Airport Black Car Service',
    subtitle: 'No Surge Pricing, Guaranteed Pickup'
  }
});

export function useSite() {
  return useContext(SiteContext);
}
```

**Implementation:** Week 7-12 (Phase 5 in Master Roadmap)

---

### 5. SEO Bot Workflow Integration

**Problem:** SEO bot scripts exist but no UI workflow.

**Solution:**

**Topic Proposal with Profit Prioritization:**
```typescript
// scripts/seo-propose.mjs (enhanced)
import { keywordClusters } from '../packages/content/metrics/keyword_clusters.json';
import { profitModel } from '../packages/content/profit_model.json';

async function proposeTopics() {
  // Get profitable keyword clusters
  const clusters = keywordClusters
    .filter(c => c.roas >= profitModel.roas_thresholds.acceptable)
    .sort((a, b) => b.profit_proxy - a.profit_proxy)
    .slice(0, 25); // Max 25 per run

  const topics = clusters.map(cluster => ({
    id: generateId(),
    keyword: cluster.keyword,
    intent: cluster.intent,
    priority: cluster.profit_proxy,
    suggested_site: inferSite(cluster.intent),
    suggested_path: generatePath(cluster.keyword),
    status: 'QUEUE',
    created_at: new Date()
  }));

  // Write to queue
  await fs.writeFile(
    './packages/content/seo-bot/queue/topics.json',
    JSON.stringify(topics, null, 2)
  );

  return topics;
}
```

**Draft Generation:**
```typescript
// scripts/seo-draft.mjs
import { generateContent } from '../server/ai/content-generator.ts';

async function generateDrafts() {
  const topics = await loadTopics();
  const drafts = [];

  for (const topic of topics.filter(t => t.status === 'QUEUE')) {
    const content = await generateContent(topic.keyword, {
      intent: topic.intent,
      site: topic.suggested_site,
      path: topic.suggested_path
    });

    const draft = {
      id: generateId(),
      topic_id: topic.id,
      title: content.title,
      meta_description: content.meta,
      slug: topic.suggested_path,
      h1: content.h1,
      body_md: content.body,
      schema_jsonld: content.schema,
      internal_links: content.links,
      images: content.images,
      faq: content.faq,
      word_count: countWords(content.body),
      status: 'DRAFT',
      created_at: new Date()
    };

    drafts.push(draft);

    // Update topic status
    topic.status = 'DRAFTING';
  }

  await saveDrafts(drafts);
  await saveTopics(topics);
}
```

**Quality Gate:**
```typescript
// scripts/seo-quality-gate.mjs
import { checkDuplicates, checkSimilarity, checkWordCount } from './validators.js';

async function runQualityGate() {
  const drafts = await loadDrafts();
  const results = { passed: [], failed: [] };

  for (const draft of drafts.filter(d => d.status === 'DRAFT')) {
    const issues = [];

    // Check 1: Word count
    if (draft.word_count < 1200) {
      issues.push(`Content too short: ${draft.word_count} words (min 1200)`);
    }

    // Check 2: Duplicate titles
    const titleDupe = drafts.find(d => 
      d.id !== draft.id && d.title === draft.title
    );
    if (titleDupe) {
      issues.push(`Duplicate title: "${draft.title}"`);
    }

    // Check 3: Semantic similarity
    const similar = await checkSimilarity(draft, drafts);
    if (similar.score > 0.85) {
      issues.push(`High similarity to "${similar.match.title}" (${similar.score})`);
    }

    // Check 4: Required sections
    if (!draft.faq || draft.faq.length < 5) {
      issues.push('Missing or insufficient FAQ section (min 5 questions)');
    }

    // Check 5: Images
    if (!draft.images || draft.images.length < 1) {
      issues.push('No hero image specified');
    }

    // Check 6: Schema
    if (!draft.schema_jsonld || draft.schema_jsonld.length === 0) {
      issues.push('No JSON-LD schema provided');
    }

    if (issues.length === 0) {
      draft.status = 'READY';
      results.passed.push(draft);
    } else {
      draft.issues = issues;
      results.failed.push(draft);
    }
  }

  await saveDrafts([...results.passed, ...results.failed]);

  // Generate report
  const report = {
    timestamp: new Date(),
    passed: results.passed.length,
    failed: results.failed.length,
    issues: results.failed.map(d => ({
      title: d.title,
      issues: d.issues
    }))
  };

  await fs.writeFile('./reports/seo-gate-report.json', JSON.stringify(report, null, 2));
  await generateMarkdownReport(report);

  return report;
}
```

**Implementation:** Week 3-4

---

## Future Agent Collaboration

### Agent 3: Multi-Site Builder (Future)
**Responsibilities:**
- Build Party Bus site (chicago-partybus.com)
- Build Executive site (chicagoexecutivecarservice.com)
- Build Wedding site (chicagoweddingtransportation.com)
- Ensure design consistency across all sites
- Set up Firebase hosting targets
- Configure domain mappings

**Inputs from Current Work:**
- Master Roadmap (Phase 5)
- Profit model (determine which services per site)
- Admin Dashboard Redesign (site selector component)
- Content clusters (assign to appropriate sites)

**Timeline:** Week 7-12

---

### Agent 4: Image Optimization Specialist (Future)
**Responsibilities:**
- Convert all PNGs to WebP (<200 KB each)
- Generate responsive sizes (480w, 768w, 1024w, 1920w)
- Implement lazy loading
- Add preload hints for hero images
- Create image optimization script
- Update image manifests

**Inputs from Current Work:**
- Admin Dashboard Redesign (Image Management section)
- Existing images in `client/public/assets/generated_images/`
- Image generation prompts from AI system

**Timeline:** Week 4-5

---

### Agent 5: Schema & Sitemap Generator (Future)
**Responsibilities:**
- Implement JSON-LD schema for all page types
  - LocalBusiness
  - Service
  - FAQPage
  - BreadcrumbList
- Generate XML sitemaps per site
- Implement robots.txt
- Add canonical tags
- Set up structured data testing

**Inputs from Current Work:**
- Tech SEO Audit (missing schema identified)
- Page types from Master Roadmap
- Multi-site architecture

**Timeline:** Week 2-3

---

### Agent 6: CI/CD Automation (Future)
**Responsibilities:**
- GitHub Actions workflows
  - nightly-metrics.yml (daily metrics import)
  - biweekly-seo-propose.yml (content proposals)
  - weekly-quality.yml (build + verify + audits)
- PR-based publishing (never push to main directly)
- Firebase deploy automation
- Secrets management documentation

**Inputs from Current Work:**
- Master Roadmap (Phase 7)
- Metrics import script
- SEO bot scripts
- Deploy controls from Admin Dashboard

**Timeline:** Week 10-12

---

## Dependency Graph

```
Phase 1: Conversion Blockers ✅ COMPLETE
  ├─ GA4 tracking ✅
  ├─ Trust signals ✅
  ├─ Pricing anchors ✅
  └─ Differentiated messaging ✅

Phase 2: Technical SEO (Week 2-3)
  ├─ JSON-LD schemas → Agent 5
  ├─ XML sitemap → Agent 5
  ├─ Internal linking strategy
  └─ Image optimization → Agent 4

Phase 3: Analytics Integration (Week 2-3)
  ├─ CSV upload API
  ├─ Metrics import trigger
  ├─ Report viewer UI
  └─ ROI dashboard

Phase 4: SEO Bot UI (Week 3-4)
  ├─ Topic queue with profit prioritization
  ├─ Draft management workflow
  ├─ Quality gate UI
  └─ Publish approval workflow

Phase 5: Multi-Site Expansion (Week 7-12)
  ├─ Build Party Bus site → Agent 3
  ├─ Build Executive site → Agent 3
  ├─ Build Wedding site → Agent 3
  ├─ Firebase multi-hosting config
  └─ Admin site switcher

Phase 6: Admin Dashboard Redesign (Week 1-6)
  ├─ Accordion sidebar (Week 1)
  ├─ Site selector (Week 1)
  ├─ Analytics integration (Week 2)
  ├─ SEO Bot controls (Week 3-4)
  ├─ Image management (Week 4)
  └─ Deploy controls (Week 5)

Phase 7: Automation (Week 10-12)
  ├─ GitHub Actions workflows → Agent 6
  ├─ PR-based publishing
  ├─ Scheduled tasks
  └─ Secrets management

Phase 8-9: Compliance & Continuous Improvement (Ongoing)
  ├─ Google spam policy checks
  ├─ Quality gate enforcement
  ├─ Performance monitoring
  └─ User feedback loop
```

---

## Immediate Next Steps

### This Week (Agent 2 - Me):
1. ✅ Complete Phase 1 (GA4, trust signals, pricing)
2. ⬜ Build accordion sidebar component
3. ⬜ Build site selector component
4. ⬜ Redesign Overview dashboard
5. ⬜ Build CSV upload + metrics import UI
6. ⬜ Test metrics import end-to-end
7. ⬜ Deploy Phase 1 + Admin v2

### Next Week (Agent 5 - Schema):
1. Implement JSON-LD for LocalBusiness
2. Add Service schema to service pages
3. Generate XML sitemap
4. Test with Google Search Console

### Week 3 (Agent 4 - Images):
1. Create image optimization script
2. Convert existing PNGs to WebP
3. Generate responsive sizes
4. Update manifests

### Week 4 (Agent 2 - SEO Bot):
1. Build topic queue UI
2. Build draft management UI
3. Build quality gate viewer
4. Test content workflow end-to-end

---

## Communication Protocol

### Agent Handoffs
When completing work, create handoff document:
```markdown
# Agent Handoff: [Your Name] → [Next Agent]

## What I Built
- File paths
- Key functions/components
- Database changes
- Environment variables needed

## What You Need to Know
- Dependencies
- Configuration
- Testing instructions
- Known issues

## What's Next for You
- Specific tasks
- Expected inputs
- Expected outputs
- Timeline
```

### File Naming Convention
- `docs/AGENT_{AGENT_NAME}_{FEATURE}.md` - Agent-specific docs
- `docs/HANDOFF_{FROM}_{TO}.md` - Handoff documents
- `reports/{feature}-{date}.md` - Reports

### Git Branch Strategy
- `main` - production
- `develop` - integration branch
- `feature/{agent}-{feature-name}` - feature branches
- `copilot/build-seo-ads-analytics-system` - current branch

---

## Success Criteria

### System Integration Success
- ✅ ROI data flows from CSV → Dashboard → Content Prioritization
- ✅ AI page analyzer considers profit proxy
- ✅ Content generator uses profitable keywords
- ✅ Admin dashboard shows unified view
- ✅ Multi-site architecture supports 4 domains
- ✅ PR-based publishing workflow prevents spam

### Business Metrics Success (90 Days)
- Revenue: $45K/mo → $65K/mo (+44%)
- ROAS: 5.4 → 6.5 (+20%)
- Organic traffic: baseline → +50%
- 25+ SEO pages published (profit-first)
- 10+ pages ranking Top 20
- Mobile conversion: baseline → +20%
- Core Web Vitals: all "Good"
- 0 Google manual penalties

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2026  
**Status:** Active Planning Document  
**Owner:** GitHub Copilot Agent (SEO/ROI Intelligence)
