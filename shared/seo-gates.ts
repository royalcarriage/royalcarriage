/**
 * SEO Gate Check Functions
 * Validate SEO requirements before publishing content
 */

export interface GateCheckResult {
  passed: boolean;
  details: string;
  severity?: "error" | "warning";
}

export interface InterlinkingCheck {
  requiredLinks: string[];
  foundLinks: string[];
  missingLinks: string[];
  passed: boolean;
}

/**
 * Check if required internal links are present in content
 * @param content - HTML or Markdown content
 * @param requiredLinks - Array of required link patterns (e.g., ['/fleet', '/pricing'])
 * @returns InterlinkingCheck result
 */
export function checkInterlinking(
  content: string,
  requiredLinks: string[] = [],
): InterlinkingCheck {
  // Default required links for all pages
  const defaultRequired = ["/contact", "/pricing"];
  const allRequired = [...new Set([...defaultRequired, ...requiredLinks])];

  // Extract all links from content (both href and markdown links)
  const hrefRegex = /href=["']([^"']+)["']/gi;
  const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/gi;

  const foundLinks = new Set<string>();

  // Find href links
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    foundLinks.add(match[1]);
  }

  // Find markdown links
  while ((match = markdownRegex.exec(content)) !== null) {
    foundLinks.add(match[2]);
  }

  // Check which required links are present
  const missingLinks: string[] = [];
  const found: string[] = [];

  for (const required of allRequired) {
    let isFound = false;
    for (const link of foundLinks) {
      if (link.includes(required)) {
        isFound = true;
        found.push(required);
        break;
      }
    }
    if (!isFound) {
      missingLinks.push(required);
    }
  }

  return {
    requiredLinks: allRequired,
    foundLinks: found,
    missingLinks,
    passed: missingLinks.length === 0,
  };
}

/**
 * Check if H1 and title contain primary keyword
 * @param h1 - Page H1 heading
 * @param title - Meta title
 * @param primaryKeyword - Primary target keyword
 * @returns GateCheckResult
 */
export function checkKeywordMatch(
  h1: string,
  title: string,
  primaryKeyword: string,
): GateCheckResult {
  const h1Lower = h1.toLowerCase();
  const titleLower = title.toLowerCase();
  const keywordLower = primaryKeyword.toLowerCase();

  const h1HasKeyword = h1Lower.includes(keywordLower);
  const titleHasKeyword = titleLower.includes(keywordLower);

  if (h1HasKeyword && titleHasKeyword) {
    return {
      passed: true,
      details: "Primary keyword found in both H1 and title",
    };
  }

  if (!h1HasKeyword && !titleHasKeyword) {
    return {
      passed: false,
      details: `Primary keyword "${primaryKeyword}" missing from both H1 and title`,
      severity: "error",
    };
  }

  if (!h1HasKeyword) {
    return {
      passed: false,
      details: `Primary keyword "${primaryKeyword}" missing from H1`,
      severity: "warning",
    };
  }

  if (!titleHasKeyword) {
    return {
      passed: false,
      details: `Primary keyword "${primaryKeyword}" missing from meta title`,
      severity: "warning",
    };
  }

  return {
    passed: false,
    details: "Unexpected keyword match state",
    severity: "error",
  };
}

/**
 * Validate JSON-LD schema
 * @param schemaJson - JSON-LD schema string
 * @returns GateCheckResult
 */
