# Campaign Plan Generation API Documentation

## Overview
The Campaign Plan Generation API uses OpenAI to analyze marketing briefs and generate comprehensive, actionable campaign strategies. This AI-powered service bridges the gap between brief collection and creative execution.

## Prerequisites
- OpenAI API key configured in environment variables
- Marketing brief data (either existing or provided directly)

## Base URLs
```
http://localhost:3000/campaigns
http://localhost:3000/briefs/:id/generate-campaign (integrated workflow)
```

## Core Endpoints

### 1. Generate Campaign from Brief Data
**POST** `/campaigns/generate`

Generates a campaign plan directly from brief data without saving the brief.

**Request Body:**
```json
{
  "brief_data": {
    "business_objective": "Launch new luxury handbag collection",
    "brand_category": "fashion",
    "brand_name": "Luxe Atelier",
    "primary_channels": ["social_media", "digital"],
    "formats": ["photo", "video"],
    "tone_of_voice": "luxury",
    "budget_range": "10000-20000"
  },
  "options": {
    "focus_areas": ["luxury_positioning", "social_engagement"],
    "campaign_type": "product_launch",
    "innovation_level": "moderate"
  }
}
```

**Response:**
```json
{
  "success": true,
  "campaign_plan": {
    "campaign_overview": {
      "title": "Luxury Spring Collection Launch",
      "tagline": "Elegance Redefined",
      "core_message": "Introducing timeless luxury for the modern woman",
      "duration_weeks": 12,
      "phases": ["pre_launch", "launch", "amplification"]
    },
    "strategy": {
      "positioning": "Premium fashion brand targeting affluent millennials",
      "key_differentiators": ["Sustainable luxury", "Timeless design"],
      "success_metrics": ["Brand awareness lift", "Sales revenue"]
    },
    "creative_requirements": {
      "required_skills": ["luxury_photography", "fashion_styling"],
      "preferred_themes": ["luxury", "fashion", "lifestyle"],
      "team_composition": {"photographers": 2, "designers": 1}
    }
  },
  "tokens_used": 3500
}
```

### 2. Generate Campaign from Existing Brief
**POST** `/briefs/:briefId/generate-campaign`

Integrated workflow: generates and saves campaign plan from an existing brief.

**Request Body:**
```json
{
  "focus_areas": ["sustainability", "social_impact"],
  "campaign_type": "brand_awareness",
  "innovation_level": "high"
}
```

### 3. Get Campaign Plan
**GET** `/campaigns/:id`

Retrieves a complete campaign plan with all components.

### 4. Get Campaign Plans by Brief
**GET** `/briefs/:briefId/campaigns`

Lists all campaign plans generated for a specific brief.

### 5. Update Campaign Status
**PUT** `/campaigns/:id/status`

Updates campaign plan status and adds notes.

**Request Body:**
```json
{
  "status": "approved",
  "notes": "Client approved with minor revisions to timeline"
}
```

**Valid Statuses:**
- `generated` - AI-generated plan
- `reviewed` - Under internal review
- `approved` - Client approved
- `in_execution` - Campaign is running
- `completed` - Campaign finished
- `archived` - Historical record

### 6. Add Campaign Feedback
**POST** `/campaigns/:id/feedback`

Adds feedback for iterative improvements.

**Request Body:**
```json
{
  "feedback_type": "client_feedback",
  "feedback_text": "Love the sustainability focus, need more social media emphasis",
  "rating": 4,
  "created_by": "client@brand.com"
}
```

**Feedback Types:**
- `client_feedback` - Client comments
- `internal_review` - Team review
- `performance_data` - Campaign performance insights

## Campaign Plan Structure

### Generated Campaign Components:

1. **Campaign Overview**
   - Title and tagline
   - Core message
   - Duration and phases

2. **Strategy**
   - Brand positioning
   - Key differentiators
   - Competitive advantage
   - Success metrics

3. **Target Audience**
   - Primary/secondary segments
   - Detailed personas
   - Behavioral insights

4. **Channel Strategy**
   - Channel allocation and rationale
   - Content calendar
   - Platform optimization

5. **Creative Requirements**
   - Content pillars
   - Visual style guidelines
   - Content format breakdown
   - Messaging framework

6. **Timeline**
   - Pre-launch tasks
   - Launch activities
   - Post-launch optimization
   - Key milestones

