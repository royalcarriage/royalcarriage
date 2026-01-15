/**
 * AI Page Analyzer
 * Analyzes website pages for SEO, content quality, and conversion optimization
 */

/**
 * Safely remove HTML tags from a string
 * This function removes all HTML tags to prevent injection vulnerabilities
 */
function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove all HTML tags completely, including nested tags
  let text = html;
  let previousLength = -1;
  
  // Keep removing tags until no more tags are found
  while (text.length !== previousLength) {
    previousLength = text.length;
    text = text.replace(/<[^>]*>/g, '');
  }
  
  // Decode HTML entities in a safe order (amp must be last to avoid double-decoding)
  text = text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&'); // Always decode &amp; last
  
  return text.trim();
}

interface PageAnalysisResult {
  seoScore: number;
  contentScore: number;
  recommendations: {
    seo: string[];
    content: string[];
    style: string[];
    conversion: string[];
  };
  metrics: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: Record<string, number>;
    headingStructure: {
      h1: string[];
      h2: string[];
      h3: string[];
    };
  };
}

export class PageAnalyzer {
  private targetKeywords: string[];
  private businessContext: {
    industry: string;
    services: string[];
    locations: string[];
    vehicles: string[];
  };

  constructor() {
    // Chicago Airport Black Car service context
    this.businessContext = {
      industry: "luxury transportation",
      services: ["airport transfer", "black car service", "limousine service"],
      locations: ["Chicago", "O'Hare", "Midway", "Downtown Chicago", "Chicago suburbs"],
      vehicles: ["sedan", "SUV", "limousine", "luxury vehicle"],
    };
    
    this.targetKeywords = [
      "airport limo", "black car service", "chicago airport transportation",
      "ohare limo", "midway limo", "luxury car service", "professional driver",
      "airport transfer", "chicago limousine"
    ];
  }

  /**
   * Analyze a page's content for SEO and quality
   */
  async analyzePage(pageContent: string, pageUrl: string, pageName: string): Promise<PageAnalysisResult> {
    const metrics = this.calculateMetrics(pageContent);
    const seoScore = this.calculateSEOScore(pageContent, metrics);
    const contentScore = this.calculateContentScore(pageContent, metrics);
    const recommendations = this.generateRecommendations(pageContent, metrics, seoScore, contentScore);

    return {
      seoScore,
      contentScore,
      recommendations,
      metrics,
    };
  }