export function validateSchema(schemaJson: string): GateCheckResult {
  if (!schemaJson || schemaJson.trim() === "") {
    return {
      passed: false,
      details: "No schema provided",
      severity: "error",
    };
  }

  try {
    const schema = JSON.parse(schemaJson);

    // Check for required @context
    if (!schema["@context"]) {
      return {
        passed: false,
        details: "Schema missing @context",
        severity: "error",
      };
    }

    // Check for required @type
    if (!schema["@type"]) {
      return {
        passed: false,
        details: "Schema missing @type",
        severity: "error",
      };
    }

    // Validate common schema types
    const validTypes = [
      "Organization",
      "LocalBusiness",
      "Service",
      "Product",
      "WebPage",
      "Article",
      "BlogPosting",
      "FAQPage",
      "BreadcrumbList",
    ];

    const schemaType = Array.isArray(schema["@type"])
      ? schema["@type"][0]
      : schema["@type"];

    if (!validTypes.includes(schemaType)) {
      return {
        passed: false,
        details: `Unknown schema type: ${schemaType}`,
        severity: "warning",
      };
    }

    // Type-specific validation
    if (schemaType === "LocalBusiness" || schemaType === "Organization") {
      if (!schema.name) {
        return {
          passed: false,
          details: "LocalBusiness/Organization schema missing name",
          severity: "error",
        };
      }
      if (!schema.address) {
        return {
          passed: false,
          details: "LocalBusiness schema missing address",
          severity: "warning",
        };
      }
    }

    if (schemaType === "Article" || schemaType === "BlogPosting") {
      if (!schema.headline) {
        return {
          passed: false,
          details: "Article/BlogPosting schema missing headline",
          severity: "error",
        };
      }
      if (!schema.datePublished) {
        return {
          passed: false,
          details: "Article/BlogPosting schema missing datePublished",
          severity: "warning",
        };
      }
    }

    if (schemaType === "Service") {
      if (!schema.name || !schema.serviceType) {
        return {
          passed: false,
          details: "Service schema missing name or serviceType",
          severity: "error",
        };
      }
    }

    return {
      passed: true,
      details: `Valid ${schemaType} schema`,
    };
  } catch (error) {
    return {
      passed: false,
      details: `Invalid JSON: ${error.message}`,
      severity: "error",
    };
  }
}

/**
 * Check for duplicate meta title across existing pages
 * @param title - Proposed meta title
 * @param existingTitles - Array of existing page titles
 * @returns GateCheckResult
 */
export function checkDuplicateTitle(
  title: string,
  existingTitles: string[],
): GateCheckResult {
  const titleLower = title.toLowerCase().trim();

  for (const existing of existingTitles) {
    if (existing.toLowerCase().trim() === titleLower) {
      return {
        passed: false,
        details: `Duplicate title found: "${existing}"`,
        severity: "error",
      };
    }
  }

  return {
    passed: true,
    details: "Title is unique",
  };
}

/**
 * Check for duplicate meta description across existing pages
 * @param description - Proposed meta description
 * @param existingDescriptions - Array of existing page descriptions
 * @returns GateCheckResult
 */
export function checkDuplicateDescription(
  description: string,
  existingDescriptions: string[],
): GateCheckResult {
  const descLower = description.toLowerCase().trim();

  for (const existing of existingDescriptions) {
    if (existing.toLowerCase().trim() === descLower) {
      return {
        passed: false,
        details: `Duplicate description found`,
        severity: "error",
      };
    }
  }

  return {
    passed: true,
    details: "Description is unique",
  };
}

/**
 * Calculate content similarity score (simple Jaccard similarity)
 * @param content1 - First content string
 * @param content2 - Second content string
 * @returns Similarity score (0-1)
 */
