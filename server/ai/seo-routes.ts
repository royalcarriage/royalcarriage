/**
 * SEO Workflow API Routes
 */

import express from 'express';
import { seoWorkflow } from './seo-workflow.js';

const router = express.Router();

/**
 * GET /api/seo/proposals
 * Get all content proposals
 */
router.get('/proposals', async (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const proposals = seoWorkflow.getProposals(status);
    
    res.json({
      success: true,
      proposals,
      total: proposals.length
    });
  } catch (error) {
    console.error('Error getting proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get proposals'
    });
  }
});

/**
 * POST /api/seo/generate-proposals
 * Generate new content proposals based on profit opportunities
 */
router.post('/generate-proposals', async (req, res) => {
  try {
    const { limit = 10 } = req.body;
    const proposals = await seoWorkflow.generateProposals(limit);
    
    res.json({
      success: true,
      proposals,
      count: proposals.length
    });
  } catch (error) {
    console.error('Error generating proposals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate proposals'
    });
  }
});

/**
 * POST /api/seo/approve
 * Approve a content proposal
 */
router.post('/approve', async (req, res) => {
  try {
    const { proposalId, approvedBy } = req.body;
    
    if (!proposalId || !approvedBy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: proposalId, approvedBy'
      });
    }
    
    const success = await seoWorkflow.approveProposal(proposalId, approvedBy);
    
    if (success) {
      res.json({
        success: true,
        message: 'Proposal approved'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
  } catch (error) {
    console.error('Error approving proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve proposal'
    });
  }
});

/**
 * POST /api/seo/generate-content
 * Generate content for an approved proposal
 */
router.post('/generate-content', async (req, res) => {
  try {
    const { proposalId } = req.body;
    
    if (!proposalId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: proposalId'
      });
    }
    
    const proposal = await seoWorkflow.generateContent(proposalId);
    
    if (proposal) {
      res.json({
        success: true,
        proposal
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Proposal not found or not approved'
      });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

/**
 * POST /api/seo/publish
 * Publish approved content
 */
router.post('/publish', async (req, res) => {
  try {
    const { proposalId } = req.body;
    
    if (!proposalId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: proposalId'
      });
    }
    
    const success = await seoWorkflow.publishContent(proposalId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Content published'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Proposal not found or not ready for publishing'
      });
    }
  } catch (error) {
    console.error('Error publishing content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish content'
    });
  }
});

/**
 * GET /api/seo/proposal/:id
 * Get a specific proposal by ID
 */
router.get('/proposal/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proposal = seoWorkflow.getProposal(id);
    
    if (proposal) {
      res.json({
        success: true,
        proposal
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }
  } catch (error) {
    console.error('Error getting proposal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get proposal'
    });
  }
});

export default router;
