const express = require('express');
const briefService = require('../services/briefService');
const logger = require('../utils/logger');

const router = express.Router();

// POST /briefs - Create a new marketing brief
router.post('/', async (req, res) => {
  try {
    const briefData = req.body;
    
    const result = await briefService.createBrief(briefData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        brief_id: result.briefId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Error creating brief', {
      error: error.message,
      stack: error.stack,
      briefData: req.body
    }, req.requestId);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /briefs/:id - Get a specific brief by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const brief = await briefService.getBriefById(id);
    
    if (!brief) {
      return res.status(404).json({
        success: false,
        error: 'Brief not found'
      });
    }

    res.json({
      success: true,
      brief: brief
    });

  } catch (error) {
    logger.error('Error getting brief', {
      error: error.message,
      stack: error.stack,
      briefId: req.params.id
    }, req.requestId);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});


// POST /briefs/validate - Validate brief data without saving
router.post('/validate', async (req, res) => {
  try {
    const briefData = req.body;
    
    const validation = briefService.validateBrief(briefData);
    
    res.json({
      success: true,
      is_valid: validation.isValid,
      errors: validation.errors
    });

  } catch (error) {
    logger.error('Error validating brief', {
      error: error.message,
      stack: error.stack,
      briefData: req.body
    }, req.requestId);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /briefs/schema/template - Get brief template/schema
router.get('/schema/template', (req, res) => {
  const template = {
    // Required fields
    business_objective: "string - Describe the main business goal (e.g., 'Increase brand awareness for new product launch')",
    brand_category: "string - Industry/category (e.g., 'fashion', 'technology', 'food', 'automotive')",
    primary_channels: "array - Marketing channels (e.g., ['social_media', 'tv', 'digital', 'print', 'outdoor'])",
    formats: "array - Content formats needed (e.g., ['photo', 'video', 'design'])",
    tone_of_voice: "string - Brand voice (options: 'professional', 'casual', 'playful', 'luxury', 'edgy', 'friendly', 'authoritative', 'creative')",
    budget_band: "string - Budget range (options: 'low', 'medium', 'high', 'premium')",
    
    // Optional fields
    campaign_name: "string - Name of the campaign",
    brand_name: "string - Brand/company name",
    target_audience_countries: "array - Target countries/regions (e.g., ['US', 'UK', 'UAE'])",
    target_audience_description: "string - Detailed audience description",
    timeline_start: "date - Campaign start date (YYYY-MM-DD)",
    timeline_end: "date - Campaign end date (YYYY-MM-DD)",
    timeline_description: "string - Timeline details and milestones",
    budget_range_min: "number - Minimum budget amount",
    budget_range_max: "number - Maximum budget amount", 
    budget_currency: "string - Currency code (default: 'USD')",
    brand_assets: {
      logo: "string - Logo file URL or description",
      colors: "array - Brand colors (e.g., ['#FF0000', '#00FF00'])",
      fonts: "array - Brand fonts",
      guidelines: "string - Brand guidelines URL or description",
      references: "array - Reference materials/inspiration"
    },
    must_have_assets: "string - Critical brand assets that must be included",
    additional_requirements: "string - Any other specific requirements",
    client_contact_email: "string - Client contact email",
    requirements: "array - Structured requirements with type, value, and priority"
  };

  const examples = {
    luxury_fashion: {
      business_objective: "Launch new luxury handbag collection targeting affluent millennials",
      brand_category: "fashion",
      brand_name: "Luxe Atelier",
      primary_channels: ["social_media", "digital", "print"],
      formats: ["photo", "video"],
      tone_of_voice: "luxury",
      target_audience_countries: ["US", "UK", "UAE"],
      target_audience_description: "Affluent millennials aged 25-40 with high disposable income",
      timeline_start: "2024-03-01",
      timeline_end: "2024-05-31",
      budget_band: "high",
      budget_range_min: 50000,
      budget_range_max: 100000,
      brand_assets: {
        colors: ["#000000", "#C9A96E"],
        logo: "Minimalist gold logo on black background"
      },
      must_have_assets: "Logo must be prominently displayed, gold color scheme required"
    },
    tech_startup: {
      business_objective: "Generate awareness and signups for new AI productivity app",
      brand_category: "technology",
      brand_name: "ProductiveAI",
      primary_channels: ["social_media", "digital"],
      formats: ["video", "design"],
      tone_of_voice: "professional",
      target_audience_countries: ["US", "CA"],
      budget_band: "medium",
      timeline_description: "3-month campaign with weekly content drops"
    }
  };

  res.json({
    success: true,
    template: template,
    examples: examples,
    validation_rules: {
      required_fields: ["business_objective", "brand_category", "primary_channels", "formats", "tone_of_voice", "budget_band"],
      tone_options: ["professional", "casual", "playful", "luxury", "edgy", "friendly", "authoritative", "creative"],
      budget_options: ["low", "medium", "high", "premium"],
      format_options: ["photo", "video", "design", "animation", "audio", "interactive"],
      channel_options: ["social_media", "tv", "digital", "print", "outdoor", "radio", "influencer", "email", "events"]
    }
  });
});

// POST /briefs/:id/generate-campaign - Generate campaign plan from this brief
router.post('/:id/generate-campaign', async (req, res) => {
  try {
    const { id } = req.params;
    const options = req.body || {};
    console.log('request params', req.params);
    // Check if brief exists
    const brief = await briefService.getBriefById(id);
    if (!brief) {
      return res.status(404).json({
        success: false,
        error: 'Brief not found'
      });
    }

    // Generate campaign plan
    const campaignPlanService = require('../services/campaignPlanService');
    const result = await campaignPlanService.generateFromBrief(id, options);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        brief_id: id,
        plan_id: result.planId,
        campaign_plan: result.campaign_plan,
        tokens_used: result.tokens_used,
        message: 'Campaign plan generated successfully from brief'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Error generating campaign from brief', {
      error: error.message,
      stack: error.stack,
      briefId: req.params.id,
      options: req.body
    }, req.requestId);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /briefs/:id/campaigns - Get all campaign plans for this brief
router.get('/:id/campaigns', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if brief exists
    const brief = await briefService.getBriefById(id);
    if (!brief) {
      return res.status(404).json({
        success: false,
        error: 'Brief not found'
      });
    }

    // Get campaign plans
    const campaignPlanService = require('../services/campaignPlanService');
    const campaignPlans = await campaignPlanService.getCampaignPlansByBrief(id);
    
    res.json({
      success: true,
      brief_id: id,
      brief_title: brief.campaign_name || brief.brand_name || 'Untitled Brief',
      total_plans: campaignPlans.length,
      campaign_plans: campaignPlans
    });

  } catch (error) {
    logger.error('Error getting campaign plans for brief', {
      error: error.message,
      stack: error.stack,
      briefId: req.params.id
    }, req.requestId);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /briefs/:id/recommended-creatives - Get recommended creatives for brief
router.get('/:id/recommended-creatives', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    const creativeMatchingService = require('../services/creativeMatchingService');
    const result = await creativeMatchingService.findCreativesForBrief(id, { 
      limit: parseInt(limit) 
    });
    
    if (result.success) {
      res.json({
        success: true,
        brief_id: id,
        matching_summary: result.matching_summary,
        total_found: result.total_found,
        recommended_creatives: result.recommended_creatives,
        message: `Found ${result.total_found} matching creatives for this brief`
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('Error getting recommended creatives for brief:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
