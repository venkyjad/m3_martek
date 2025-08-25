import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 

  Users, 

  Loader2,
  FileText,
  Zap
} from 'lucide-react';
import Button from '../ui/Button';
import CreativeCard from './CreativeCard';
import { creativeApi } from '../../services/api';

interface BriefMatchingData {
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
}

interface CampaignMatchingData {
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
}

type MatchingData = BriefMatchingData | CampaignMatchingData;

const CreativeMatching: React.FC = () => {
  const { campaignId, briefId } = useParams<{ campaignId?: string; briefId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [matchingData, setMatchingData] = useState<MatchingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Determine if we're matching from brief or campaign
  const isFromBrief = location.pathname.includes('/creatives/brief/');
  const matchingId = briefId || campaignId;

  const fetchMatchingCreatives = useCallback(async () => {
    if (!matchingId) return;

    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (isFromBrief) {
        response = await creativeApi.findMatchingCreativesFromBrief(matchingId, 5);
      } else {
        response = await creativeApi.findMatchingCreativesFromCampaign(matchingId, 5);
      }
      
      if (response.data.success) {
        setMatchingData(response.data);
      } else {
        setError('Failed to find matching creatives');
      }
    } catch (error: any) {
      console.error('Error fetching matching creatives:', error);
      setError(error.response?.data?.error || 'Failed to fetch matching creatives');
    } finally {
      setIsLoading(false);
    }
  }, [matchingId, isFromBrief]);

  useEffect(() => {
    if (matchingId) {
      fetchMatchingCreatives();
    }
  }, [matchingId, fetchMatchingCreatives]);







  const getRequirements = () => {
    if (!matchingData) return null;
    
    if ('matching_summary' in matchingData && 'requirements_extracted' in matchingData.matching_summary) {
      // Brief-based matching
      return matchingData.matching_summary.requirements_extracted;
    } else if ('requirements' in matchingData) {
      // Campaign-based matching
      return matchingData.requirements;
    }
    return null;
  };

  const getMatchingSummary = () => {
    if (!matchingData) return null;
    
    if ('matching_summary' in matchingData && 'total_found' in matchingData.matching_summary) {
      // Brief-based matching
      return matchingData.matching_summary;
    } else if ('matching_summary' in matchingData && 'total_found' in matchingData) {
      // Campaign-based matching with total_found at top level
      const campaignData = matchingData as CampaignMatchingData;
      return {
        ...campaignData.matching_summary,
        total_found: campaignData.total_found || 0
      };
    }
    return null;
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Finding matching creatives...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-300 mb-2">Error Loading Creatives</h2>
            <p className="text-red-200 mb-4">{error}</p>
            <Button onClick={fetchMatchingCreatives}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!matchingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No matching data available</p>
        </div>
      </div>
    );
  }


  const requirements = getRequirements();
  const matchingSummary = getMatchingSummary();

  return (
    <div className="min-h-screen bg-gray-900 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">Matching Creatives</h1>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  isFromBrief 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {isFromBrief ? <FileText className="w-4 h-4 mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
                  {isFromBrief ? 'From Brief' : 'From Campaign'}
                </div>
              </div>
              <p className="text-gray-400">
                Found {matchingSummary?.total_found || 0} creatives for your {isFromBrief ? 'brief' : 'campaign'}
              </p>
            </div>
          </div>


        </div>

        {/* Requirements Summary */}
        {requirements && (
          <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              {isFromBrief ? 'Brief Requirements' : 'Campaign Requirements'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {requirements.required_skills?.map((skill, index) => (
                    <span key={index} className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm">
                      {skill.replace('_', ' ')}
                    </span>
                  )) || <span className="text-gray-500 text-sm">No specific skills required</span>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Target Markets</h3>
                <div className="flex flex-wrap gap-2">
                  {requirements.target_countries?.map((country, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                      {country}
                    </span>
                  )) || <span className="text-gray-500 text-sm">Global</span>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Industry & Tone</h3>
                <div className="space-y-1">
                  {requirements.industry && (
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-sm mr-2">
                      {requirements.industry}
                    </span>
                  )}
                  {requirements.tone_requirements && (
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-lg text-sm">
                      {requirements.tone_requirements}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Creative Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchingData?.recommended_creatives.map((item) => (
            <CreativeCard
              key={item.creative.id}
              creative={item.creative}
              score={item.score}
              scoring_breakdown={item.scoring_breakdown}
              match_reasons={item.match_reasons}
            />
          ))}
        </div>

        {matchingData?.recommended_creatives.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No creatives found</h3>
            <p className="text-gray-500">No matching creatives were found for your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeMatching;

