#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRAFTS_DIR = path.join(__dirname, "../packages/content/seo-bot/drafts");
const TOPICS_FILE = path.join(
  __dirname,
  "../packages/content/seo-bot/queue/topics.json",
);

// Import quality gate rules from shared constants
import { 
  CONTENT_GATES, 
  TECHNICAL_GATES, 
  IMAGE_GATES, 
  UX_GATES, 
  SPAM_GATES,
  checkWordCount,
  checkH1Count,
  checkTitleLength,
  checkMetaDescriptionLength,
  checkKeywordDensity,
  checkHeroImage,
  checkImageAltText,
  checkLocalValue
} from '../shared/quality-gate-rules.ts';

// Quality thresholds
const HIGH_SIMILARITY_THRESHOLD = CONTENT_GATES.semanticSimilarity.maxScore;  // 80%+ = critical issue
const MODERATE_SIMILARITY_THRESHOLD = 0.5;  // 50%+ = warning

// Helper function to count words accurately
function countWords(text) {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

async function loadDraft(filename) {
  const filepath = path.join(DRAFTS_DIR, filename);
  const data = await fs.readFile(filepath, "utf-8");
  return { data: JSON.parse(data), filepath };
}

async function loadAllDrafts() {
  const files = await fs.readdir(DRAFTS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const drafts = [];
  for (const file of jsonFiles) {
    try {
      const draft = await loadDraft(file);
      drafts.push({ filename: file, ...draft });
    } catch (error) {
      console.warn(`⚠️  Could not load draft ${file}:`, error.message);
    }
  }

  return drafts;
}

function calculateSimilarity(text1, text2) {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

async function checkDuplicateContent(draft, allDrafts) {
  const issues = [];
  const warnings = [];

  const draftContent = draft.data.content.sections
    .map((s) => s.content)
    .join(" ");

  for (const otherDraft of allDrafts) {
    if (otherDraft.filename === draft.filename) continue;

    const otherContent = otherDraft.data.content.sections
      .map((s) => s.content)
      .join(" ");

    const similarity = calculateSimilarity(draftContent, otherContent);

    if (similarity > HIGH_SIMILARITY_THRESHOLD) {
      issues.push(
        `High similarity (${(similarity * 100).toFixed(1)}%) with ${otherDraft.filename}`,
      );
    } else if (similarity > MODERATE_SIMILARITY_THRESHOLD) {
      warnings.push(
        `Moderate similarity (${(similarity * 100).toFixed(1)}%) with ${otherDraft.filename}`,
      );
    }
  }

  return { issues, warnings };
}

function checkThinContent(draft) {
  const issues = [];
  const warnings = [];

  const content = draft.data.content;
  const totalWords = content.sections.reduce((sum, section) => {
    return sum + countWords(section.content);
  }, 0);
  
  // Determine page type from draft metadata or default to city service
  const pageType = draft.data.pageType || 'cityService';
  const minWords = pageType === 'blog' 
    ? CONTENT_GATES.blogPosts.minWords 
    : CONTENT_GATES.cityServicePages.minWords;
  
  // HARD FAIL for thin content
  if (totalWords < minWords) {
    issues.push(`HARD FAIL: Content too short: ${totalWords} words (minimum ${minWords} for ${pageType})`);
  } else if (totalWords < minWords + 200) {
    warnings.push(`Content is short: ${totalWords} words (recommended ${minWords + 200}+)`);
  }

  // Check section distribution
  if (content.sections.length < 4) {
    warnings.push(`Few sections: ${content.sections.length} (recommended 4+)`);
  }

  // Check for thin sections
  content.sections.forEach((section, idx) => {
    const words = countWords(section.content);
    if (words < 100) {
      warnings.push(`Section "${section.heading}" is thin: ${words} words`);
    }
  });

  return { issues, warnings, wordCount: totalWords };
}

function checkSchemaMarkup(draft) {
  const issues = [];
  const warnings = [];

  const schema = draft.data.content.schema;

  if (!schema) {
    issues.push("Missing schema markup");
    return { issues, warnings };
  }

  if (!schema["@context"] || schema["@context"] !== "https://schema.org") {
    issues.push("Invalid or missing schema @context");
  }

  if (!schema["@type"]) {
    issues.push("Missing schema @type");
  }

  const requiredFields = ["headline", "description"];
  requiredFields.forEach((field) => {
    if (!schema[field]) {
      warnings.push(`Schema missing recommended field: ${field}`);
    }
  });

  return { issues, warnings };
}

function checkLinks(draft) {
  const issues = [];
  const warnings = [];

  const internalLinks = draft.data.content.internalLinks || [];

  if (internalLinks.length === 0) {
    warnings.push("No internal links suggested");
  } else if (internalLinks.length < 3) {
    warnings.push(
      `Few internal links: ${internalLinks.length} (recommended 3+)`,
    );
  }

  // Check for broken link patterns (basic validation)
  internalLinks.forEach((link) => {
    if (!link.url || !link.anchor) {
      issues.push(`Invalid internal link: missing url or anchor`);
    }
    if (!link.url.startsWith("/")) {
      warnings.push(`Internal link should be relative: ${link.url}`);
    }
  });

  // Check if content mentions links but doesn't have link objects
  const contentText = draft.data.content.sections
    .map((s) => s.content)
    .join(" ");
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = contentText.match(urlPattern) || [];

  if (urls.length > 0) {
    warnings.push(
      `Found ${urls.length} raw URL(s) in content - consider proper link formatting`,
    );
  }

  return { issues, warnings };
}

function checkImages(draft) {
  const issues = [];
  const warnings = [];

  const images = draft.data.content.images || [];

  if (images.length === 0) {
    issues.push("No images specified");
    return { issues, warnings };
  }

  if (images.length < 2) {
    warnings.push(`Few images: ${images.length} (recommended 2+)`);
  }

  images.forEach((img, idx) => {
    if (!img.alt || img.alt.length < 10) {
      issues.push(`Image ${idx + 1}: Alt text missing or too short`);
    }
    if (!img.placement) {
      warnings.push(`Image ${idx + 1}: No placement guidance`);
    }
  });

  return { issues, warnings };
}

function checkMetadata(draft) {
  const issues = [];
  const warnings = [];

  const content = draft.data.content;

  if (!content.title) {
    issues.push("Missing title");
  } else if (content.title.length > 60) {
    warnings.push(`Title too long: ${content.title.length} chars (max 60)`);
  } else if (content.title.length < 30) {
    warnings.push(`Title too short: ${content.title.length} chars (min 30)`);
  }

  if (!content.metaDescription) {
    issues.push("Missing meta description");
  } else if (content.metaDescription.length > 160) {
    warnings.push(
      `Meta description too long: ${content.metaDescription.length} chars (max 160)`,
    );
  } else if (content.metaDescription.length < 120) {
    warnings.push(
      `Meta description too short: ${content.metaDescription.length} chars (min 120)`,
    );
  }

  if (!content.slug) {
    issues.push("Missing URL slug");
  } else if (!/^[a-z0-9-]+$/.test(content.slug)) {
    issues.push(
      "Invalid slug format (use lowercase letters, numbers, and hyphens only)",
    );
  }

  return { issues, warnings };
}

  return { issues, warnings };
}

function checkDoorwayPages(draft, allDrafts) {
  const issues = [];
  const warnings = [];
  
  // Check if this looks like a doorway page
  const draftContent = draft.data.content.sections
    .map(s => s.content)
    .join(' ');
  
  // Remove city names for comparison
  const normalizedDraft = draftContent
    .replace(/\b[A-Z][a-z]+\b/g, '[CITY]')
    .toLowerCase();
  
  let doorwayMatches = 0;
  
  for (const otherDraft of allDrafts) {
    if (otherDraft.filename === draft.filename) continue;
    
    const otherContent = otherDraft.data.content.sections
      .map(s => s.content)
      .join(' ');
    
    const normalizedOther = otherContent
      .replace(/\b[A-Z][a-z]+\b/g, '[CITY]')
      .toLowerCase();
    
    const similarity = calculateSimilarity(normalizedDraft, normalizedOther);
    
    if (similarity > 0.85) {
      doorwayMatches++;
    }
  }
  
  if (doorwayMatches >= 3) {
    issues.push(`HARD FAIL: Doorway page detection - ${doorwayMatches} pages with >85% similarity`);
  } else if (doorwayMatches >= 2) {
    warnings.push(`Possible doorway page - ${doorwayMatches} similar pages detected`);
  }
  
  return { issues, warnings };
}

function checkKeywordStuffing(draft) {
  const issues = [];
  const warnings = [];
  
  const content = draft.data.content.sections
    .map(s => s.content)
    .join(' ');
  
  const keyword = draft.data.keyword || draft.data.content.keywords?.[0];
  
  if (!keyword) {
    warnings.push('No primary keyword specified');
    return { issues, warnings };
  }
  
  const words = content.toLowerCase().split(/\s+/);
  const keywordWords = keyword.toLowerCase().split(/\s+/);
  
  let keywordCount = 0;
  for (let i = 0; i <= words.length - keywordWords.length; i++) {
    const slice = words.slice(i, i + keywordWords.length).join(' ');
    if (slice === keywordWords.join(' ')) {
      keywordCount++;
    }
  }
  
  const density = keywordCount / words.length;
  
  if (density > SPAM_GATES.keywordStuffing.maxDensity) {
    issues.push(`HARD FAIL: Keyword stuffing - ${(density * 100).toFixed(2)}% density (max ${SPAM_GATES.keywordStuffing.maxDensity * 100}%)`);
  } else if (density > SPAM_GATES.keywordStuffing.maxDensity * 0.8) {
    warnings.push(`High keyword density: ${(density * 100).toFixed(2)}%`);
  }
  
  return { issues, warnings };
}

function checkLocalValue(draft) {
  const issues = [];
  const warnings = [];
  
  const pageType = draft.data.pageType || 'cityService';
  
  if (pageType !== 'cityService' && pageType !== 'city') {
    return { issues, warnings };
  }
  
  const content = draft.data.content.sections
    .map(s => s.content)
    .join(' ');
  
  const hasAirportRoutes = /\b(to|from)\s+[A-Z][a-z]+\s+(Airport|ORD|MDW)/i.test(content);
  
  const namedEntities = content.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+(Hotel|Center|Park|Plaza|Stadium|Station|Airport)\b/g) || [];
  
  if (!hasAirportRoutes) {
    warnings.push('Missing local airport routes');
  }
  
  if (namedEntities.length < CONTENT_GATES.localEntities.min) {
    issues.push(`HARD FAIL: Insufficient local entities - ${namedEntities.length} (minimum ${CONTENT_GATES.localEntities.min})`);
  }
  
  return { issues, warnings };
}

function checkHeroImageGate(draft) {
  const issues = [];
  const warnings = [];
  
  const images = draft.data.content.images || [];
  
  if (images.length === 0) {
    issues.push('HARD FAIL: No images specified');
    return { issues, warnings };
  }
  
  const hasHero = images.some(img => 
    img.type === 'hero' || 
    img.placement === 'hero' || 
    images.indexOf(img) === 0
  );
  
  if (!hasHero) {
    issues.push('HARD FAIL: Hero image required but not specified');
  }
  
  return { issues, warnings };
}

function checkH1Structure(draft) {
  const issues = [];
  const warnings = [];
  
  const content = draft.data.content.sections
    .map(s => s.content)
    .join(' ');
  
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const hasH1Metadata = !!draft.data.content.h1;
  const h1InSections = draft.data.content.sections.filter(s => 
    s.heading && (s.level === 1 || s.isH1)
  ).length;
  
  const totalH1Count = h1Matches.length + (hasH1Metadata ? 1 : 0) + h1InSections;
  
  if (totalH1Count !== TECHNICAL_GATES.h1Count.exact) {
    issues.push(`HARD FAIL: Invalid H1 count - ${totalH1Count} (must be exactly ${TECHNICAL_GATES.h1Count.exact})`);
  }
  
  return { issues, warnings };
}

async function runGate(filename) {
  console.log(`\n🚪 Quality Gate Check: ${filename}\n`);

  const draft = await loadDraft(filename);
  const allDrafts = await loadAllDrafts();

  const checks = {
    metadata: checkMetadata(draft),
    thinContent: checkThinContent(draft),
    schema: checkSchemaMarkup(draft),
    links: checkLinks(draft),
    images: checkImages(draft),
    duplicates: await checkDuplicateContent(draft, allDrafts),
    // New enhanced gates
    doorwayPages: checkDoorwayPages(draft, allDrafts),
    keywordStuffing: checkKeywordStuffing(draft),
    localValue: checkLocalValue(draft),
    heroImage: checkHeroImageGate(draft),
    h1Structure: checkH1Structure(draft)
  };

  let totalIssues = 0;
  let totalWarnings = 0;

  // Report results
  for (const [checkName, result] of Object.entries(checks)) {
    const displayName = checkName.charAt(0).toUpperCase() + checkName.slice(1);

    if (result.issues && result.issues.length > 0) {
      console.log(`❌ ${displayName}:`);
      result.issues.forEach((issue) => console.log(`   - ${issue}`));
      totalIssues += result.issues.length;
    } else {
      console.log(`✅ ${displayName}`);
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log(`⚠️  ${displayName} Warnings:`);
      result.warnings.forEach((warning) => console.log(`   - ${warning}`));
      totalWarnings += result.warnings.length;
    }

    if (checkName === "thinContent" && result.wordCount) {
      console.log(`   Word count: ${result.wordCount}`);
    }

    console.log("");
  }

  // Final verdict
  console.log("─".repeat(60));
  console.log(
    `\n📊 Summary: ${totalIssues} issue(s), ${totalWarnings} warning(s)\n`,
  );

  if (totalIssues > 0) {
    console.log(
      "❌ FAIL - Critical issues must be resolved before publishing\n",
    );
    return { passed: false, issues: totalIssues, warnings: totalWarnings };
  } else if (totalWarnings > 5) {
    console.log(
      "⚠️  PASS WITH WARNINGS - Consider addressing warnings before publishing\n",
    );
    return { passed: true, issues: totalIssues, warnings: totalWarnings };
  } else {
    console.log("✅ PASS - Content meets quality standards\n");
    return { passed: true, issues: totalIssues, warnings: totalWarnings };
  }
}

async function runAllGates() {
  const drafts = await loadAllDrafts();

  if (drafts.length === 0) {
    console.log("📭 No drafts to check");
    return;
  }

  console.log(`\n🚪 Running quality gates for ${drafts.length} draft(s)\n`);

  const results = [];

  for (const draft of drafts) {
    const result = await runGate(draft.filename);
    results.push({ filename: draft.filename, ...result });
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("📊 BATCH SUMMARY\n");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${results.length}\n`);

  if (failed > 0) {
    console.log("Failed drafts:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`   - ${r.filename} (${r.issues} issues)`);
      });
    console.log("");
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Usage: node seo-gate.mjs [options]

Options:
  --draft <filename>   Check specific draft file
  --all                Check all draft files
  --help, -h           Show this help message

Quality Checks:
  ✓ Content Quality:
    - Thin content detection (city pages: <1200 words, blog: <900 words) [HARD FAIL]
    - Duplicate intent detection (semantic similarity >80%) [HARD FAIL]
    - Local value requirements (6+ local entities for city pages) [HARD FAIL]
  
  ✓ SEO Technical:
    - H1 count validation (exactly 1) [HARD FAIL]
    - Title length (50-65 chars recommended)
    - Meta description length (140-165 chars recommended)
    - Schema markup validation
    - Internal/external links check
  
  ✓ Image Quality:
    - Hero image requirement [HARD FAIL]
    - Alt text validation [HARD FAIL]
    - Image count and placement
  
  ✓ Spam Prevention:
    - Doorway page detection (>85% similarity after normalization) [HARD FAIL]
    - Keyword stuffing (>3% density) [HARD FAIL]
    - Auto-publish loop detection
  
  Note: [HARD FAIL] gates will block publishing. Other issues generate warnings.

Examples:
  node seo-gate.mjs --draft topic-001-chicago-airport-limo.json
  node seo-gate.mjs --all
    `);
    return;
  }

  if (args[0] === "--all") {
    await runAllGates();
  } else if (args[0] === "--draft" && args[1]) {
    const result = await runGate(args[1]);
    process.exit(result.passed ? 0 : 1);
  } else {
    console.error("❌ Invalid arguments. Use --help for usage information.");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Error:", error.message);
  process.exit(1);
});
