/**
 * Quality Gate Rules for Production-Grade SEO System
 * All gate rules that content must pass before publishing
 */

// A. Content Quality Gates
export const CONTENT_GATES = {
  // Thin Content
  cityServicePages: { minWords: 1200, fail: true },
  blogPosts: { minWords: 900, fail: true },
  
  // Duplicate Intent
  semanticSimilarity: { maxScore: 0.80, fail: true },
  
  // Local Value (REQUIRED for city pages)
  localValueRequired: [
    'local routes mentioned',
    'landmarks/venues named',
    'city-specific context'
  ],
  localEntities: {
    min: 6,
    types: ['hotels', 'venues', 'business parks', 'event destinations']
  }
};

// B. SEO Technical Gates
export const TECHNICAL_GATES = {
  h1Count: { exact: 1, fail: true },
  titleLength: { min: 50, max: 65 },
  metaDescriptionLength: { min: 140, max: 165 },
  canonical: { mustMatch: 'custom domain', fail: true },
  schema: {
    home: ['LocalBusiness'],
    serviceCity: ['Service', 'FAQPage'],
    blog: ['BlogPosting']
  },
  brokenInternalLinks: { max: 0, fail: true }
};

// C. Image Gates
export const IMAGE_GATES = {
  heroImage: { required: true, fail: true },
  servicePages: { minImages: 4 },
  vehiclePages: { minImages: 8, maxImages: 12 },
  altText: { required: true, fail: true },
  imageSource: {
    allowed: ['owned', 'licensed', 'ai-with-proof'],
    banned: ['hotlinked', 'scraped']
  }
};

// D. UX / Conversion Gates
export const UX_GATES = {
  primaryCTA: { aboveFold: true, fail: true },
  phoneCTA: { clickable: true },
  mobileLayout: { ctaVisible: true },
  consoleErrors: { max: 0, warn: true }
};

// E. Spam Policy Gates (EXPLICIT)
export const SPAM_GATES = {
  // HARD FAIL - These will get you penalized
  doorwayPages: { detect: true, fail: true }, // Same content, different city names
  keywordStuffing: { maxDensity: 0.03, fail: true }, // 3% max
  autoPublishLoops: { detect: true, fail: true },
  fakeReviews: { detect: true, fail: true },
  guaranteeClaims: { detect: true, warn: true }
};

// Page-specific requirements
export const PAGE_TYPE_REQUIREMENTS = {
  cityService: {
    minWords: CONTENT_GATES.cityServicePages.minWords,
    requiredSections: [
      'intro',
      'airport-routes',
      'vehicles',
      'local-context',
      'internal-links',
      'faq'
    ],
    minFAQs: 8,
    maxFAQs: 12,
    minLocalEntities: 6,
    schema: TECHNICAL_GATES.schema.serviceCity
  },
  blog: {
    minWords: CONTENT_GATES.blogPosts.minWords,
    requiredSections: ['intro', 'main-content', 'conclusion'],
    schema: TECHNICAL_GATES.schema.blog
  },
  airport: {
    reverseLinks: true,
    maxCities: 15,
    contextualOnly: true
  }
};

// Gate check result types
export interface GateCheckResult {
  passed: boolean;
  issues: string[];
  warnings: string[];
  gateType: string;
}

// Helper functions for gate checks
export function checkWordCount(content: string, pageType: 'cityService' | 'blog'): GateCheckResult {
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const minWords = pageType === 'cityService' 
    ? CONTENT_GATES.cityServicePages.minWords 
    : CONTENT_GATES.blogPosts.minWords;
  
  const issues: string[] = [];
  
  if (wordCount < minWords) {
    issues.push(`Content too short: ${wordCount} words (minimum ${minWords})`);
  }
  
  return {
    passed: issues.length === 0,
    issues,
    warnings: [],
    gateType: 'word-count'
  };
}

export function checkH1Count(content: string): GateCheckResult {
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const issues: string[] = [];
  
  if (h1Matches.length !== TECHNICAL_GATES.h1Count.exact) {
    issues.push(`Invalid H1 count: ${h1Matches.length} (must be exactly ${TECHNICAL_GATES.h1Count.exact})`);
  }
  
  return {
    passed: issues.length === 0,
    issues,
    warnings: [],
    gateType: 'h1-count'
  };
}

export function checkTitleLength(title: string): GateCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const { min, max } = TECHNICAL_GATES.titleLength;
  
  if (title.length < min) {
    warnings.push(`Title too short: ${title.length} chars (recommended ${min}+)`);
  } else if (title.length > max) {
    warnings.push(`Title too long: ${title.length} chars (recommended max ${max})`);
  }
  
  return {
    passed: issues.length === 0,
    issues,
    warnings,
    gateType: 'title-length'
  };
}

export function checkMetaDescriptionLength(description: string): GateCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const { min, max } = TECHNICAL_GATES.metaDescriptionLength;
  
  if (description.length < min) {
    warnings.push(`Meta description too short: ${description.length} chars (recommended ${min}+)`);
  } else if (description.length > max) {
    warnings.push(`Meta description too long: ${description.length} chars (recommended max ${max})`);
  }
  
  return {
    passed: issues.length === 0,
    issues,
    warnings,
    gateType: 'meta-description-length'
  };
}

export function checkKeywordDensity(content: string, keyword: string): GateCheckResult {
  const issues: string[] = [];
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
    issues.push(`Keyword stuffing detected: ${(density * 100).toFixed(2)}% density (max ${SPAM_GATES.keywordStuffing.maxDensity * 100}%)`);
  }
  
  return {
    passed: issues.length === 0,
    issues,
    warnings: [],
    gateType: 'keyword-density'
  };
}

export function checkHeroImage(images: any[]): GateCheckResult {
  const issues: string[] = [];
  
  const hasHero = images.some(img => img.type === 'hero' || img.placement === 'hero');
  
  if (!hasHero) {
    issues.push('Hero image is required but missing');
  }
  
  return {
    passed: issues.length === 0,
    issues,
    warnings: [],
    gateType: 'hero-image'
  };
}

export function checkImageAltText(images: any[]): GateCheckResult {
  const issues: string[] = [];
  
  images.forEach((img, idx) => {
    if (!img.alt || img.alt.length < 10) {
      issues.push(`Image ${idx + 1}: Alt text missing or too short (min 10 chars)`);
    }
  });
  
  return {
    passed: issues.length === 0,
    issues,
    warnings: [],
    gateType: 'image-alt-text'
  };
}

export function checkLocalValue(content: string, entities: string[]): GateCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check for local entities
  if (entities.length < CONTENT_GATES.localEntities.min) {
    issues.push(`Insufficient local entities: ${entities.length} (minimum ${CONTENT_GATES.localEntities.min})`);
  }
  
  // Check for local value indicators
  const hasLocalRoutes = /\b(to|from)\s+[A-Z][a-z]+\s+(Airport|Station)/i.test(content);
  const hasLandmarks = /\b(Hotel|Convention Center|Stadium|Park)\b/i.test(content);
  
  if (!hasLocalRoutes && !hasLandmarks) {
    warnings.push('Content lacks specific local landmarks or routes');
  }
  
  return {
    passed: issues.length === 0,
    issues,
    warnings,
    gateType: 'local-value'
  };
}
