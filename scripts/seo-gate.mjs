#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRAFTS_DIR = path.join(__dirname, '../packages/content/seo-bot/drafts');
const TOPICS_FILE = path.join(__dirname, '../packages/content/seo-bot/queue/topics.json');

// Quality thresholds
const HIGH_SIMILARITY_THRESHOLD = 0.7;  // 70%+ = critical issue
const MODERATE_SIMILARITY_THRESHOLD = 0.5;  // 50%+ = warning
const MIN_WORD_COUNT = 1500;  // Updated from 1000
const RECOMMENDED_WORD_COUNT = 2000;
const MIN_SECTIONS = 5;  // Updated from 4
const LOCAL_KEYWORDS = ['chicago', 'illinois', 'o\'hare', 'midway', 'loop', 'suburb'];
const PHONE_PATTERN = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

// Helper function to count words accurately
function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

async function loadDraft(filename) {
  const filepath = path.join(DRAFTS_DIR, filename);
  const data = await fs.readFile(filepath, 'utf-8');
  return { data: JSON.parse(data), filepath };
}

async function loadAllDrafts() {
  const files = await fs.readdir(DRAFTS_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
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
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

async function checkDuplicateContent(draft, allDrafts) {
  const issues = [];
  const warnings = [];
  
  const draftContent = draft.data.content.sections
    .map(s => s.content)
    .join(' ');
  
  for (const otherDraft of allDrafts) {
    if (otherDraft.filename === draft.filename) continue;
    
    const otherContent = otherDraft.data.content.sections
      .map(s => s.content)
      .join(' ');
    
    const similarity = calculateSimilarity(draftContent, otherContent);
    
    if (similarity > HIGH_SIMILARITY_THRESHOLD) {
      issues.push(`High similarity (${(similarity * 100).toFixed(1)}%) with ${otherDraft.filename}`);
    } else if (similarity > MODERATE_SIMILARITY_THRESHOLD) {
      warnings.push(`Moderate similarity (${(similarity * 100).toFixed(1)}%) with ${otherDraft.filename}`);
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
  
  if (totalWords < MIN_WORD_COUNT) {
    issues.push(`Content too short: ${totalWords} words (minimum ${MIN_WORD_COUNT})`);
  } else if (totalWords < RECOMMENDED_WORD_COUNT) {
    warnings.push(`Content is short: ${totalWords} words (recommended ${RECOMMENDED_WORD_COUNT}+)`);
  }
  
  // Check section distribution
  if (content.sections.length < MIN_SECTIONS) {
    issues.push(`Too few sections: ${content.sections.length} (minimum ${MIN_SECTIONS})`);
  }
  
  // Check for FAQ section
  const hasFAQ = content.sections.some(s => 
    s.heading.toLowerCase().includes('faq') || 
    s.heading.toLowerCase().includes('question')
  ) || content.faqSection?.length > 0;
  
  if (!hasFAQ) {
    issues.push('Missing FAQ section (required)');
  } else if (content.faqSection && content.faqSection.length < 5) {
    warnings.push(`FAQ section has only ${content.faqSection.length} questions (recommended 5+)`);
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
    issues.push('Missing schema markup');
    return { issues, warnings };
  }
  
  if (!schema['@context'] || schema['@context'] !== 'https://schema.org') {
    issues.push('Invalid or missing schema @context');
  }
  
  if (!schema['@type']) {
    issues.push('Missing schema @type');
  }
  
  const requiredFields = ['headline', 'description'];
  requiredFields.forEach(field => {
    if (!schema[field]) {
      warnings.push(`Schema missing recommended field: ${field}`);
    }
  });
  
  return { issues, warnings };
}

/**
 * Check for local value (Chicago-specific content)
 */
function checkLocalValue(draft) {
  const issues = [];
  const warnings = [];
  
  const contentText = draft.data.content.sections
    .map(s => s.content)
    .join(' ')
    .toLowerCase();
  
  const localMentions = LOCAL_KEYWORDS.filter(keyword => 
    contentText.includes(keyword)
  );
  
  if (localMentions.length === 0) {
    issues.push('No Chicago/local area mentions found (required for local SEO)');
  } else if (localMentions.length < 2) {
    warnings.push(`Limited local value: only mentions "${localMentions[0]}" (recommend 2+ local keywords)`);
  }
  
  return { issues, warnings, localScore: localMentions.length };
}

/**
 * Check for CTA presence
 */
function checkCTA(draft) {
  const issues = [];
  const warnings = [];
  
  const ctas = draft.data.content.ctas || [];
  
  if (ctas.length === 0) {
    issues.push('No CTAs found (call-to-action required)');
  } else if (ctas.length < 2) {
    warnings.push('Only one CTA found (recommend 2+ for better conversion)');
  }
  
  return { issues, warnings };
}

/**
 * Check for phone number presence
 */
function checkPhoneNumber(draft) {
  const issues = [];
  const warnings = [];
  
  const contentText = draft.data.content.sections
    .map(s => s.content)
    .join(' ');
  
  const hasPhone = PHONE_PATTERN.test(contentText) || 
    (draft.data.content.ctas && draft.data.content.ctas.some(cta => 
      cta.url?.startsWith('tel:') || PHONE_PATTERN.test(cta.text)
    ));
  
  if (!hasPhone) {
    warnings.push('No phone number found in content or CTAs');
  }
  
  return { issues, warnings };
}

function checkLinks(draft) {
  const issues = [];
  const warnings = [];
  
  const internalLinks = draft.data.content.internalLinks || [];
  
  if (internalLinks.length === 0) {
    warnings.push('No internal links suggested');
  } else if (internalLinks.length < 3) {
    warnings.push(`Few internal links: ${internalLinks.length} (recommended 3+)`);
  }
  
  // Check for broken link patterns (basic validation)
  internalLinks.forEach(link => {
    if (!link.url || !link.anchor) {
      issues.push(`Invalid internal link: missing url or anchor`);
    }
    if (!link.url.startsWith('/')) {
      warnings.push(`Internal link should be relative: ${link.url}`);
    }
  });
  
  // Check if content mentions links but doesn't have link objects
  const contentText = draft.data.content.sections.map(s => s.content).join(' ');
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = contentText.match(urlPattern) || [];
  
  if (urls.length > 0) {
    warnings.push(`Found ${urls.length} raw URL(s) in content - consider proper link formatting`);
  }
  
  return { issues, warnings };
}

function checkImages(draft) {
  const issues = [];
  const warnings = [];
  
  const images = draft.data.content.images || [];
  
  if (images.length === 0) {
    issues.push('No images specified (minimum 3 required)');
    return { issues, warnings };
  }
  
  if (images.length < 3) {
    issues.push(`Only ${images.length} image(s) specified (minimum 3 required)`);
  }
  
  images.forEach((img, idx) => {
    if (!img.alt || img.alt.length < 10) {
      issues.push(`Image ${idx + 1}: Alt text missing or too short`);
    }
    
    // Check if alt text includes relevant keywords
    const altLower = img.alt?.toLowerCase() || '';
    const hasLocalKeyword = LOCAL_KEYWORDS.some(k => altLower.includes(k));
    if (!hasLocalKeyword) {
      warnings.push(`Image ${idx + 1}: Alt text doesn't include local keywords`);
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
    issues.push('Missing title');
  } else if (content.title.length > 60) {
    warnings.push(`Title too long: ${content.title.length} chars (max 60)`);
  } else if (content.title.length < 30) {
    warnings.push(`Title too short: ${content.title.length} chars (min 30)`);
  }
  
  if (!content.metaDescription) {
    issues.push('Missing meta description');
  } else if (content.metaDescription.length > 160) {
    warnings.push(`Meta description too long: ${content.metaDescription.length} chars (max 160)`);
  } else if (content.metaDescription.length < 120) {
    warnings.push(`Meta description too short: ${content.metaDescription.length} chars (min 120)`);
  }
  
  if (!content.slug) {
    issues.push('Missing URL slug');
  } else if (!/^[a-z0-9-]+$/.test(content.slug)) {
    issues.push('Invalid slug format (use lowercase letters, numbers, and hyphens only)');
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
    localValue: checkLocalValue(draft),
    cta: checkCTA(draft),
    phoneNumber: checkPhoneNumber(draft),
    schema: checkSchemaMarkup(draft),
    links: checkLinks(draft),
    images: checkImages(draft),
    duplicates: await checkDuplicateContent(draft, allDrafts)
  };
  
  let totalIssues = 0;
  let totalWarnings = 0;
  
  // Report results
  for (const [checkName, result] of Object.entries(checks)) {
    const displayName = checkName.charAt(0).toUpperCase() + checkName.slice(1);
    
    if (result.issues && result.issues.length > 0) {
      console.log(`❌ ${displayName}:`);
      result.issues.forEach(issue => console.log(`   - ${issue}`));
      totalIssues += result.issues.length;
    } else {
      console.log(`✅ ${displayName}`);
    }
    
    if (result.warnings && result.warnings.length > 0) {
      console.log(`⚠️  ${displayName} Warnings:`);
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
      totalWarnings += result.warnings.length;
    }
    
    if (checkName === 'thinContent' && result.wordCount) {
      console.log(`   Word count: ${result.wordCount}`);
    }
    
    if (checkName === 'localValue' && result.localScore !== undefined) {
      console.log(`   Local keywords: ${result.localScore}`);
    }
    
    console.log('');
  }
  
  // Final verdict
  console.log('─'.repeat(60));
  console.log(`\n📊 Summary: ${totalIssues} issue(s), ${totalWarnings} warning(s)\n`);
  
  if (totalIssues > 0) {
    console.log('❌ FAIL - Critical issues must be resolved before publishing\n');
    return { passed: false, issues: totalIssues, warnings: totalWarnings };
  } else if (totalWarnings > 5) {
    console.log('⚠️  PASS WITH WARNINGS - Consider addressing warnings before publishing\n');
    return { passed: true, issues: totalIssues, warnings: totalWarnings };
  } else {
    console.log('✅ PASS - Content meets quality standards\n');
    return { passed: true, issues: totalIssues, warnings: totalWarnings };
  }
}

async function runAllGates() {
  const drafts = await loadAllDrafts();
  
  if (drafts.length === 0) {
    console.log('📭 No drafts to check');
    return;
  }
  
  console.log(`\n🚪 Running quality gates for ${drafts.length} draft(s)\n`);
  
  const results = [];
  
  for (const draft of drafts) {
    const result = await runGate(draft.filename);
    results.push({ filename: draft.filename, ...result });
  }
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 BATCH SUMMARY\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${results.length}\n`);
  
  if (failed > 0) {
    console.log('Failed drafts:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.filename} (${r.issues} issues)`);
    });
    console.log('');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node seo-gate.mjs [options]

Options:
  --draft <filename>   Check specific draft file
  --all                Check all draft files
  --help, -h           Show this help message

Quality Checks:
  ✓ Duplicate content detection (similarity > 70%)
  ✓ Thin content detection (< 1000 words)
  ✓ Schema markup validation
  ✓ Internal/external links check
  ✓ Image requirements (alt text, placement)
  ✓ Metadata validation (title, description, slug)

Examples:
  node seo-gate.mjs --draft topic-001-chicago-airport-limo.json
  node seo-gate.mjs --all
    `);
    return;
  }
  
  if (args[0] === '--all') {
    await runAllGates();
  } else if (args[0] === '--draft' && args[1]) {
    const result = await runGate(args[1]);
    process.exit(result.passed ? 0 : 1);
  } else {
    console.error('❌ Invalid arguments. Use --help for usage information.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
