const OpenAI = require('openai');
const mysql = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CampaignPlanService {
  constructor() {
    // Initialize OpenAI only if API key is available
    this.openai = null;
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
    this.tableName = 'campaign_plans';
    
    // Try to initialize OpenAI client
    this.initializeOpenAI();
  }

  // Safe JSON parsing helper
  safeJsonParse(jsonString, defaultValue) {
    try {
      if (jsonString === null || jsonString === undefined || jsonString === '') {
        return defaultValue;
      }
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON parse error in campaign service:', error.message, 'for value:', jsonString);
      return defaultValue;
    }
  }

  initializeOpenAI() {
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('✅ OpenAI client initialized successfully');
      } else {
        console.log('⚠️  OpenAI API key not configured - campaign generation will be limited');
      }
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error.message);
      this.openai = null;
    }
  }

  // Generate campaign plan from marketing brief
  async generateCampaignPlan(briefData, options = {}) {
    try {
      if (!this.openai) {
        throw new Error('OpenAI client not initialized. Please configure OPENAI_API_KEY in your environment variables.');
      }

      // Create a comprehensive prompt based on the brief
      const prompt = this.buildCampaignPrompt(briefData, options);
      
      console.log('Generating campaign plan with OpenAI...');
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are an expert marketing strategist and campaign planner with deep cultural intelligence across global markets. Generate concise, culturally-aware campaign plans based on marketing briefs. 

            CRITICAL GUARDRAILS - YOU MUST FOLLOW THESE:
            
            BRAND SAFETY:
            - Never suggest content that could damage brand reputation
            - Avoid controversial topics, political statements, or divisive social issues
            - Ensure all suggestions align with professional marketing standards
            - Do not recommend content that could be seen as offensive, discriminatory, or inappropriate
            - Avoid suggesting partnerships with controversial figures or platforms
            
            CULTURAL SENSITIVITY:
            - Research and respect local customs, religious practices, and cultural norms
            - Avoid cultural stereotypes, generalizations, or assumptions
            - Consider local holidays, traditions, and social sensitivities
            - Respect local business practices and communication styles
            - Be aware of color symbolism, imagery, and messaging that may have different meanings across cultures
            - Consider local regulations, advertising standards, and compliance requirements
            
            ANTI-HALLUCINATION MEASURES:
            - Base all recommendations on established marketing principles
            - Do not invent specific statistics, data points, or market research findings
            - Use general best practices rather than claiming specific performance metrics
            - Avoid making definitive claims about market size, competitor performance, or ROI
            - Stick to proven marketing strategies and tactics
            - Do not create fake case studies, testimonials, or success stories
            
            REGIONAL COMPLIANCE:
            - Consider local advertising regulations and restrictions
            - Be aware of platform-specific rules in different regions
            - Respect data privacy laws (GDPR, local privacy regulations)
            - Consider local content moderation standards
            - Avoid suggesting tactics that may violate local marketing laws
            
            Focus on practical, actionable content that respects local customs, trends, and consumer behavior while maintaining the highest standards of brand safety and cultural sensitivity.

            Always respond with valid JSON in the following structure:
            {
              "brief_summary": {
                "campaign_title": "Concise campaign name",
                "objective": "Brief objective summary",
                "target_markets": ["country1", "country2"],
                "cultural_considerations": ["insight1", "insight2"]
              },
              "content_concepts": [
                {
                  "concept": "Content concept 1 (1-2 lines max)",
                  "rationale": "Why this works for the audience"
                },
                {
                  "concept": "Content concept 2 (1-2 lines max)", 
                  "rationale": "Cultural/market relevance"
                },
                {
                  "concept": "Content concept 3 (1-2 lines max)",
                  "rationale": "Brand alignment reason"
                }
              ],
              "content_plan": {
                "channels": {
                  "social_media": {
                    "platforms": ["Instagram", "TikTok", "Facebook"],
                    "formats": {
                      "photo": {"count": 15, "purpose": "Product showcase"},
                      "video": {"count": 8, "purpose": "Storytelling"},
                      "stories": {"count": 20, "purpose": "Behind-scenes"}
                    }
                  },
                  "digital": {
                    "platforms": ["Google Ads", "Meta Ads"],
                    "formats": {
                      "display_ads": {"count": 5, "purpose": "Awareness"},
                      "video_ads": {"count": 3, "purpose": "Conversion"}
                    }
                  }
                },
                "total_content_pieces": number,
                "production_timeline": "X weeks"
              },
              "copy_examples": {
                "headlines": ["Headline 1", "Headline 2", "Headline 3"],
                "ctas": ["CTA 1", "CTA 2", "CTA 3"],
                "taglines": ["Tagline 1", "Tagline 2"],
                "cultural_adaptations": {
                  "country1": "Localized message",
                  "country2": "Adapted approach"
                }
              },
              "keywords_tags": {
                "primary_hashtags": ["#tag1", "#tag2", "#tag3"],
                "secondary_hashtags": ["#tag4", "#tag5"],
                "seo_keywords": ["keyword1", "keyword2", "keyword3"],
                "cultural_tags": {
                  "country1": ["#localtag1", "#localtag2"],
                  "country2": ["#regionaltag1", "#regionaltag2"]
                }
              },
              "recommended_creatives": {
                "required_skills": ["skill1", "skill2"],
                "cultural_expertise": ["market1_knowledge", "market2_trends"],
                "team_size": {"photographers": 1, "designers": 1, "copywriters": 1},
                "local_talent_needed": ["country1", "country2"]
              }
            }
            
            CRITICAL: You MUST use EXACTLY this JSON structure. Do NOT use any other format. Do NOT include campaign_overview, strategy, timeline, or budget_allocation sections. Only use the structure shown above with brief_summary, content_concepts, content_plan, copy_examples, keywords_tags, and recommended_creatives.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

      const responseContent = completion.choices[0].message.content;
      
      // Parse the JSON response
      let campaignPlan;
      try {
        campaignPlan = JSON.parse(responseContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError);
        throw new Error('Invalid response format from OpenAI');
      }

      // Validate campaign plan for safety and compliance
      const validation = this.validateCampaignSafety(campaignPlan, briefData);
      if (!validation.isValid) {
        console.warn('Campaign plan failed safety validation:', validation.issues);
        // Log the issues but don't block - could add stricter handling here
      }

      // Add metadata
      campaignPlan.metadata = {
        generated_at: new Date().toISOString(),
        model_used: this.model,
        brief_id: briefData.id || null,
        version: '1.0'
      };

      return {
        success: true,
        campaign_plan: campaignPlan,
        tokens_used: completion.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error('Error generating campaign plan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Build comprehensive prompt from brief data
  buildCampaignPrompt(briefData, options = {}) {
    const {
      business_objective,
      brand_category,
      brand_name,
      campaign_name,
      primary_channels,
      formats,
      tone_of_voice,
      target_audience_countries,
      target_audience_description,
      timeline_start,
      timeline_end,
      timeline_description,
      budget_range,
      budget_range_min,
      budget_range_max,
      budget_currency,
      brand_assets,
      must_have_assets,
      additional_requirements,
      requirements
    } = briefData;

    // Extract target countries from both target_audience_countries and location requirements
    let targetCountries = [];
    if (target_audience_countries && target_audience_countries.length > 0) {
      targetCountries = target_audience_countries;
    }
    
    // Also check requirements for location data
    if (requirements && requirements.length > 0) {
      const locationRequirements = requirements
        .filter(req => req.requirement_type === 'location')
        .map(req => req.requirement_value);
      targetCountries = [...targetCountries, ...locationRequirements];
    }
    
    // Remove duplicates and ensure we have at least one country
    targetCountries = [...new Set(targetCountries)];
    if (targetCountries.length === 0) {
      targetCountries = ['Global'];
    }

    const budgetInfo = budget_range_min && budget_range_max 
      ? `${budget_currency || 'USD'} ${budget_range_min.toLocaleString()} - ${budget_range_max.toLocaleString()}`
      : `${budget_range} budget range`;

    const timelineInfo = timeline_start && timeline_end
      ? `from ${timeline_start} to ${timeline_end}`
      : timeline_description || 'timeline to be determined';

    const prompt = `Create a concise, culturally-aware marketing campaign plan for the following brief:

      **BRAND & CAMPAIGN DETAILS:**
      - Campaign: ${campaign_name || 'New Campaign'}
      - Brand: ${brand_name || 'Not specified'}
      - Industry: ${brand_category}
      - Business Objective: ${business_objective}

      **TARGET MARKETS & CULTURAL CONTEXT:**
      - Geographic Focus: ${targetCountries.join(', ')}
      - Audience Description: ${target_audience_description || 'To be defined'}
      - Cultural Considerations: Consider local customs, holidays, social media trends, and consumer behavior patterns specifically for: ${targetCountries.join(', ')}
      - IMPORTANT: Generate content ONLY for these specific markets: ${targetCountries.join(', ')} - do NOT include other countries
      - CULTURAL SAFETY: Ensure all content respects local religious practices, cultural norms, and social sensitivities for ${targetCountries.join(', ')}
      - COMPLIANCE: Consider local advertising regulations, data privacy laws, and platform restrictions for ${targetCountries.join(', ')}

      **CAMPAIGN PARAMETERS:**
      - Primary Channels: ${primary_channels ? primary_channels.join(', ') : 'TBD'}
      - Content Formats: ${formats ? formats.join(', ') : 'TBD'}
      - Tone of Voice: ${tone_of_voice}
      - Timeline: ${timelineInfo}
      - Budget: ${budgetInfo}

      **BRAND ASSETS & REQUIREMENTS:**
      - Brand Assets: ${JSON.stringify(brand_assets || {}, null, 2)}
      - Must-Have Assets: ${must_have_assets || 'None specified'}
      - Additional Requirements: ${additional_requirements || 'None specified'}

      **SPECIAL INSTRUCTIONS:**
      ${options.focus_areas ? `- Focus particularly on: ${options.focus_areas.join(', ')}` : ''}
      ${options.campaign_type ? `- Campaign Type: ${options.campaign_type}` : ''}
      ${options.innovation_level ? `- Innovation Level: ${options.innovation_level}` : ''}

      **OUTPUT REQUIREMENTS:**
      - Generate exactly 3 content concepts (1-2 lines each) that are culturally relevant
      - Create a lightweight content plan with specific channel × format × count breakdown
      - Provide short, punchy CTAs and copy examples adapted for each target market
      - Include culturally-aware hashtags and keywords for each region
      - Consider local influencer types, platform preferences, and content consumption habits
      - Keep all text concise and actionable - avoid lengthy descriptions

      Focus on practical implementation that respects cultural nuances and drives engagement in each target market.

      CRITICAL SAFETY CHECKLIST - VERIFY BEFORE RESPONDING:
      1. BRAND SAFETY: All content suggestions are professional, non-controversial, and brand-appropriate
      2. CULTURAL SENSITIVITY: All content respects local customs, religions, and cultural norms for ${targetCountries.join(', ')}
      3. NO HALLUCINATIONS: All recommendations are based on established marketing principles, no fake statistics or claims
      4. REGIONAL COMPLIANCE: All suggestions comply with local advertising laws and platform rules for ${targetCountries.join(', ')}
      5. NO STEREOTYPES: Avoid cultural generalizations or assumptions about ${targetCountries.join(', ')}
      6. APPROPRIATE TONE: Content matches the specified tone (${tone_of_voice}) while being culturally appropriate
      7. GEOGRAPHIC ACCURACY: Content is EXCLUSIVELY for ${targetCountries.join(', ')} - no other markets included

      FORMAT REQUIREMENTS:
      1. Respond ONLY with the new JSON format specified in the system prompt
      2. Generate content EXCLUSIVELY for these target markets: ${targetCountries.join(', ')}
      3. Use brief_summary, content_concepts (exactly 3), content_plan, copy_examples, keywords_tags, and recommended_creatives sections only
      4. All cultural adaptations, tags, and local talent should be for: ${targetCountries.join(', ')} ONLY`;

      return prompt;
    }

  // Validate campaign plan for safety and compliance
  validateCampaignSafety(campaignPlan, briefData) {
    const issues = [];
    
    try {
      // Check for required structure
      if (!campaignPlan.brief_summary || !campaignPlan.content_concepts || !campaignPlan.copy_examples) {
        issues.push('Missing required campaign plan sections');
      }

      // Extract target countries from brief
      let expectedCountries = [];
      if (briefData.target_audience_countries && briefData.target_audience_countries.length > 0) {
        expectedCountries = briefData.target_audience_countries;
      }
      if (briefData.requirements) {
        const locationReqs = briefData.requirements
          .filter(req => req.requirement_type === 'location')
          .map(req => req.requirement_value);
        expectedCountries = [...expectedCountries, ...locationReqs];
      }
      expectedCountries = [...new Set(expectedCountries)];

      // Check geographic accuracy
      if (expectedCountries.length > 0 && campaignPlan.brief_summary?.target_markets) {
        const planCountries = campaignPlan.brief_summary.target_markets;
        const unexpectedCountries = planCountries.filter(country => 
          !expectedCountries.some(expected => 
            expected.toLowerCase().includes(country.toLowerCase()) || 
            country.toLowerCase().includes(expected.toLowerCase())
          )
        );
        if (unexpectedCountries.length > 0) {
          issues.push(`Unexpected countries in plan: ${unexpectedCountries.join(', ')}. Expected only: ${expectedCountries.join(', ')}`);
        }
      }

      // Check for potentially problematic content
      const allText = JSON.stringify(campaignPlan).toLowerCase();
      
      // Brand safety keywords to avoid
      const riskyKeywords = [
        'controversial', 'political', 'religion', 'sex', 'violence', 'drugs', 
        'alcohol', 'gambling', 'war', 'conflict', 'protest', 'discrimination'
      ];
      
      const foundRiskyKeywords = riskyKeywords.filter(keyword => allText.includes(keyword));
      if (foundRiskyKeywords.length > 0) {
        issues.push(`Potentially risky content detected: ${foundRiskyKeywords.join(', ')}`);
      }

      // Check for cultural stereotypes (basic detection)
      const stereotypeKeywords = [
        'all people from', 'everyone in', 'typical', 'traditional people', 
        'natives', 'locals always', 'cultural norm is'
      ];
      
      const foundStereotypes = stereotypeKeywords.filter(keyword => allText.includes(keyword));
      if (foundStereotypes.length > 0) {
        issues.push(`Potential cultural stereotypes detected: ${foundStereotypes.join(', ')}`);
      }

      // Check for fake statistics or claims
      const hallucinationKeywords = [
        '% of people', 'studies show', 'research indicates', 'proven to increase', 
        'guaranteed', 'statistics reveal', 'data shows'
      ];
      
      const foundHallucinations = hallucinationKeywords.filter(keyword => allText.includes(keyword));
      if (foundHallucinations.length > 0) {
        issues.push(`Potential hallucinated claims detected: ${foundHallucinations.join(', ')}`);
      }

      // Validate tone consistency
      if (briefData.tone_of_voice && campaignPlan.copy_examples) {
        const briefTone = briefData.tone_of_voice.toLowerCase();
        const copyText = JSON.stringify(campaignPlan.copy_examples).toLowerCase();
        
        // Basic tone validation
        if (briefTone === 'professional' && (copyText.includes('yo') || copyText.includes('hey'))) {
          issues.push('Copy tone may not match professional brand voice');
        }
        if (briefTone === 'luxury' && (copyText.includes('cheap') || copyText.includes('budget'))) {
          issues.push('Copy tone may not match luxury brand positioning');
        }
      }

    } catch (error) {
      issues.push(`Validation error: ${error.message}`);
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }

  // Save campaign plan to database
  async saveCampaignPlan(campaignPlan, briefId, options = {}) {
    const connection = await mysql.getConnection();
    
    try {
      await connection.beginTransaction();

      const planId = options.planId || uuidv4();
      
      const planRecord = {
        id: planId,
        brief_id: briefId,
        title: campaignPlan.campaign_overview?.title || 'Untitled Campaign',
        tagline: campaignPlan.campaign_overview?.tagline || null,
        core_message: campaignPlan.campaign_overview?.core_message || null,
        duration_weeks: campaignPlan.campaign_overview?.duration_weeks || null,
        strategy_data: JSON.stringify(campaignPlan.strategy || {}),
        target_audience_data: JSON.stringify(campaignPlan.target_audience || {}),
        channel_strategy_data: JSON.stringify(campaignPlan.channel_strategy || {}),
        creative_requirements_data: JSON.stringify(campaignPlan.creative_requirements || {}),
        timeline_data: JSON.stringify(campaignPlan.timeline || {}),
        budget_allocation_data: JSON.stringify(campaignPlan.budget_allocation || {}),
        risk_assessment_data: JSON.stringify(campaignPlan.risk_assessment || {}),
        recommended_creatives_data: JSON.stringify(campaignPlan.recommended_creatives || {}),
        metadata: JSON.stringify(campaignPlan.metadata || {}),
        status: options.status || 'generated',
        version: campaignPlan.metadata?.version || '1.0'
      };

      const insertQuery = `
        INSERT INTO ${this.tableName} 
        (${Object.keys(planRecord).join(', ')}) 
        VALUES (${Object.keys(planRecord).map(() => '?').join(', ')})
      `;
      
      await connection.execute(insertQuery, Object.values(planRecord));
      await connection.commit();
      
      return {
        success: true,
        planId: planId,
        message: 'Campaign plan saved successfully'
      };

    } catch (error) {
      await connection.rollback();
      console.error('Error saving campaign plan:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      connection.release();
    }
  }

  // Get campaign plan by ID
  async getCampaignPlan(planId) {
    try {
      const [rows] = await mysql.execute(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [planId]
      );

      if (rows.length === 0) {
        return null;
      }

      const plan = rows[0];
      
      // Parse JSON fields safely
      return {
        ...plan,
        strategy_data: this.safeJsonParse(plan.strategy_data, {}),
        target_audience_data: this.safeJsonParse(plan.target_audience_data, {}),
        channel_strategy_data: this.safeJsonParse(plan.channel_strategy_data, {}),
        creative_requirements_data: this.safeJsonParse(plan.creative_requirements_data, {}),
        timeline_data: this.safeJsonParse(plan.timeline_data, {}),
        budget_allocation_data: this.safeJsonParse(plan.budget_allocation_data, {}),
        risk_assessment_data: this.safeJsonParse(plan.risk_assessment_data, {}),
        recommended_creatives_data: this.safeJsonParse(plan.recommended_creatives_data, {}),
        metadata: this.safeJsonParse(plan.metadata, {})
      };

    } catch (error) {
      console.error('Error getting campaign plan:', error);
      throw error;
    }
  }

  // Get campaign plans by brief ID
  async getCampaignPlansByBrief(briefId) {
    try {
      const [rows] = await mysql.execute(
        `SELECT id, title, tagline, status, version, created_at, updated_at FROM ${this.tableName} WHERE brief_id = ? ORDER BY created_at DESC`,
        [briefId]
      );

      return rows;

    } catch (error) {
      console.error('Error getting campaign plans by brief:', error);
      throw error;
    }
  }

  // Generate campaign plan from brief ID
  async generateFromBrief(briefId, options = {}) {
    try {
      // Get the brief data
      const briefService = require('./briefService');
      const brief = await briefService.getBriefById(briefId);
      
      if (!brief) {
        return {
          success: false,
          error: 'Brief not found'
        };
      }

      // Generate the campaign plan
      const generationResult = await this.generateCampaignPlan(brief, options);
      
      if (!generationResult.success) {
        return generationResult;
      }

      // Save the campaign plan
      const saveResult = await this.saveCampaignPlan(
        generationResult.campaign_plan, 
        briefId, 
        options
      );

      if (!saveResult.success) {
        return saveResult;
      }

      return {
        success: true,
        planId: saveResult.planId,
        campaign_plan: generationResult.campaign_plan,
        tokens_used: generationResult.tokens_used,
        message: 'Campaign plan generated and saved successfully'
      };

    } catch (error) {
      console.error('Error generating from brief:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update campaign plan status
  async updatePlanStatus(planId, status, notes = null) {
    try {
      const updateQuery = notes 
        ? `UPDATE ${this.tableName} SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        : `UPDATE ${this.tableName} SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      const params = notes ? [status, notes, planId] : [status, planId];
      
      const [result] = await mysql.execute(updateQuery, params);

      return {
        success: result.affectedRows > 0,
        message: result.affectedRows > 0 ? 'Status updated successfully' : 'Plan not found'
      };

    } catch (error) {
      console.error('Error updating plan status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get campaign plan statistics
  async getStats() {
    try {
      const [stats] = await mysql.execute(`
        SELECT 
          COUNT(*) as total_plans,
          COUNT(CASE WHEN status = 'generated' THEN 1 END) as generated_count,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
          COUNT(CASE WHEN status = 'in_execution' THEN 1 END) as executing_count,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_count,
          AVG(duration_weeks) as avg_duration_weeks
        FROM ${this.tableName}
      `);

      return stats[0];

    } catch (error) {
      console.error('Error getting campaign plan stats:', error);
      throw error;
    }
  }
}

module.exports = new CampaignPlanService();