7. **Budget Allocation**
   - Recommended total budget
   - Channel breakdown
   - Cost per channel

8. **Risk Assessment**
   - Potential risks
   - Mitigation strategies
   - Contingency plans

9. **Recommended Creatives**
   - Required skills
   - Preferred themes
   - Team composition
   - Content specializations

## Integration with Creative Matching

The campaign plan's `recommended_creatives` section directly maps to the creative search system:

```json
{
  "recommended_creatives": {
    "required_skills": ["luxury_photography", "fashion_styling"],
    "preferred_themes": ["luxury", "fashion", "lifestyle"],
    "content_specializations": ["product_photography", "lifestyle_photography"],
    "team_composition": {
      "photographers": 2,
      "designers": 1,
      "videographers": 1
    }
  }
}
```

Use this data to search for matching creatives:
```bash
curl "http://localhost:3000/creatives/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "luxury fashion photography",
    "filters": {
      "skills": ["luxury_photography", "fashion_styling"],
      "themes": ["luxury", "fashion"]
    }
  }'
```

## Example Workflows

### 1. Complete Brief-to-Campaign-to-Creative Flow
```bash
# 1. Create marketing brief
curl -X POST http://localhost:3000/briefs \
  -H "Content-Type: application/json" \
  -d '{ "business_objective": "...", "brand_category": "fashion", ... }'

# 2. Generate campaign plan
curl -X POST http://localhost:3000/briefs/{brief_id}/generate-campaign \
  -H "Content-Type: application/json" \
  -d '{ "focus_areas": ["luxury_positioning"] }'

# 3. Find matching creatives using campaign requirements
curl -X POST http://localhost:3000/creatives/search \
  -H "Content-Type: application/json" \
  -d '{ "query": "luxury fashion photography", "filters": {...} }'
```

### 2. Campaign Iteration and Approval
```bash
# Review campaign
curl -X PUT http://localhost:3000/campaigns/{plan_id}/status \
  -d '{ "status": "reviewed", "notes": "Initial review complete" }'

# Add client feedback
curl -X POST http://localhost:3000/campaigns/{plan_id}/feedback \
  -d '{ "feedback_type": "client_feedback", "feedback_text": "...", "rating": 4 }'

# Approve campaign
curl -X PUT http://localhost:3000/campaigns/{plan_id}/status \
  -d '{ "status": "approved" }'
```

## Configuration

### Environment Variables
```bash
# Required for campaign generation
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4  # Optional, defaults to gpt-4
```

### OpenAI Usage
- Model: GPT-4 (configurable)
- Average tokens per generation: 3000-4500
- Response format: Structured JSON
- Temperature: 0.7 (balanced creativity/consistency)

## Testing

Run the comprehensive test suite:
```bash
node test_campaign_generation.js
```

This tests:
- Campaign generation from briefs
- Database operations
- Status management
- Feedback system
- Error handling
- Integration workflows

## Error Handling

Common errors and solutions:

1. **OpenAI API key not configured**
   ```json
   { "error": "OpenAI API key not configured" }
   ```
   Solution: Set `OPENAI_API_KEY` in environment

2. **Brief not found**
   ```json
   { "error": "Brief not found" }
   ```
   Solution: Verify brief ID exists

3. **Invalid status**
   ```json
   { "error": "Invalid status. Must be one of: generated, reviewed, approved..." }
   ```
   Solution: Use valid status values

4. **OpenAI rate limit**
   ```json
   { "error": "Rate limit exceeded" }
   ```
   Solution: Implement retry logic or upgrade OpenAI plan

## Best Practices

1. **Campaign Generation**
   - Provide detailed briefs for better AI output
   - Use focus_areas to guide specific aspects
   - Review and iterate on generated plans

2. **Status Management**
   - Update status as campaigns progress
   - Add meaningful notes for team communication
   - Use feedback system for continuous improvement

3. **Integration**
   - Use recommended_creatives data for talent matching
   - Maintain brief-to-campaign relationships
   - Track campaign performance for future optimization

## Next Steps

1. **Creative Matching Integration**: Automatically find and rank creatives based on campaign requirements
2. **Performance Tracking**: Add campaign performance metrics and optimization
3. **Template System**: Create reusable campaign templates for common scenarios
4. **Approval Workflows**: Implement multi-stage approval processes