export function calculateSimilarity(content1: string, content2: string): number {
  const words1 = new Set(
    content1.toLowerCase().match(/\b\w+\b/g) || [],
  );
  const words2 = new Set(
    content2.toLowerCase().match(/\b\w+\b/g) || [],
  );

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Check content similarity against existing pages
 * @param content - New page content
 * @param existingContents - Array of existing page contents
 * @param threshold - Similarity threshold (default: 0.7)
 * @returns GateCheckResult
 */
export function checkContentSimilarity(
  content: string,
  existingContents: string[],
  threshold: number = 0.7,
): GateCheckResult {
  for (let i = 0; i < existingContents.length; i++) {
    const similarity = calculateSimilarity(content, existingContents[i]);
    
    if (similarity >= threshold) {
      return {
        passed: false,
        details: `Content too similar to existing page (${(similarity * 100).toFixed(1)}% match)`,
        severity: "error",
      };
    }
  }

  return {
    passed: true,
    details: "Content is sufficiently unique",
  };
}

/**
 * Validate all broken links in content
 * @param content - HTML or Markdown content
 * @param existingPaths - Array of valid internal paths
 * @returns GateCheckResult with broken links
 */
export function checkBrokenLinks(
  content: string,
  existingPaths: string[],
): GateCheckResult {
  const hrefRegex = /href=["']([^"']+)["']/gi;
  const markdownRegex = /\[([^\]]+)\]\(([^)]+)\)/gi;

  const internalLinks = new Set<string>();
  const brokenLinks: string[] = [];

  // Find all internal links
  let match;
  while ((match = hrefRegex.exec(content)) !== null) {
    const url = match[1];
    if (url.startsWith("/") && !url.startsWith("//")) {
      internalLinks.add(url);
    }
  }

  while ((match = markdownRegex.exec(content)) !== null) {
    const url = match[2];
    if (url.startsWith("/") && !url.startsWith("//")) {
      internalLinks.add(url);
    }
  }

  // Check each internal link
  for (const link of internalLinks) {
    // Remove query params and anchors for comparison
    const cleanPath = link.split("?")[0].split("#")[0];
    
    if (!existingPaths.includes(cleanPath)) {
      brokenLinks.push(link);
    }
  }

  if (brokenLinks.length > 0) {
    return {
      passed: false,
      details: `Found ${brokenLinks.length} broken link(s): ${brokenLinks.join(", ")}`,
      severity: "error",
    };
  }

  return {
    passed: true,
    details: "All internal links are valid",
  };
}

/**
 * Run all SEO gate checks
 * @param draft - Draft content object
 * @param existingData - Existing site data for comparison
 * @returns Complete gate check results
 */
export interface SEODraft {
  content: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  schema?: string;
  primaryKeyword: string;
  requiredLinks?: string[];
}

export interface ExistingData {
  titles: string[];
  descriptions: string[];
  contents: string[];
  paths: string[];
}

export interface CompleteGateResult {
  passed: boolean;
  checks: {
    duplicateTitle: GateCheckResult;
    duplicateMeta: GateCheckResult;
    similarityScore: GateCheckResult;
    schemaValid: GateCheckResult;
    brokenLinks: GateCheckResult;
    interlinks: GateCheckResult;
    keywordMatch: GateCheckResult;
  };
  suggestions: string[];
}

export function runAllGateChecks(
  draft: SEODraft,
  existingData: ExistingData,
): CompleteGateResult {
  const checks = {
    duplicateTitle: checkDuplicateTitle(draft.metaTitle, existingData.titles),
    duplicateMeta: checkDuplicateDescription(
      draft.metaDescription,
      existingData.descriptions,
    ),
    similarityScore: checkContentSimilarity(draft.content, existingData.contents),
    schemaValid: draft.schema
      ? validateSchema(draft.schema)
      : { passed: false, details: "No schema provided", severity: "warning" as const },
    brokenLinks: checkBrokenLinks(draft.content, existingData.paths),
    interlinks: {
      passed: checkInterlinking(draft.content, draft.requiredLinks || []).passed,
      details: checkInterlinking(draft.content, draft.requiredLinks || [])
        .missingLinks.length
        ? `Missing required links: ${checkInterlinking(draft.content, draft.requiredLinks || []).missingLinks.join(", ")}`
        : "All required links present",
    },
    keywordMatch: checkKeywordMatch(
      draft.h1,
      draft.metaTitle,
      draft.primaryKeyword,
    ),
  };

  // Generate suggestions
  const suggestions: string[] = [];
  if (!checks.keywordMatch.passed) {
    suggestions.push(checks.keywordMatch.details);
  }
  if (!checks.interlinks.passed) {
    suggestions.push(checks.interlinks.details);
  }
  if (!checks.schemaValid.passed && checks.schemaValid.severity === "error") {
    suggestions.push("Add valid JSON-LD schema markup");
  }

  const allPassed = Object.values(checks).every((check) => check.passed);

  return {
    passed: allPassed,
    checks,
    suggestions,
  };
}
