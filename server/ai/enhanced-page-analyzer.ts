/**
 * Enhanced Page Analyzer with ROI Integration
 * Extends base analyzer with profit-scoring capabilities
 */

import { roiIntelligence } from './roi-intelligence.js';

export interface EnhancedPageAnalysis {
  seoScore: number;
  contentScore: number;
  profitScore: number;  // NEW: 0-100 profit potential
  revenueImpact: 'HIGH' | 'MEDIUM' | 'LOW';  // NEW
  recommendedAction: 'SCALE' | 'OPTIMIZE' | 'PAUSE';  // NEW
  recommendations: {
    seo: string[];
    content: string[];
    style: string[];
    conversion: string[];
    profit: string[];  // NEW: Profit-driven recommendations
  };
  keywordMatch: {  // NEW: Profit data for matched keywords
    primaryKeyword: string;
    avgCPA: number;
    avgROAS: number;
    conversionValue: number;
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

export class EnhancedPageAnalyzer {
  /**
   * Analyze page with ROI intelligence
   */
  async analyzePage(
    url: string,
    pageContent: string,
    baseAnalysis?: any
  ): Promise<EnhancedPageAnalysis> {
    // Extract keywords from content
    const keywords = this.extractKeywords(pageContent);
    
    // Get profit data for this page
    const profitData = roiIntelligence.matchKeywordProfit(url, keywords);
    
    // Calculate base scores if not provided
    const seoScore = baseAnalysis?.seoScore || this.calculateSEOScore(pageContent);
    const contentScore = baseAnalysis?.contentScore || this.calculateContentScore(pageContent);
    
    // Generate profit-driven recommendations
    const profitRecommendations = this.generateProfitRecommendations(profitData, url);
    
    return {
      seoScore,
      contentScore,
      profitScore: profitData.score,
      revenueImpact: profitData.impact,
      recommendedAction: profitData.action,
      recommendations: {
        seo: baseAnalysis?.recommendations?.seo || [],
        content: baseAnalysis?.recommendations?.content || [],
        style: baseAnalysis?.recommendations?.style || [],
        conversion: baseAnalysis?.recommendations?.conversion || [],
        profit: profitRecommendations
      },
      keywordMatch: profitData.match,
      metrics: baseAnalysis?.metrics || this.calculateMetrics(pageContent)
    };
  }
  
  /**
   * Extract keywords from page content
   */
  private extractKeywords(content: string): string[] {
    const text = this.stripHtml(content).toLowerCase();
    
    // Common transportation/service keywords
    const serviceKeywords = [
      'limo', 'limousine', 'car service', 'transportation', 'airport', 
      'ohare', 'midway', 'party bus', 'wedding', 'executive', 'corporate',
      'chauffeur', 'black car', 'shuttle', 'transfer'
    ];
    
    const found: string[] = [];
    for (const keyword of serviceKeywords) {
      if (text.includes(keyword)) {
        found.push(keyword);
      }
    }
    
    return found;
  }
  
  /**
   * Generate profit-driven recommendations
   */
  private generateProfitRecommendations(profitData: any, url: string): string[] {
    const recommendations: string[] = [];
    
    if (profitData.impact === 'HIGH') {
      recommendations.push(
        `🎯 HIGH REVENUE PAGE: Focus on this page - ROAS ${profitData.match.avgROAS.toFixed(1)}x`,
        `💰 Target keyword: "${profitData.match.primaryKeyword}" - avg conversion value $${profitData.match.conversionValue}`
      );
    }
    
    if (profitData.action === 'SCALE') {
      recommendations.push(
        '📈 SCALE opportunity: Increase ad spend and content investment',
        '🚀 Priority for content expansion and link building'
      );
    }
    
    if (profitData.match.avgCPA > 0) {
      recommendations.push(
        `💵 Current CPA: $${profitData.match.avgCPA.toFixed(2)} - optimize to improve margins`
      );
    }
    
    // Add specific recommendations based on page type
    if (url.includes('airport') || url.includes('ohare') || url.includes('midway')) {
      recommendations.push(
        '✈️ Airport pages: Add flight tracking info and terminal-specific pickup details',
        '📍 Include specific airport locations and meeting points'
      );
    }
    
    if (profitData.score < 50) {
      recommendations.push(
        '⚠️ Low profit potential - consider pivoting content focus',
        '🔍 Research higher-value keywords in this category'
      );
    }
    
    return recommendations;
  }
  
  /**
   * Calculate basic SEO score
   */
  private calculateSEOScore(content: string): number {
    let score = 0;
    const text = this.stripHtml(content);
    
    // Word count (30 points)
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 1500) score += 30;
    else if (wordCount >= 1000) score += 20;
    else if (wordCount >= 500) score += 10;
    
    // Has H1 (20 points)
    if (content.includes('<h1')) score += 20;
    
    // Has multiple H2s (20 points)
    const h2Count = (content.match(/<h2/g) || []).length;
    if (h2Count >= 3) score += 20;
    else if (h2Count >= 1) score += 10;
    
    // Has meta description (15 points)
    if (content.includes('meta name="description"')) score += 15;
    
    // Has structured data (15 points)
    if (content.includes('application/ld+json')) score += 15;
    
    return Math.min(100, score);
  }
  
  /**
   * Calculate content score
   */
  private calculateContentScore(content: string): number {
    let score = 0;
    const text = this.stripHtml(content);
    
    // Readability (40 points)
    const avgSentenceLength = this.calculateAvgSentenceLength(text);
    if (avgSentenceLength < 20) score += 40;
    else if (avgSentenceLength < 25) score += 30;
    else score += 20;
    
    // Keyword usage (30 points)
    const hasKeywords = this.extractKeywords(content).length >= 3;
    if (hasKeywords) score += 30;
    
    // Has CTA (30 points)
    const hasCTA = content.toLowerCase().includes('call') || 
                   content.toLowerCase().includes('book') ||
                   content.toLowerCase().includes('contact');
    if (hasCTA) score += 30;
    
    return Math.min(100, score);
  }
  
  /**
   * Calculate metrics
   */
  private calculateMetrics(content: string) {
    const text = this.stripHtml(content);
    
    return {
      wordCount: text.split(/\s+/).length,
      readabilityScore: this.calculateReadabilityScore(text),
      keywordDensity: {},
      headingStructure: {
        h1: this.extractHeadings(content, 'h1'),
        h2: this.extractHeadings(content, 'h2'),
        h3: this.extractHeadings(content, 'h3')
      }
    };
  }
  
  /**
   * Strip HTML tags
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
  }
  
  /**
   * Extract headings
   */
  private extractHeadings(content: string, tag: string): string[] {
    const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'gi');
    const matches = content.matchAll(regex);
    return Array.from(matches).map(m => this.stripHtml(m[1]));
  }
  
  /**
   * Calculate average sentence length
   */
  private calculateAvgSentenceLength(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;
    
    const totalWords = text.split(/\s+/).length;
    return totalWords / sentences.length;
  }
  
  /**
   * Calculate readability score (simplified Flesch)
   */
  private calculateReadabilityScore(text: string): number {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    if (sentences === 0) return 0;
    
    const avgWordsPerSentence = words / sentences;
    
    // Simple readability score (higher is easier)
    return Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2));
  }
}

// Export singleton instance
export const enhancedPageAnalyzer = new EnhancedPageAnalyzer();
