/**
 * ROI Intelligence Layer
 * Integrates profit data with AI page analysis
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');

interface KeywordCluster {
  cluster: string;
  intent: 'HIGH_INTENT' | 'MEDIUM_INTENT' | 'LOW_INTENT';
  keywords: string[];
  avgCPA: number;
  avgConversionValue: number;
  avgROAS: number;
  priority: 'SCALE' | 'OPTIMIZE' | 'PAUSE';
}

interface ProfitData {
  score: number; // 0-100
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  action: 'SCALE' | 'OPTIMIZE' | 'PAUSE';
  match: {
    primaryKeyword: string;
    avgCPA: number;
    avgROAS: number;
    conversionValue: number;
  };
}

export class ROIIntelligence {
  private keywordClusters: KeywordCluster[] = [];
  
  constructor() {
    this.loadKeywordData();
  }
  
  /**
   * Load keyword clusters from metrics data
   */
  private loadKeywordData(): void {
    try {
      const dataPath = path.join(ROOT, 'packages/content/metrics/keyword_clusters.json');
      
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        this.keywordClusters = data.clusters || [];
      } else {
        // Create default high-profit keyword clusters
        this.keywordClusters = this.getDefaultClusters();
      }
    } catch (error) {
      console.error('Error loading keyword data:', error);
      this.keywordClusters = this.getDefaultClusters();
    }
  }
  
  /**
   * Get default high-profit keyword clusters
   */
  private getDefaultClusters(): KeywordCluster[] {
    return [
      {
        cluster: 'ohare-airport-service',
        intent: 'HIGH_INTENT',
        keywords: ['ohare airport limo', 'ohare car service', 'ohare airport transportation'],
        avgCPA: 12.50,
        avgConversionValue: 150.00,
        avgROAS: 12.0,
        priority: 'SCALE'
      },
      {
        cluster: 'midway-airport-service',
        intent: 'HIGH_INTENT',
        keywords: ['midway airport limo', 'midway car service', 'midway airport transportation'],
        avgCPA: 10.20,
        avgConversionValue: 120.00,
        avgROAS: 11.8,
        priority: 'SCALE'
      },
      {
        cluster: 'party-bus-rental',
        intent: 'HIGH_INTENT',
        keywords: ['chicago party bus', 'party bus rental chicago', 'chicago party bus rental'],
        avgCPA: 18.00,
        avgConversionValue: 800.00,
        avgROAS: 44.4,
        priority: 'SCALE'
      },
      {
        cluster: 'wedding-transportation',
        intent: 'HIGH_INTENT',
        keywords: ['wedding limo chicago', 'wedding transportation chicago', 'wedding car service'],
        avgCPA: 15.00,
        avgConversionValue: 500.00,
        avgROAS: 33.3,
        priority: 'SCALE'
      },
      {
        cluster: 'executive-car-service',
        intent: 'HIGH_INTENT',
        keywords: ['executive car service chicago', 'corporate car service', 'business car service'],
        avgCPA: 20.00,
        avgConversionValue: 200.00,
        avgROAS: 10.0,
        priority: 'OPTIMIZE'
      }
    ];
  }
  
  /**
   * Match page URL and keywords to profit data
   */
  matchKeywordProfit(url: string, pageKeywords: string[]): ProfitData {
    // Normalize URL and keywords
    const normalizedUrl = url.toLowerCase().replace(/\//g, '-');
    const normalizedKeywords = pageKeywords.map(k => k.toLowerCase());
    
    // Find best matching cluster
    let bestMatch: KeywordCluster | null = null;
    let bestScore = 0;
    
    for (const cluster of this.keywordClusters) {
      let score = 0;
      
      // Check URL match
      if (normalizedUrl.includes(cluster.cluster)) {
        score += 50;
      }
      
      // Check keyword matches
      for (const keyword of cluster.keywords) {
        for (const pageKeyword of normalizedKeywords) {
          if (pageKeyword.includes(keyword) || keyword.includes(pageKeyword)) {
            score += 10;
          }
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = cluster;
      }
    }
    
    // Calculate profit score and recommendations
    if (bestMatch) {
      const profitScore = this.calculateProfitScore(bestMatch);
      
      return {
        score: profitScore,
        impact: bestMatch.avgROAS > 20 ? 'HIGH' : bestMatch.avgROAS > 10 ? 'MEDIUM' : 'LOW',
        action: bestMatch.priority,
        match: {
          primaryKeyword: bestMatch.keywords[0],
          avgCPA: bestMatch.avgCPA,
          avgROAS: bestMatch.avgROAS,
          conversionValue: bestMatch.avgConversionValue
        }
      };
    }
    
    // Default low-profit page
    return {
      score: 30,
      impact: 'LOW',
      action: 'OPTIMIZE',
      match: {
        primaryKeyword: 'general service',
        avgCPA: 0,
        avgROAS: 0,
        conversionValue: 0
      }
    };
  }
  
  /**
   * Calculate profit score (0-100) based on keyword metrics
   */
  private calculateProfitScore(cluster: KeywordCluster): number {
    let score = 0;
    
    // ROAS contribution (40 points)
    if (cluster.avgROAS >= 40) score += 40;
    else if (cluster.avgROAS >= 20) score += 30;
    else if (cluster.avgROAS >= 10) score += 20;
    else score += 10;
    
    // Intent contribution (30 points)
    if (cluster.intent === 'HIGH_INTENT') score += 30;
    else if (cluster.intent === 'MEDIUM_INTENT') score += 20;
    else score += 10;
    
    // CPA efficiency (15 points)
    if (cluster.avgCPA < 15) score += 15;
    else if (cluster.avgCPA < 25) score += 10;
    else score += 5;
    
    // Conversion value (15 points)
    if (cluster.avgConversionValue >= 500) score += 15;
    else if (cluster.avgConversionValue >= 200) score += 10;
    else score += 5;
    
    return Math.min(100, score);
  }
  
  /**
   * Get top profit opportunities for content generation
   */
  getTopOpportunities(limit: number = 10): KeywordCluster[] {
    return this.keywordClusters
      .filter(c => c.priority === 'SCALE')
      .sort((a, b) => b.avgROAS - a.avgROAS)
      .slice(0, limit);
  }
  
  /**
   * Get recommended keywords for a page type
   */
  getRecommendedKeywords(pageType: string): string[] {
    const matchingClusters = this.keywordClusters.filter(c => 
      c.cluster.includes(pageType.toLowerCase()) || 
      c.priority === 'SCALE'
    );
    
    return matchingClusters
      .flatMap(c => c.keywords)
      .slice(0, 10);
  }
}

// Export singleton instance
export const roiIntelligence = new ROIIntelligence();
