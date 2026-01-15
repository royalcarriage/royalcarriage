/**
 * ROI Intelligence API Routes
 */

import express from 'express';
import { roiIntelligence } from './roi-intelligence.js';
import { enhancedPageAnalyzer } from './enhanced-page-analyzer.js';

const router = express.Router();

/**
 * GET /api/roi/opportunities
 * Get top keyword opportunities ranked by profit potential
 */
router.get('/opportunities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const opportunities = roiIntelligence.getTopOpportunities(limit);
    
    const formatted = opportunities.map(opp => ({
      keyword: opp.keywords[0],
      intent: opp.intent,
      avgCPA: opp.avgCPA,
      avgROAS: opp.avgROAS,
      conversionValue: opp.avgConversionValue,
      priority: opp.priority,
      profitScore: calculateProfitScore(opp)
    }));
    
    res.json({
      success: true,
      opportunities: formatted,
      total: formatted.length
    });
  } catch (error) {
    console.error('Error getting opportunities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load opportunities'
    });
  }
});

/**
 * POST /api/roi/analyze-page
 * Analyze a page with ROI intelligence
 */
router.post('/analyze-page', async (req, res) => {
  try {
    const { url, pageContent } = req.body;
    
    if (!url || !pageContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: url, pageContent'
      });
    }
    
    const analysis = await enhancedPageAnalyzer.analyzePage(url, pageContent);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing page:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed'
    });
  }
});

/**
 * GET /api/roi/keywords/:pageType
 * Get recommended keywords for a page type
 */
router.get('/keywords/:pageType', async (req, res) => {
  try {
    const { pageType } = req.params;
    const keywords = roiIntelligence.getRecommendedKeywords(pageType);
    
    res.json({
      success: true,
      pageType,
      keywords,
      count: keywords.length
    });
  } catch (error) {
    console.error('Error getting keywords:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get keywords'
    });
  }
});

/**
 * Helper: Calculate profit score for display
 */
function calculateProfitScore(cluster: any): number {
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

export default router;
