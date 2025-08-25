import axios, { AxiosResponse } from 'axios';
import { BriefData, CampaignPlan } from '../types/brief';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Brief API
export const briefApi = {
  create: async (briefData: BriefData): Promise<AxiosResponse<{
    success: boolean;
    brief_id: string;
    message: string;
  }>> => {
    return api.post('/briefs', briefData);
  },

  getById: async (id: string): Promise<AxiosResponse<{
    success: boolean;
    brief: BriefData & { id: string };
  }>> => {
    return api.get(`/briefs/${id}`);
  },

  validate: async (briefData: Partial<BriefData>): Promise<AxiosResponse<{
    success: boolean;
    is_valid: boolean;
    errors: string[];
  }>> => {
    return api.post('/briefs/validate', briefData);
  },

  getTemplate: async (): Promise<AxiosResponse<{
    success: boolean;
    template: any;
    examples: any;
    validation_rules: any;
  }>> => {
    return api.get('/briefs/schema/template');
  },

  generateCampaign: async (briefId: string, options?: {
    focus_areas?: string[];
    campaign_type?: string;
    innovation_level?: string;
  }): Promise<AxiosResponse<{
    success: boolean;
    brief_id: string;
    plan_id: string;
    campaign_plan: CampaignPlan;
    tokens_used: number;
    message: string;
  }>> => {
    return api.post(`/briefs/${briefId}/generate-campaign`, options || {});
  }
};

// Campaign API
export const campaignApi = {
  generateFromData: async (briefData: BriefData, options?: {
    focus_areas?: string[];
    campaign_type?: string;
    innovation_level?: string;
  }): Promise<AxiosResponse<{
    success: boolean;
    campaign_plan: CampaignPlan;
    tokens_used: number;
    message: string;
  }>> => {
    return api.post('/campaigns/generate', { brief_data: briefData, options });
  },

  getById: async (id: string): Promise<AxiosResponse<{
    success: boolean;
    campaign_plan: CampaignPlan & { id: string };
  }>> => {
    return api.get(`/campaigns/${id}`);
  },

  updateStatus: async (id: string, status: string, notes?: string): Promise<AxiosResponse<{
    success: boolean;
    message: string;
  }>> => {
    return api.put(`/campaigns/${id}/status`, { status, notes });
  },

  addFeedback: async (id: string, feedback: {
    feedback_type: 'client_feedback' | 'internal_review' | 'performance_data';
    feedback_text: string;
    rating?: number;
    created_by?: string;
  }): Promise<AxiosResponse<{
    success: boolean;
    feedback_id: string;
    message: string;
  }>> => {
    return api.post(`/campaigns/${id}/feedback`, feedback);
  }
};

// Creative Matching API
export const creativeApi = {
  findMatchingCreativesFromBrief: async (briefId: string, limit: number = 10): Promise<AxiosResponse<{
    success: boolean;
    brief_id: string;
    matching_summary: {
      requirements_extracted: {
        required_skills: string[];
        preferred_themes: string[];
        target_countries: string[];
        content_formats: string[];
        cultural_expertise: string[];
        tone_requirements: string;
        budget_level: string;
        industry: string;
      };
      total_found: number;
      top_match_score: number;
      average_match_score: number;
      strong_skill_matches: number;
      local_market_experts: number;
      available_now: number;
      search_quality: string;
    };
    recommended_creatives: Array<{
      id: number;
      score: number;
      creative: {
        id: string;
        name: string;
        country: string;
        city: string;
        skills: string[];
        mediums: string[];
        themes: string[];
        day_rate_band: string;
        portfolio_tags: string[];
        languages: string[];
        availability: string;
        past_clients: string[];
        rating: number;
        completed_projects_count: number;
        years_experience: number;
        specialty_level: string;
        response_time: string;
        travel_availability: string;
        min_project_duration: string;
      };
      scoring_breakdown: {
        skills: number;
        themes: number;
        geographic: number;
        experience: number;
        availability: number;
      };
      match_reasons: string[];
    }>;
  }>> => {
    return api.get(`/briefs/${briefId}/recommended-creatives?limit=${limit}`);
  },

  findMatchingCreativesFromCampaign: async (campaignId: string, limit: number = 10): Promise<AxiosResponse<{
    success: boolean;
    campaign_id: string;
    requirements: {
      required_skills: string[];
      preferred_themes: string[];
      target_countries: string[];
      content_formats: string[];
      cultural_expertise: string[];
      tone_requirements: string;
      budget_level: string;
      industry: string;
    };
    total_found: number;
    recommended_creatives: Array<{
      id: number;
      score: number;
      creative: {
        id: string;
        name: string;
        country: string;
        city: string;
        skills: string[];
        mediums: string[];
        themes: string[];
        day_rate_band: string;
        portfolio_tags: string[];
        languages: string[];
        availability: string;
        past_clients: string[];
        rating: number;
        completed_projects_count: number;
        years_experience: number;
        specialty_level: string;
        response_time: string;
        travel_availability: string;
        min_project_duration: string;
      };
      scoring_breakdown: {
        skills: number;
        themes: number;
        geographic: number;
        experience: number;
        availability: number;
      };
      match_reasons: string[];
    }>;
    matching_summary: {
      top_match_score: number;
      average_match_score: number;
      strong_skill_matches: number;
      local_market_experts: number;
      available_now: number;
      search_quality: string;
    };
  }>> => {
    return api.get(`/matching/campaigns/${campaignId}/creatives?limit=${limit}`);
  }
};

export default api;
