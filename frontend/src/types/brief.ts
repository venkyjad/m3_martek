export interface BriefData {
  business_objective: string;
  brand_category: string;
  brand_name?: string;
  campaign_name?: string;
  primary_channels: string[];
  formats: string[];
  tone_of_voice: string;
  target_audience_countries?: string[];
  target_audience_description?: string;
  timeline_duration: string;
  budget_range: string;
  budget_currency?: string;
  brand_assets?: {
    logo?: string;
    colors?: string[];
    fonts?: string[];
    guidelines?: string;
    references?: string[];
  };
  must_have_assets?: string;
  requirements?: Array<{
    type: string;
    value: string;
  }>;
}

export interface CampaignPlan {
  brief_summary: {
    campaign_title: string;
    objective: string;
    target_markets: string[];
    cultural_considerations: string[];
  };
  content_concepts: Array<{
    concept: string;
    rationale: string;
  }>;
  content_plan: {
    channels: {
      social_media?: {
        platforms: string[];
        formats: Record<string, {
          count: number;
          purpose: string;
        }>;
      };
      digital?: {
        platforms: string[];
        formats: Record<string, {
          count: number;
          purpose: string;
        }>;
      };
    };
    total_content_pieces: number;
    production_timeline: string;
  };
  copy_examples: {
    headlines: string[];
    ctas: string[];
    taglines: string[];
    cultural_adaptations: Record<string, string>;
  };
  keywords_tags: {
    primary_hashtags: string[];
    secondary_hashtags: string[];
    seo_keywords: string[];
    cultural_tags: Record<string, string[]>;
  };
  recommended_creatives: {
    required_skills: string[];
    cultural_expertise: string[];
    team_size: Record<string, number>;
    local_talent_needed: string[];
  };
  metadata: {
    generated_at: string;
    model_used: string;
    brief_id: string;
    version: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export const TONE_OPTIONS = [
  'professional',
  'casual', 
  'playful',
  'luxury',
  'edgy',
  'friendly',
  'authoritative',
  'creative'
];

export const BUDGET_OPTIONS = [
  '0-5000',
  '5000-10000',
  '10000-20000',
  '20000+'
];

export const TIMELINE_OPTIONS = [
  '1 week',
  '2 weeks',
  '3weeks+'
];

export const FORMAT_OPTIONS = [
  'photo',
  'video',
  'design',
  'animation',
  'audio',
  'interactive'
];

export const CHANNEL_OPTIONS = [
  'social_media',
  'tv',
  'digital',
  'print',
  'outdoor',
  'radio',
  'influencer',
  'email',
  'events'
];

export const BRAND_CATEGORIES = [
  'fashion',
  'technology',
  'food',
  'automotive',
  'healthcare',
  'finance',
  'travel',
  'entertainment',
  'education',
  'retail'
];
