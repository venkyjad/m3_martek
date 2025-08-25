import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { briefApi } from '../../services/api';
import { BriefData, CampaignPlan } from '../../types/brief';
import CampaignPlanDisplay from './CampaignPlanDisplay';

const CampaignGeneration: React.FC = () => {
  const { briefId } = useParams<{ briefId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaignPlan, setCampaignPlan] = useState<CampaignPlan | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [generationOptions, setGenerationOptions] = useState({
    focus_areas: [] as string[],
    campaign_type: 'brand_awareness',
    innovation_level: 'moderate'
  });

  // Get brief data from location state or fetch from API
  useEffect(() => {
    const stateData = location.state?.briefData;
    if (stateData) {
      setBriefData(stateData);
    } else if (briefId) {
      // Fetch brief data from API
      const fetchBrief = async () => {
        try {
          const response = await briefApi.getById(briefId);
          if (response.data.success) {
            setBriefData(response.data.brief);
          }
        } catch (error) {
          console.error('Error fetching brief:', error);
          setError('Failed to load brief data');
        }
      };
      fetchBrief();
    }
  }, [briefId, location.state]);

  // Auto-generate campaign plan when component loads
  useEffect(() => {
    if (briefData && briefId && !campaignPlan && !isGenerating) {
      generateCampaign();
    }
  }, [briefData, briefId]);

  const generateCampaign = async () => {
    if (!briefId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await briefApi.generateCampaign(briefId, generationOptions);
      
      console.log('Campaign generation response:', response.data);
      
      if (response.data.success) {
        setCampaignPlan(response.data.campaign_plan);
        setPlanId(response.data.plan_id);
      } else {
        setError('Failed to generate campaign plan');
      }
    } catch (error: any) {
      console.error('Error generating campaign:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to generate campaign plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateCampaign = () => {
    setCampaignPlan(null);
    setPlanId(null);
    generateCampaign();
  };

  const handleApprovalSubmit = async (approved: boolean, feedback?: string) => {
    if (!planId) return;

    try {
      // Update campaign status
      // await campaignApi.updateStatus(planId, approved ? 'approved' : 'reviewed', feedback);
      
      // For now, just show success message
      if (approved) {
        alert('Campaign plan approved! You can now proceed with execution.');
      } else {
        alert('Feedback submitted. The campaign plan will be reviewed and updated.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  if (!briefData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading brief data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {briefData.campaign_name || briefData.brand_name || 'Campaign Plan'}
              </h1>
              <p className="text-gray-400">
                {briefData.brand_category && `${briefData.brand_category} • `}
                ${briefData.budget_range} budget
              </p>
            </div>
          </div>

          {campaignPlan && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRegenerateCampaign}
                disabled={isGenerating}
              >
                Regenerate Plan
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  // Navigate to creative matching using briefId (direct from brief)
                  if (briefId) {
                    navigate(`/creatives/brief/${briefId}`);
                  } else {
                    alert('Brief ID not available');
                  }
                }}
                disabled={!briefId}
              >
                Find Creative Talent
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  // Export functionality
                  const dataStr = JSON.stringify(campaignPlan, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `campaign-plan-${Date.now()}.json`;
                  link.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Plan
              </Button>
            </div>
          )}
        </div>

        {/* Brief Summary */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Marketing Brief Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Objective</h3>
              <p className="text-gray-200 text-sm">{briefData.business_objective}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Channels</h3>
              <p className="text-gray-200 text-sm">{briefData.primary_channels?.join(', ')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Formats</h3>
              <p className="text-gray-200 text-sm">{briefData.formats?.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Campaign Generation Status */}
        {isGenerating && (
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Generating Your Campaign Plan</h2>
            <p className="text-gray-400">
              Our AI is analyzing your brief and creating a comprehensive campaign strategy...
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-300 mb-2">Generation Failed</h2>
            <p className="text-red-200 mb-4">{error}</p>
            <Button onClick={handleRegenerateCampaign}>
              Try Again
            </Button>
          </div>
        )}

        {/* Campaign Plan Display */}
        {campaignPlan && !isGenerating && (
          <CampaignPlanDisplay 
            campaignPlan={campaignPlan}
            onApproval={handleApprovalSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default CampaignGeneration;
