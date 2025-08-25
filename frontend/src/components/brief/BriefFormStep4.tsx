import React from 'react';
import TextArea from '../ui/TextArea';
import { BriefData } from '../../types/brief';

interface BriefFormStep4Props {
  data: Partial<BriefData>;
  onChange: (data: Partial<BriefData>) => void;
  errors: Record<string, string>;
}

const BriefFormStep4: React.FC<BriefFormStep4Props> = ({ data, onChange, errors }) => {
  const handleChange = (field: keyof BriefData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Create a summary of the brief for review
  const getSummary = () => {
    return {
      'Brand & Campaign': {
        'Brand Name': data.brand_name || 'Not specified',
        'Campaign Name': data.campaign_name || 'Not specified',
        'Category': data.brand_category || 'Not specified',
        'Business Objective': data.business_objective || 'Not specified'
      },
      'Strategy': {
        'Channels': data.primary_channels?.join(', ') || 'Not specified',
        'Formats': data.formats?.join(', ') || 'Not specified',
        'Tone of Voice': data.tone_of_voice || 'Not specified',
        'Target Audience': data.target_audience_description || 'Not specified'
      },
      'Budget & Timeline': {
        'Budget Range': data.budget_range || 'Not specified',
        'Timeline Duration': data.timeline_duration || 'Not specified',
        'Budget Currency': data.budget_currency || 'USD'
      }
    };
  };

  const summary = getSummary();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Additional Requirements & Review</h2>
        <p className="text-gray-400">Add any specific requirements and review your brief</p>
      </div>



      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Brief Summary</h3>
        
        {Object.entries(summary).map(([section, items]) => (
          <div key={section} className="mb-6 last:mb-0">
            <h4 className="text-md font-medium text-primary-400 mb-3">{section}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(items).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-sm text-gray-400 mb-1">{key}</span>
                  <span className="text-gray-200 text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default BriefFormStep4;

