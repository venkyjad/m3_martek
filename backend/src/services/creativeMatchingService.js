const creativesService = require('./creativesService');
const campaignPlanService = require('./campaignPlanService');
const briefService = require('./briefService');
const OpenAI = require('openai');

class CreativeMatchingService {
  constructor() {
    this.weightings = {
      skills: 0.3,           // How well skills match requirements
      themes: 0.25,          // Theme/industry alignment
      geographic: 0.2,       // Location/cultural fit
      experience: 0.15,      // Portfolio and past work
      availability: 0.1      // Current availability status
    };
    
    // Initialize OpenAI client
    this.openai = null;
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
    this.initializeOpenAI();
  }

  // Initialize OpenAI client
  initializeOpenAI() {
    try {
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
        console.log('OpenAI client initialized for creative matching');
      } else {
        console.warn('OpenAI API key not found. OpenAI-powered keyword extraction will not be available.');
      }
    } catch (error) {
      console.error('Error initializing OpenAI client:', error.message);
    }
  }

  // Build search query for creative search
  buildSearchQuery(requirements) {
    // Enhanced semantic query construction
    const semanticTerms = this.buildSemanticTerms(requirements);
    
    // Create rich semantic search query
    const queryParts = [
      requirements.industry,
      ...semanticTerms.keywords,
      ...requirements.required_skills.slice(0, 3),
      ...requirements.preferred_themes.slice(0, 2),
      requirements.tone_requirements
    ];

    const query = queryParts.filter(Boolean).join(' ');
    console.log('Enhanced semantic query:', query);

    // Build filters - Re-enabled for better matching
    const filters = {};
    
    if (requirements.required_skills.length > 0) {
      filters.skills = requirements.required_skills;
    }
    
    if (requirements.preferred_themes.length > 0) {
      filters.themes = requirements.preferred_themes;
    }
    
    if (requirements.target_countries.length > 0) {
      // Use the first country for filtering (Qdrant expects single value)
      filters.country = requirements.target_countries[0];
    }

    // Map content formats to creative mediums
    if (requirements.content_formats.length > 0) {
      const mediumMapping = {
        photo: 'photo',
        video: 'video', 
        design: 'design',
        stories: 'photo',
        display_ads: 'design',
        video_ads: 'video'
      };
      
      const mediums = requirements.content_formats
        .map(format => mediumMapping[format])
        .filter(Boolean);
      
      if (mediums.length > 0) {
        filters.mediums = [...new Set(mediums)];
      }
    }

    return { query, filters };
  }

  // Score creatives based on how well they match campaign requirements
  async scoreCreatives(creatives, requirements, campaignPlan) {
    return creatives.map(creative => {
      const scores = {
        skills: this.scoreSkillsMatch(creative, requirements),
        themes: this.scoreThemesMatch(creative, requirements),
        geographic: this.scoreGeographicMatch(creative, requirements),
        experience: this.scoreExperience(creative, requirements),
        availability: this.scoreAvailability(creative)
      };

      // Calculate weighted total score
      const totalScore = Object.entries(scores).reduce((total, [category, score]) => {
        return total + (score * this.weightings[category]);
      }, 0);

      return {
        ...creative,
        score: Math.round(totalScore * 100) / 100, // Round to 2 decimal places
        scoring_breakdown: scores,
        match_reasons: this.generateMatchReasons(creative, requirements, scores)
      };
    });
  }

  // Score how well creative's skills match requirements
  scoreSkillsMatch(creative, requirements) {
    if (!requirements.required_skills || !requirements.required_skills.length) return 0.8; // Higher base score
    
    const creativeSkills = creative.skills || [];
    const portfolioTags = creative.portfolio_tags || [];
    const allCreativeSkills = [...creativeSkills, ...portfolioTags];
    
    // ENHANCED MATCHING: Special handling for beverage/food industry
    if (requirements.industry === 'beverage') {
      const beverageRelevantSkills = ['beverage_photography', 'food_photography', 'product_photography', 'commercial_photography', 'lifestyle_photography', 'food_styling'];
      const beverageMatches = allCreativeSkills.filter(skill =>
        beverageRelevantSkills.some(relevantSkill =>
          skill.toLowerCase().includes(relevantSkill.toLowerCase()) ||
          relevantSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (beverageMatches.length > 0) {
        return Math.min(0.6 + (beverageMatches.length * 0.15), 1.0); // Higher scores for beverage relevant skills
      }
    }
    
    const matches = requirements.required_skills.filter(skill => 
      allCreativeSkills.some(creativeSkill => 
        creativeSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(creativeSkill.toLowerCase()) ||
        this.areSkillsSimilar(skill, creativeSkill)
      )
    );
    
    const matchRatio = matches.length / requirements.required_skills.length;
    // Add bonus for having any matching skills
    const bonusScore = matches.length > 0 ? 0.3 : 0;
    return Math.min(matchRatio + bonusScore, 1.0);
  }

  // Score theme/industry alignment
  scoreThemesMatch(creative, requirements) {
    if (!requirements.preferred_themes || !requirements.preferred_themes.length) return 0.8; // Higher base score
    
    const creativeThemes = creative.themes || [];
    const portfolioTags = creative.portfolio_tags || [];
    const allCreativeTags = [...creativeThemes, ...portfolioTags];
    
    const matches = requirements.preferred_themes.filter(theme =>
      allCreativeTags.some(tag =>
        tag.toLowerCase().includes(theme.toLowerCase()) ||
        theme.toLowerCase().includes(tag.toLowerCase()) ||
        this.areThemesSimilar(theme, tag)
      )
    );
    
    const matchRatio = matches.length / requirements.preferred_themes.length;
    // Add bonus for having any matching themes
    const bonusScore = matches.length > 0 ? 0.2 : 0;
    return Math.min(matchRatio + bonusScore, 1.0);
  }

  // Score geographic/cultural fit
  scoreGeographicMatch(creative, requirements) {
    if (!requirements.target_countries || !requirements.target_countries.length) return 0.7; // Higher base score when no specific countries
    
    const creativeCountry = creative.country;
    const isLocalMatch = requirements.target_countries.some(country =>
      country.toLowerCase() === creativeCountry?.toLowerCase()
    );
    
    if (isLocalMatch) return 1.0;
    
    // Enhanced regional matches for GCC and MENA
    const regionalMatches = {
      'UAE': ['Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
      'Saudi Arabia': ['UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'],
      'Qatar': ['UAE', 'Saudi Arabia', 'Kuwait', 'Bahrain', 'Oman'],
      'Kuwait': ['UAE', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Oman'],
      'Bahrain': ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman'],
      'Oman': ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain'],
      'Egypt': ['Jordan', 'Lebanon', 'Morocco', 'Tunisia'],
      'Jordan': ['Egypt', 'Lebanon', 'UAE', 'Saudi Arabia'],
      'Lebanon': ['Egypt', 'Jordan', 'UAE', 'Saudi Arabia']
    };
    
    for (const targetCountry of requirements.target_countries) {
      const regions = regionalMatches[targetCountry] || [];
      if (regions.includes(creativeCountry)) {
        return 0.8; // High regional match for GCC/MENA
      }
    }
    
    return 0.5; // Still reasonable score for global talent
  }

  // Score experience level and portfolio quality
  scoreExperience(creative, requirements) {
    let score = 0;
    
    // Rating score (0-5 scale)
    if (creative.rating) {
      score += (creative.rating / 5) * 0.4;
    }
    
    // Projects count score
    if (creative.completed_projects_count) {
      const projectScore = Math.min(creative.completed_projects_count / 100, 1); // Cap at 100 projects
      score += projectScore * 0.3;
    }
    
    // Past clients quality (basic check for recognizable brands)
    if (creative.past_clients && creative.past_clients.length > 0) {
      const qualityClients = creative.past_clients.filter(client => 
        client.length > 3 && !client.toLowerCase().includes('local')
      );
      score += Math.min(qualityClients.length / 5, 1) * 0.3;
    }
    
    return Math.min(score, 1); // Cap at 1
  }

  // Score availability
  scoreAvailability(creative) {
    if (creative.availability === 'available') return 1.0;
    if (creative.availability === 'limited') return 0.7;
    if (creative.availability === 'busy') return 0.3;
    return 0.5; // Unknown availability
  }

  // Generate human-readable match reasons
  generateMatchReasons(creative, requirements, scores) {
    const reasons = [];
    
    if (scores.skills > 0.7) {
      reasons.push(`Strong skill match (${Math.round(scores.skills * 100)}%)`);
    }
    
    if (scores.themes > 0.7) {
      reasons.push(`Excellent theme alignment (${Math.round(scores.themes * 100)}%)`);
    }
    
    if (scores.geographic > 0.8) {
      reasons.push('Local market expertise');
    } else if (scores.geographic > 0.6) {
      reasons.push('Regional market knowledge');
    }
    
    if (creative.rating && creative.rating >= 4.5) {
      reasons.push(`Highly rated (${creative.rating}/5)`);
    }
    
    if (creative.completed_projects_count && creative.completed_projects_count > 50) {
      reasons.push('Extensive portfolio');
    }
    
    if (creative.availability === 'available') {
      reasons.push('Currently available');
    }
    
    return reasons;
  }

  // Generate matching summary
  generateMatchingSummary(scoredCreatives, requirements) {
    const topScore = scoredCreatives[0]?.score || 0;
    const avgScore = scoredCreatives.reduce((sum, c) => sum + c.score, 0) / scoredCreatives.length;
    
    const skillMatches = scoredCreatives.filter(c => c.scoring_breakdown.skills > 0.7).length;
    const geoMatches = scoredCreatives.filter(c => c.scoring_breakdown.geographic > 0.8).length;
    const availableCreatives = scoredCreatives.filter(c => c.availability === 'available').length;
    
    return {
      top_match_score: Math.round(topScore * 100),
      average_match_score: Math.round(avgScore * 100),
      strong_skill_matches: skillMatches,
      local_market_experts: geoMatches,
      available_now: availableCreatives,
      search_quality: topScore > 0.7 ? 'excellent' : topScore > 0.5 ? 'good' : 'fair'
    };
  }

  async findCreativesForBrief(briefId, options = {}) {
    try {
      // Ensure creatives service is initialized
      const qdrant = require('../config/qdrant');
      if (!creativesService.embedder || !qdrant.isConnected) {
        console.log('Initializing services for creative matching...');
        if (!qdrant.isConnected) {
          await qdrant.connect();
        }
        if (!creativesService.embedder) {
          const initialized = await creativesService.initialize();
          if (!initialized) {
            return {
              success: false,
              error: 'Failed to initialize creatives service'
            };
          }
        }
      }

      const brief = await briefService.getBriefById(briefId);
      if (!brief) {
        return {
          success: false,
          error: 'Brief not found'
        };
      }

      // Use OpenAI to extract intelligent keywords and requirements
      const aiExtraction = await this.extractKeywordsWithAI(brief);
      
      if (!aiExtraction.success) {
        // Fallback to manual extraction if OpenAI fails
        console.log('OpenAI extraction failed, using fallback method');
        return this.findCreativesForBriefFallback(brief, options);
      }


      // Execute semantic search with AI-generated query
      const creatives = await creativesService.searchCreatives(
        aiExtraction.semantic_query,
        aiExtraction.filters,
        options.limit || 20
      );

      // Enhanced scoring with AI insights
      const scoredCreatives = await this.scoreCreativesWithAI(creatives, aiExtraction, brief);
      scoredCreatives.sort((a, b) => b.score - a.score);

      return {
        success: true,
        brief_id: briefId,
        ai_extraction: aiExtraction,
        total_found: scoredCreatives.length,
        recommended_creatives: scoredCreatives.slice(0, options.limit || 10),
        matching_summary: this.generateMatchingSummary(scoredCreatives, aiExtraction)
      };

    } catch (error) {
      console.error('Error finding creatives for brief:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper function to check if skills are similar
  areSkillsSimilar(skill1, skill2) {
    const skillMappings = {
      'photography': ['photo', 'photographer', 'photoshoot'],
      'videography': ['video', 'videographer', 'filming'],
      'branding': ['brand', 'identity', 'logo'],
      'commercial': ['business', 'corporate', 'professional'],
      'product': ['ecommerce', 'retail', 'amazon', 'shopify'],
      'food': ['culinary', 'restaurant', 'beverage', 'drink'],
      'lifestyle': ['fashion', 'beauty', 'wellness']
    };

    const s1 = skill1.toLowerCase();
    const s2 = skill2.toLowerCase();

    for (const [key, synonyms] of Object.entries(skillMappings)) {
      if ((s1.includes(key) || synonyms.some(syn => s1.includes(syn))) &&
          (s2.includes(key) || synonyms.some(syn => s2.includes(syn)))) {
        return true;
      }
    }
    return false;
  }

  // Helper function to check if themes are similar
  areThemesSimilar(theme1, theme2) {
    const themeMappings = {
      'food': ['culinary', 'restaurant', 'beverage', 'drink', 'dining'],
      'fashion': ['beauty', 'lifestyle', 'luxury', 'style'],
      'technology': ['tech', 'digital', 'startup', 'innovation'],
      'business': ['corporate', 'professional', 'finance', 'commercial'],
      'retail': ['ecommerce', 'product', 'shopping', 'marketplace']
    };

    const t1 = theme1.toLowerCase();
    const t2 = theme2.toLowerCase();

    for (const [key, synonyms] of Object.entries(themeMappings)) {
      if ((t1.includes(key) || synonyms.some(syn => t1.includes(syn))) &&
          (t2.includes(key) || synonyms.some(syn => t2.includes(syn)))) {
        return true;
      }
    }
    return false;
  }

  // Build semantic terms for enhanced search queries
  buildSemanticTerms(requirements) {
    const industryContexts = {
      'beverage': ['coffee', 'drinks', 'cold brew', 'liquid', 'refreshing', 'packaging', 'bottles', 'cans'],
      'food': ['cuisine', 'dining', 'meals', 'cooking', 'recipes', 'ingredients', 'gastronomy', 'chef'],
      'fashion': ['style', 'clothing', 'apparel', 'runway', 'designer', 'trendy', 'elegant', 'chic'],
      'technology': ['digital', 'innovation', 'software', 'devices', 'modern', 'cutting-edge', 'tech'],
      'automotive': ['cars', 'vehicles', 'driving', 'performance', 'luxury cars', 'automotive design'],
      'beauty': ['cosmetics', 'skincare', 'makeup', 'wellness', 'glamour', 'aesthetics'],
      'real_estate': ['properties', 'homes', 'architecture', 'buildings', 'spaces', 'interiors'],
      'finance': ['banking', 'investment', 'financial services', 'professional', 'corporate', 'business'],
      'travel': ['destinations', 'vacation', 'tourism', 'adventure', 'exploration', 'wanderlust'],
      'health': ['wellness', 'medical', 'fitness', 'healthcare', 'nutrition', 'lifestyle']
    };

    const toneContexts = {
      'friendly': ['approachable', 'warm', 'welcoming', 'casual', 'relaxed'],
      'professional': ['corporate', 'business', 'formal', 'expert', 'sophisticated'],
      'luxury': ['premium', 'high-end', 'exclusive', 'elegant', 'sophisticated'],
      'modern': ['contemporary', 'current', 'fresh', 'innovative', 'trendy'],
      'traditional': ['classic', 'timeless', 'heritage', 'authentic', 'established']
    };

    const industry = requirements.industry?.toLowerCase() || '';
    const tone = requirements.tone_requirements?.toLowerCase() || '';

    const keywords = [
      ...(industryContexts[industry] || []),
      ...(toneContexts[tone] || [])
    ];

    return {
      keywords: keywords.slice(0, 5), // Limit to top 5 contextual terms
      industry_context: industryContexts[industry] || [],
      tone_context: toneContexts[tone] || []
    };
  }

  // Extract enhanced requirements from brief with business context
  async extractEnhancedRequirements(brief) {
    const requirements = {
      required_skills: [],
      preferred_themes: [brief.brand_category],
      target_countries: [],
      content_formats: brief.formats || [],
      tone_requirements: brief.tone_of_voice,
      budget_level: brief.budget_range,
      industry: brief.brand_category,
      business_objective: brief.business_objective,
      brand_name: brief.brand_name,
      campaign_name: brief.campaign_name
    };

    // Extract from structured requirements
    if (brief.requirements) {
      brief.requirements.forEach(req => {
        if (req.requirement_type === 'skill') {
          requirements.required_skills.push(req.requirement_value);
        }
        if (req.requirement_type === 'theme') {
          requirements.preferred_themes.push(req.requirement_value);
        }
        if (req.requirement_type === 'location') {
          requirements.target_countries.push(req.requirement_value);
        }
      });
    }

    // Enhanced industry-specific skills
    this.addIndustrySpecificSkills(requirements);

    return requirements;
  }

  // Add industry-specific skills to requirements
  addIndustrySpecificSkills(requirements) {
    const industrySkills = {
      'beverage': ['beverage_photography', 'product_photography', 'food_photography', 'commercial_photography'],
      'food': ['food_photography', 'food_styling', 'culinary_photography', 'restaurant_photography'],
      'fashion': ['fashion_photography', 'lifestyle_photography', 'beauty_photography', 'commercial_photography'],
      'technology': ['tech_photography', 'product_photography', 'commercial_photography', 'digital_design'],
      'automotive': ['automotive_photography', 'vehicle_photography', 'commercial_photography'],
      'beauty': ['beauty_photography', 'cosmetics_photography', 'lifestyle_photography'],
      'real_estate': ['real_estate_photography', 'architecture_photography', 'interior_photography'],
      'lifestyle': ['lifestyle_photography', 'brand_photography', 'commercial_photography']
    };

    const industry = requirements.industry?.toLowerCase();
    if (industry && industrySkills[industry]) {
      // Add industry-specific skills to required skills if not already present
      industrySkills[industry].forEach(skill => {
        if (!requirements.required_skills.includes(skill)) {
          requirements.required_skills.push(skill);
        }
      });
    }
  }

  // Build optimized search configuration
  buildOptimizedSearch(requirements, brief) {
    const industry = requirements.industry.toLowerCase();
    
    // Industry-specific optimized queries
    const optimizedQueries = {
      'beverage': `beverage drinks coffee cold brew product photography commercial lifestyle brand ${brief.business_objective || ''} ${brief.brand_name || ''}`,
      'food': `food cuisine dining restaurant photography commercial lifestyle brand ${brief.business_objective || ''} ${brief.brand_name || ''}`,
      'fashion': `fashion style clothing apparel photography commercial lifestyle brand ${brief.business_objective || ''} ${brief.brand_name || ''}`,
      'technology': `technology digital innovation product photography commercial modern ${brief.business_objective || ''} ${brief.brand_name || ''}`,
      'automotive': `automotive cars vehicles photography commercial lifestyle luxury ${brief.business_objective || ''} ${brief.brand_name || ''}`,
      'beauty': `beauty cosmetics skincare photography commercial lifestyle brand ${brief.business_objective || ''} ${brief.brand_name || ''}`,
      'real_estate': `real estate property architecture interior photography commercial ${brief.business_objective || ''} ${brief.brand_name || ''}`
    };

    // Get optimized query or build semantic one
    const query = optimizedQueries[industry] || this.buildSemanticQuery(requirements, brief);

    // Enhanced filters
    const filters = {};
    
    if (requirements.required_skills.length > 0) {
      filters.skills = requirements.required_skills;
    }
    
    if (requirements.preferred_themes.length > 0) {
      filters.themes = requirements.preferred_themes;
    }
    
    if (requirements.target_countries.length > 0) {
      filters.country = requirements.target_countries[0];
    }

    return { query: query.trim(), filters };
  }

  // Build semantic query with business context
  buildSemanticQuery(requirements, brief) {
    const semanticTerms = this.buildSemanticTerms(requirements);
    
    const queryParts = [
      requirements.industry,
      ...semanticTerms.keywords.slice(0, 3),
      ...requirements.required_skills.slice(0, 3),
      ...requirements.preferred_themes.slice(0, 2),
      requirements.tone_requirements,
      brief.business_objective ? brief.business_objective.split(' ').slice(0, 3).join(' ') : '',
      brief.brand_name || ''
    ];

    return queryParts.filter(Boolean).join(' ');
  }

  // Enhanced scoring with industry bonuses
  async scoreCreativesEnhanced(creatives, requirements, brief) {
    return creatives.map(creative => {
      const baseScores = {
        skills: this.scoreSkillsMatch(creative, requirements),
        themes: this.scoreThemesMatch(creative, requirements),
        geographic: this.scoreGeographicMatch(creative, requirements),
        experience: this.scoreExperience(creative, requirements),
        availability: this.scoreAvailability(creative)
      };

      // Industry-specific bonuses
      const industryBonus = this.calculateIndustryBonus(creative, requirements, brief);
      
      // Apply bonuses to skills and themes
      const enhancedScores = {
        ...baseScores,
        skills: Math.min(baseScores.skills + industryBonus.skills, 1.0),
        themes: Math.min(baseScores.themes + industryBonus.themes, 1.0)
      };

      // Calculate weighted total score
      const totalScore = Object.entries(enhancedScores).reduce((total, [category, score]) => {
        return total + (score * this.weightings[category]);
      }, 0);

      return {
        ...creative,
        score: Math.round(totalScore * 100) / 100,
        scoring_breakdown: enhancedScores,
        match_reasons: this.generateMatchReasons(creative, requirements, enhancedScores)
      };
    });
  }

  // Calculate industry-specific bonuses
  calculateIndustryBonus(creative, requirements, brief) {
    const industry = requirements.industry.toLowerCase();
    const creativeSkills = [...(creative.skills || []), ...(creative.portfolio_tags || [])];
    const creativeThemes = creative.themes || [];
    
    let skillsBonus = 0;
    let themesBonus = 0;

    // Industry-specific skill bonuses
    const industrySkillBonuses = {
      'beverage': {
        'beverage_photography': 0.3,
        'food_photography': 0.2,
        'product_photography': 0.25,
        'commercial_photography': 0.2,
        'lifestyle_photography': 0.15
      },
      'food': {
        'food_photography': 0.3,
        'food_styling': 0.25,
        'culinary_branding': 0.2,
        'restaurant_branding': 0.2,
        'product_photography': 0.15
      },
      'fashion': {
        'fashion_photography': 0.3,
        'lifestyle_photography': 0.25,
        'commercial_photography': 0.2,
        'brand_photography': 0.2
      }
    };

    // Apply skill bonuses
    if (industrySkillBonuses[industry]) {
      Object.entries(industrySkillBonuses[industry]).forEach(([skill, bonus]) => {
        if (creativeSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))) {
          skillsBonus += bonus;
        }
      });
    }

    // Theme relevance bonus
    if (creativeThemes.some(theme => theme.toLowerCase().includes(industry))) {
      themesBonus += 0.2;
    }

    return {
      skills: Math.min(skillsBonus, 0.4), // Cap at 40% bonus
      themes: Math.min(themesBonus, 0.3)  // Cap at 30% bonus
    };
  }

  
  async extractKeywordsWithAI(brief) {
    try {
      if (!this.openai) {
        return { success: false, error: 'OpenAI not available' };
      }

      const prompt = `
        Analyze this marketing brief and extract the optimal search keywords and requirements for finding the perfect creative professionals:

        BRIEF DETAILS:
        - Brand: ${brief.brand_name || 'N/A'}
        - Campaign: ${brief.campaign_name || 'N/A'}
        - Industry: ${brief.brand_category || 'N/A'}
        - Objective: ${brief.business_objective || 'N/A'}
        - Tone: ${brief.tone_of_voice || 'N/A'}
        - Budget: ${brief.budget_range || 'N/A'}
            
        TASK: Extract the most relevant keywords that would help find creative professionals who can execute this campaign perfectly.
            
        Respond with valid JSON in this exact format:
        {
          "semantic_query": "Rich descriptive query for vector search (15-20 words max)",
          "required_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
          "themes": ["theme1", "theme2", "theme3"],
          "style_keywords": ["style1", "style2", "style3"],
          "priority_mediums": ["photo", "video", "design"],
          "target_countries": ["country1", "country2"],
          "industry": "industry_name",
          "creative_style": "style_description"
        }
            
        Focus on:
        - Specific creative skills needed (photography types, design skills, etc.)
        - Visual style and aesthetic requirements
        - Industry-specific expertise
        - Technical capabilities required
        - Cultural/regional knowledge needed`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert creative director who understands exactly what creative skills and expertise are needed for different types of marketing campaigns. Extract the most relevant and specific requirements that would help find the perfect creative professionals."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const aiResponse = completion.choices[0].message.content.trim();
      console.log('OpenAI Raw Response:', aiResponse);

      // Parse AI response
      const extracted = JSON.parse(aiResponse);

      // Build filters from AI extraction
      const filters = {};
      if (extracted.required_skills && extracted.required_skills.length > 0) {
        filters.skills = extracted.required_skills;
      }
      if (extracted.themes && extracted.themes.length > 0) {
        filters.themes = extracted.themes;
      }
      if (extracted.priority_mediums && extracted.priority_mediums.length > 0) {
        filters.mediums = extracted.priority_mediums;
      }
      if (extracted.target_countries && extracted.target_countries.length > 0) {
        filters.country = extracted.target_countries[0];
      }

      return {
        success: true,
        ...extracted,
        filters: filters,
        raw_response: aiResponse
      };

    } catch (error) {
      console.error('OpenAI keyword extraction error:', error.message);
      return { 
        success: false, 
        error: error.message,
        fallback_reason: 'AI extraction failed'
      };
    }
  }

  // Fallback method when OpenAI is not available
  async findCreativesForBriefFallback(brief, options) {
    // Use the previous optimized search as fallback
    const requirements = await this.extractEnhancedRequirements(brief);
    const searchConfig = this.buildOptimizedSearch(requirements, brief);
    
    const creatives = await creativesService.searchCreatives(
      searchConfig.query,
      searchConfig.filters,
      options.limit || 20
    );

    const scoredCreatives = await this.scoreCreativesEnhanced(creatives, requirements, brief);
    scoredCreatives.sort((a, b) => b.score - a.score);

    return {
      success: true,
      brief_id: brief.id,
      method: 'fallback',
      requirements: requirements,
      total_found: scoredCreatives.length,
      recommended_creatives: scoredCreatives.slice(0, options.limit || 10),
      matching_summary: this.generateMatchingSummary(scoredCreatives, requirements)
    };
  }

  // Enhanced scoring with AI insights
  async scoreCreativesWithAI(creatives, aiExtraction, brief) {
    return creatives.map(creative => {
      const baseScores = {
        skills: this.scoreSkillsMatch(creative, aiExtraction),
        themes: this.scoreThemesMatch(creative, aiExtraction),
        geographic: this.scoreGeographicMatch(creative, aiExtraction),
        experience: this.scoreExperience(creative, aiExtraction),
        availability: this.scoreAvailability(creative)
      };

      // AI-based style matching bonus
      const styleBonus = this.calculateStyleBonus(creative, aiExtraction);
      
      // Apply AI insights to scoring
      const enhancedScores = {
        ...baseScores,
        skills: Math.min(baseScores.skills + styleBonus.skills, 1.0),
        themes: Math.min(baseScores.themes + styleBonus.themes, 1.0)
      };

      const totalScore = Object.entries(enhancedScores).reduce((total, [category, score]) => {
        return total + (score * this.weightings[category]);
      }, 0);

      return {
        ...creative,
        score: Math.round(totalScore * 100) / 100,
        scoring_breakdown: enhancedScores,
        ai_style_bonus: styleBonus,
        match_reasons: this.generateMatchReasons(creative, aiExtraction, enhancedScores)
      };
    });
  }

  // Calculate style matching bonus based on AI insights
  calculateStyleBonus(creative, aiExtraction) {
    const creativeSkills = [...(creative.skills || []), ...(creative.portfolio_tags || [])];
    const creativeThemes = creative.themes || [];
    
    let skillsBonus = 0;
    let themesBonus = 0;

    // Check for AI-identified style keywords in creative's portfolio
    if (aiExtraction.style_keywords) {
      aiExtraction.style_keywords.forEach(styleKeyword => {
        const keyword = styleKeyword.toLowerCase();
        if (creativeSkills.some(skill => skill.toLowerCase().includes(keyword))) {
          skillsBonus += 0.15;
        }
        if (creativeThemes.some(theme => theme.toLowerCase().includes(keyword))) {
          themesBonus += 0.1;
        }
      });
    }

    // Bonus for matching creative style
    if (aiExtraction.creative_style) {
      const style = aiExtraction.creative_style.toLowerCase();
      if (creativeSkills.some(skill => skill.toLowerCase().includes(style))) {
        skillsBonus += 0.2;
      }
    }

    return {
      skills: Math.min(skillsBonus, 0.5),
      themes: Math.min(themesBonus, 0.3)
    };
  }
}

module.exports = new CreativeMatchingService();


