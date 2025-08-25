# Marketing Brief API Documentation

## Overview
The Marketing Brief API allows you to collect, store, and manage structured marketing briefs for campaign planning. This API captures all essential information needed to generate campaign plans and match relevant creative talent.

## Base URL
```
http://localhost:3000/briefs
```

## Endpoints

### 1. Create Brief
**POST** `/briefs`

Creates a new marketing brief.

**Request Body:**
```json
{
  "business_objective": "Launch new luxury handbag collection targeting affluent millennials",
  "brand_category": "fashion",
  "brand_name": "Luxe Atelier",
  "campaign_name": "Spring Luxury Collection 2024",
  "primary_channels": ["social_media", "digital", "print"],
  "formats": ["photo", "video"],
  "tone_of_voice": "luxury",
  "target_audience_countries": ["US", "UK", "UAE"],
  "target_audience_description": "Affluent millennials aged 25-40",
  "timeline_duration": "3weeks+",
  "budget_range": "10000-20000",
  "brand_assets": {
    "colors": ["#000000", "#C9A96E"],
    "logo": "Minimalist gold logo"
  },
  "must_have_assets": "Logo must be prominently displayed"
}
```

### 2. Get Brief
**GET** `/briefs/{id}`

Retrieves a specific brief by ID.

### 3. List Briefs
**GET** `/briefs`

Lists all briefs with optional filtering.

**Query Parameters:**
- `status` - Filter by status (draft, submitted, in_review, approved, completed)
- `brand_category` - Filter by brand category
- `budget_range` - Filter by budget range (0-5000, 5000-10000, 10000-20000, 20000+)
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

### 4. Update Brief
**PUT** `/briefs/{id}`

Updates an existing brief.

### 5. Delete Brief
**DELETE** `/briefs/{id}`

Deletes a brief.

### 6. Validate Brief
**POST** `/briefs/validate`

Validates brief data without saving.

### 7. Get Template
**GET** `/briefs/schema/template`

Returns the brief template with field descriptions and examples.

### 8. Get Statistics
**GET** `/briefs/stats/overview`

Returns brief statistics and counts.

## Required Fields

- `business_objective` (string) - Main business goal
- `brand_category` (string) - Industry/category
- `primary_channels` (array) - Marketing channels
- `formats` (array) - Content formats needed
- `tone_of_voice` (string) - Brand voice
- `timeline_duration` (string) - Campaign duration
- `budget_range` (string) - Budget range

## Field Options

### Tone of Voice
- `professional`
- `casual`
- `playful`
- `luxury`
- `edgy`
- `friendly`
- `authoritative`
- `creative`

### Budget Ranges
- `0-5000`
- `5000-10000`
- `10000-20000`
- `20000+`

### Timeline Duration
- `1 week`
- `2 weeks`
- `3weeks+`

### Formats
- `photo`
- `video`
- `design`
- `animation`
- `audio`
- `interactive`

### Channels
- `social_media`
- `tv`
- `digital`
- `print`
- `outdoor`
- `radio`
- `influencer`
- `email`
- `events`

## Example Usage

### Create a Fashion Brief
```bash
curl -X POST http://localhost:3000/briefs \
  -H "Content-Type: application/json" \
  -d '{
    "business_objective": "Launch new luxury handbag collection",
    "brand_category": "fashion",
    "primary_channels": ["social_media", "digital"],
    "formats": ["photo", "video"],
    "tone_of_voice": "luxury",
    "timeline_duration": "3weeks+",
    "budget_range": "10000-20000"
  }'
```

### Get All Fashion Briefs
```bash
curl "http://localhost:3000/briefs?brand_category=fashion&budget_range=10000-20000"
```

### Validate Brief Data
```bash
curl -X POST http://localhost:3000/briefs/validate \
  -H "Content-Type: application/json" \
  -d '{"business_objective": "Test campaign"}'
```

## Testing

Run the comprehensive test suite:
```bash
node test_briefs_api.js
```

This will test all endpoints and validate the API functionality.

## Integration with Creative Matching

The brief data structure is designed to integrate seamlessly with the creative matching system:

- `formats` maps to creative `mediums`
- `brand_category` and business context help filter relevant creatives
- `target_audience_countries` matches creative `country` data
- `budget_range` aligns with creative `day_rate_band`
- Custom `requirements` can specify needed skills, themes, or other criteria

## Next Steps

1. **Campaign Plan Generation**: Use brief data with OpenAI to generate campaign strategies
2. **Creative Matching**: Automatically find and rank relevant creatives based on brief requirements
3. **Workflow Integration**: Connect briefs to campaign execution and creative assignment