  /**
   * Calculate content metrics
   */
  private calculateMetrics(content: string) {
    // Extract headings
    const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gi;
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    const h3Regex = /<h3[^>]*>(.*?)<\/h3>/gi;

    const h1s = Array.from(content.matchAll(h1Regex)).map(m => sanitizeHtml(m[1]));
    const h2s = Array.from(content.matchAll(h2Regex)).map(m => sanitizeHtml(m[1]));
    const h3s = Array.from(content.matchAll(h3Regex)).map(m => sanitizeHtml(m[1]));

    // Remove HTML tags for text analysis
    const textContent = sanitizeHtml(content).replace(/\s+/g, ' ').trim();
    
    // Word count
    const words = textContent.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Keyword density
    const keywordDensity: Record<string, number> = {};
    this.targetKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = textContent.match(regex);
      keywordDensity[keyword] = matches ? matches.length : 0;
    });

    // Simple readability score (Flesch Reading Ease approximation)
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);
    const avgSyllablesPerWord = 1.5; // Simplified estimation
    const readabilityScore = Math.max(0, Math.min(100, 
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
    ));

    return {
      wordCount,
      readabilityScore: Math.round(readabilityScore),
      keywordDensity,
      headingStructure: {
        h1: h1s,
        h2: h2s,
        h3: h3s,
      },
    };
  }

  /**
   * Calculate SEO score
   */
  private calculateSEOScore(content: string, metrics: any): number {
    let score = 0;

    // H1 tags (max 20 points)
    if (metrics.headingStructure.h1.length === 1) {
      score += 20;
    } else if (metrics.headingStructure.h1.length > 1) {
      score += 10; // Multiple H1s is not ideal
    }

    // H2 tags (max 15 points)
    if (metrics.headingStructure.h2.length >= 2 && metrics.headingStructure.h2.length <= 6) {
      score += 15;
    } else if (metrics.headingStructure.h2.length > 0) {
      score += 8;
    }

    // Keyword usage (max 25 points)
    const keywordValues = Object.values(metrics.keywordDensity) as number[];
    const totalKeywordMentions = keywordValues.reduce((a, b) => a + b, 0);
    if (totalKeywordMentions >= 5 && totalKeywordMentions <= 15) {
      score += 25;
    } else if (totalKeywordMentions > 0) {
      score += 15;
    }

    // Word count (max 20 points)
    if (metrics.wordCount >= 300 && metrics.wordCount <= 2000) {
      score += 20;
    } else if (metrics.wordCount >= 150) {
      score += 10;
    }

    // Meta tags check (max 20 points)
    const hasMetaDescription = /<meta\s+name=["']description["']/i.test(content);
    const hasTitle = /<title>/i.test(content);
    if (hasMetaDescription) score += 10;
    if (hasTitle) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate content quality score
   */
  private calculateContentScore(content: string, metrics: any): number {
    let score = 0;

    // Readability (max 30 points)
    if (metrics.readabilityScore >= 60) {
      score += 30;
    } else if (metrics.readabilityScore >= 40) {
      score += 20;
    } else {
      score += 10;
    }

    // Content length (max 25 points)
    if (metrics.wordCount >= 400 && metrics.wordCount <= 1500) {
      score += 25;
    } else if (metrics.wordCount >= 200) {
      score += 15;
    }

    // Heading structure (max 20 points)
    if (metrics.headingStructure.h2.length >= 2) {
      score += 20;
    } else if (metrics.headingStructure.h2.length > 0) {
      score += 10;
    }

    // Local keywords (max 25 points)
    const hasLocalContent = this.businessContext.locations.some(location => 
      content.toLowerCase().includes(location.toLowerCase())
    );
    const hasServiceContent = this.businessContext.services.some(service => 
      content.toLowerCase().includes(service.toLowerCase())
    );
    
    if (hasLocalContent) score += 15;
    if (hasServiceContent) score += 10;

    return Math.min(100, score);
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    content: string, 
    metrics: any, 
    seoScore: number, 
    contentScore: number
  ) {
    const recommendations = {
      seo: [] as string[],
      content: [] as string[],
      style: [] as string[],
      conversion: [] as string[],
    };

    // SEO Recommendations
    if (metrics.headingStructure.h1.length === 0) {
      recommendations.seo.push("Add a single H1 tag with primary keyword");
    } else if (metrics.headingStructure.h1.length > 1) {
      recommendations.seo.push("Reduce to only one H1 tag per page");
    }

    if (metrics.headingStructure.h2.length < 2) {
      recommendations.seo.push("Add more H2 subheadings to improve structure");
    }

    const keywordValues = Object.values(metrics.keywordDensity) as number[];
    const totalKeywords = keywordValues.reduce((a, b) => a + b, 0);
    if (totalKeywords < 3) {
      recommendations.seo.push("Increase keyword usage naturally throughout content");
    } else if (totalKeywords > 20) {
      recommendations.seo.push("Reduce keyword density to avoid over-optimization");
    }

    // Content Recommendations
    if (metrics.wordCount < 300) {
      recommendations.content.push("Expand content to at least 300-500 words for better SEO");
    } else if (metrics.wordCount > 2000) {
      recommendations.content.push("Consider breaking content into multiple pages");
    }

    if (metrics.readabilityScore < 40) {
      recommendations.content.push("Simplify sentence structure for better readability");
    }

    // Check for location-specific content
    const hasLocation = this.businessContext.locations.some(loc => 
      content.toLowerCase().includes(loc.toLowerCase())
    );
    if (!hasLocation) {
      recommendations.content.push("Add location-specific content (Chicago, O'Hare, Midway)");
    }

    // Check for vehicle-specific content
    const hasVehicle = this.businessContext.vehicles.some(vehicle => 
      content.toLowerCase().includes(vehicle.toLowerCase())
    );
    if (!hasVehicle) {
      recommendations.content.push("Include vehicle types in content (sedan, SUV, limousine)");
    }

    // Style Recommendations
    recommendations.style.push("Ensure consistent font sizing and spacing");
    recommendations.style.push("Use professional imagery of luxury vehicles");
    recommendations.style.push("Maintain brand colors throughout");

    // Conversion Recommendations
    const hasPhoneNumber = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(content);
    if (!hasPhoneNumber) {
      recommendations.conversion.push("Add prominent phone number for immediate bookings");
    }

    const hasBookingCTA = /book now|reserve now|get quote/i.test(content);
    if (!hasBookingCTA) {
      recommendations.conversion.push("Add clear 'Book Now' or 'Get Quote' call-to-action");
    }

    recommendations.conversion.push("Include trust badges (licensed, insured, certified)");
    recommendations.conversion.push("Add customer testimonials or reviews");
    recommendations.conversion.push("Display pricing transparency or flat-rate messaging");

    return recommendations;
  }

  /**
   * Generate location-specific content recommendations
   */
  generateLocationContent(location: string, pageType: string): string {
    const templates = {
      airport: `Professional ${location} airport transportation service. Our luxury black car service provides reliable, punctual transfers to and from ${location}. Book your ${location} limo service today.`,
      suburb: `Serving ${location} with premium black car service. Whether you need airport transportation from ${location} to O'Hare or Midway, or corporate travel within ${location}, our professional chauffeurs ensure a comfortable journey.`,
      downtown: `${location} luxury transportation at its finest. Our black car service covers all of ${location}, providing executive transportation for business travelers and special occasions.`
    };

    return templates[pageType as keyof typeof templates] || templates.airport;
  }

  /**
   * Generate vehicle-specific content
   */
  generateVehicleContent(vehicle: string): string {
    const descriptions = {
      sedan: "Our luxury sedans offer comfortable transportation for up to 3 passengers with ample luggage space. Perfect for airport transfers and business meetings.",
      suv: "Spacious luxury SUVs accommodate up to 6 passengers with generous luggage capacity. Ideal for families and group travel.",
      limousine: "Experience ultimate luxury in our stretch limousines. Perfect for special occasions, corporate events, and making a lasting impression.",
    };

    return descriptions[vehicle.toLowerCase() as keyof typeof descriptions] || 
           "Premium vehicle options available for your transportation needs.";
  }
}
