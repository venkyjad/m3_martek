import React from 'react';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Select from '../ui/Select';
import { BUDGET_OPTIONS, TIMELINE_OPTIONS } from '../../types/brief';
import { BriefData } from '../../types/brief';

interface BriefFormStep3Props {
  data: Partial<BriefData>;
  onChange: (data: Partial<BriefData>) => void;
  errors: Record<string, string>;
}

const BriefFormStep3: React.FC<BriefFormStep3Props> = ({ data, onChange, errors }) => {
  const handleChange = (field: keyof BriefData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  const handleBrandAssetChange = (field: string, value: string | string[]) => {
    const brandAssets = data.brand_assets || {};
    onChange({
      ...data,
      brand_assets: {
        ...brandAssets,
        [field]: value
      }
    });
  };

  const budgetOptions = [
    { value: '', label: 'Select budget range' },
    ...BUDGET_OPTIONS.map(budget => ({
      value: budget,
      label: `$${budget}`
    }))
  ];

  const timelineOptions = [
    { value: '', label: 'Select timeline duration' },
    ...TIMELINE_OPTIONS.map(timeline => ({
      value: timeline,
      label: timeline
    }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Budget & Timeline</h2>
        <p className="text-gray-400">Set your budget and campaign timeline</p>
      </div>

      <Select
        label="Budget Range *"
        options={budgetOptions}
        value={data.budget_range || ''}
        onChange={(e) => handleChange('budget_range', e.target.value)}
        error={errors.budget_range}
        hint="Select the budget range that fits your campaign"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Timeline Duration *"
          options={timelineOptions}
          value={data.timeline_duration || ''}
          onChange={(e) => handleChange('timeline_duration', e.target.value)}
          error={errors.timeline_duration}
          hint="How long should the campaign run?"
        />

        <Input
          label="Budget Currency"
          placeholder="USD"
          value={data.budget_currency || ''}
          onChange={(e) => handleChange('budget_currency', e.target.value)}
          hint="Currency for budget amounts (e.g., USD, EUR, AED)"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Brand Assets</h3>
        
        <div className="space-y-4">
          <Input
            label="Logo Description"
            placeholder="e.g., Minimalist blue logo with white text"
            value={data.brand_assets?.logo || ''}
            onChange={(e) => handleBrandAssetChange('logo', e.target.value)}
            hint="Describe your logo or provide a link"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Brand Colors
            </label>
            <input
              type="text"
              placeholder="e.g., #FF0000, #00FF00, #0000FF"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              value={data.brand_assets?.colors?.join(', ') || ''}
              onChange={(e) => {
                const colors = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                handleBrandAssetChange('colors', colors);
              }}
            />
            <p className="text-sm text-gray-400 mt-1">Enter hex colors separated by commas</p>
          </div>

          <TextArea
            label="Must-Have Assets"
            placeholder="Describe any critical brand assets that must be included in all content..."
            value={data.must_have_assets || ''}
            onChange={(e) => handleChange('must_have_assets', e.target.value)}
            hint="Logo placement requirements, specific imagery, etc."
            maxLength={200}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
};

export default BriefFormStep3;

