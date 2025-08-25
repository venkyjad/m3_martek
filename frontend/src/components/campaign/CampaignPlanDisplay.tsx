import React from 'react';
import { 
  Target, 
  BarChart3,
  Lightbulb,
  Hash,
  Copy,
  UserCheck
} from 'lucide-react';
import { CampaignPlan } from '../../types/brief';

interface CampaignPlanDisplayProps {
  campaignPlan: CampaignPlan;
  onApproval?: (approved: boolean, feedback?: string) => void;
}



const CampaignPlanDisplay: React.FC<CampaignPlanDisplayProps> = ({ campaignPlan }) => {
  // Add null checks to prevent errors
  if (!campaignPlan) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
        <p className="text-gray-400">No campaign plan data available.</p>
      </div>
    );
  }

  const briefSummary = campaignPlan.brief_summary || {};
  const contentConcepts = campaignPlan.content_concepts || [];
  const contentPlan = campaignPlan.content_plan || {};
  const copyExamples = campaignPlan.copy_examples || {};
  const keywordsTags = campaignPlan.keywords_tags || {};
  const recommendedCreatives = campaignPlan.recommended_creatives || {};

  return (
    <div className="space-y-6">
      {/* Campaign Overview - Consolidated */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <Target className="w-5 h-5 text-primary-400 mr-3" />
          <h3 className="text-xl font-bold text-white">{briefSummary.campaign_title || 'Campaign Plan'}</h3>
        </div>
        
        <p className="text-gray-300 mb-6">{briefSummary.objective || 'Campaign objective will be defined.'}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {contentPlan.total_content_pieces || 0}
            </div>
            <div className="text-sm text-gray-300">Total Content Pieces</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {briefSummary.target_markets?.join(', ') || 'Global'}
            </div>
            <div className="text-sm text-gray-300">Target Markets</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {contentPlan.production_timeline || 'TBD'}
            </div>
            <div className="text-sm text-gray-300">Timeline</div>
          </div>
        </div>
      </div>

      {/* Key Content Ideas */}
      {contentConcepts.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-5 h-5 text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">Key Content Ideas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentConcepts.slice(0, 4).map((concept, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-1">{concept.concept}</h4>
                <p className="text-gray-300 text-sm">{concept.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Breakdown */}
      {(contentPlan.channels?.social_media || contentPlan.channels?.digital) && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">Content Breakdown</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Social Media */}
            {contentPlan.channels?.social_media && Object.entries(contentPlan.channels.social_media.formats).map(([format, details]) => (
              <div key={format} className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-primary-400">{details.count}</div>
                <div className="text-sm text-gray-300 capitalize">{format.replace('_', ' ')}</div>
              </div>
            ))}
            
            {/* Digital Ads */}
            {contentPlan.channels?.digital && Object.entries(contentPlan.channels.digital.formats).map(([format, details]) => (
              <div key={format} className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-primary-400">{details.count}</div>
                <div className="text-sm text-gray-300 capitalize">{format.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
          
          {/* Platforms */}
          <div className="mt-4">
            <p className="text-gray-300 text-sm mb-2">Platforms:</p>
            <div className="flex flex-wrap gap-2">
              {contentPlan.channels?.social_media?.platforms?.map((platform, index) => (
                <span key={`social-${index}`} className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm">
                  {platform}
                </span>
              ))}
              {contentPlan.channels?.digital?.platforms?.map((platform, index) => (
                <span key={`digital-${index}`} className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm">
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Key Messaging */}
      {(copyExamples.headlines?.length > 0 || copyExamples.taglines?.length > 0 || copyExamples.ctas?.length > 0) && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Copy className="w-5 h-5 text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">Key Messaging</h3>
          </div>
          
          <div className="space-y-4">
            {copyExamples.headlines && copyExamples.headlines.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Headlines</h4>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-white font-medium">"{copyExamples.headlines[0]}"</p>
                  {copyExamples.headlines.length > 1 && (
                    <p className="text-gray-300 text-sm mt-1">+{copyExamples.headlines.length - 1} more variations</p>
                  )}
                </div>
              </div>
            )}

            {copyExamples.taglines && copyExamples.taglines.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Main Tagline</h4>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-primary-300 italic">"{copyExamples.taglines[0]}"</p>
                </div>
              </div>
            )}

            {copyExamples.ctas && copyExamples.ctas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Call-to-Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {copyExamples.ctas.slice(0, 3).map((cta, index) => (
                    <span key={index} className="bg-primary-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      {cta}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Essential Hashtags */}
      {keywordsTags.primary_hashtags && keywordsTags.primary_hashtags.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Hash className="w-5 h-5 text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">Essential Hashtags</h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {keywordsTags.primary_hashtags.slice(0, 8).map((hashtag, index) => (
              <span key={index} className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm">
                {hashtag}
              </span>
            ))}
            {keywordsTags.primary_hashtags.length > 8 && (
              <span className="text-gray-400 text-sm px-3 py-1">
                +{keywordsTags.primary_hashtags.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Team Requirements */}
      {(recommendedCreatives.required_skills?.length > 0 || recommendedCreatives.team_size) && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <UserCheck className="w-5 h-5 text-primary-400 mr-3" />
            <h3 className="text-lg font-semibold text-white">Team Requirements</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedCreatives.required_skills && recommendedCreatives.required_skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendedCreatives.required_skills.slice(0, 6).map((skill, index) => (
                    <span key={index} className="bg-primary-500/20 text-primary-300 px-3 py-1 rounded-full text-sm capitalize">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recommendedCreatives.team_size && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Team Size</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(recommendedCreatives.team_size).slice(0, 4).map(([role, count]) => (
                    <div key={role} className="bg-gray-700 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-primary-400">{count}</div>
                      <div className="text-xs text-gray-300 capitalize">{role}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignPlanDisplay;