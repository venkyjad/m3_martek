import React from 'react';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Select from '../ui/Select';
import { BRAND_CATEGORIES } from '../../types/brief';
import { BriefData } from '../../types/brief';

interface BriefFormStep1Props {
  data: Partial<BriefData>;
  onChange: (data: Partial<BriefData>) => void;
  errors: Record<string, string>;
}

const BriefFormStep1: React.FC<BriefFormStep1Props> = ({ data, onChange, errors }) => {
  const handleChange = (field: keyof BriefData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const brandCategoryOptions = [
    { value: '', label: 'Select a category' },
    ...BRAND_CATEGORIES.map(category => ({
      value: category,
      label: category.charAt(0).toUpperCase() + category.slice(1)
    }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Basic Information</h2>
        <p className="text-gray-400">Tell us about your brand and campaign objectives</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Brand Name"
          placeholder="e.g., Nike, Apple, Tesla"
          value={data.brand_name || ''}
          onChange={(e) => handleChange('brand_name', e.target.value)}
          error={errors.brand_name}
        />

        <Input
          label="Campaign Name"
          placeholder="e.g., Spring Collection 2024"
          value={data.campaign_name || ''}
          onChange={(e) => handleChange('campaign_name', e.target.value)}
          error={errors.campaign_name}
        />
      </div>

      <Select
        label="Brand Category *"
        options={brandCategoryOptions}
        value={data.brand_category || ''}
        onChange={(e) => handleChange('brand_category', e.target.value)}
        error={errors.brand_category}
        hint="Choose the industry that best describes your brand"
      />

      <TextArea
        label="Business Objective *"
        placeholder="Describe your main business goal for this campaign (e.g., 'Increase brand awareness for our new sustainable fashion line among millennials and drive 25% increase in online sales')"
        value={data.business_objective || ''}
        onChange={(e) => handleChange('business_objective', e.target.value)}
        error={errors.business_objective}
        hint="Be specific about what you want to achieve"
        maxLength={500}
        rows={4}
      />

      <TextArea
        label="Target Audience Description"
        placeholder="Describe your ideal customers (e.g., 'Tech-savvy millennials aged 25-40 with disposable income who value sustainability and premium quality')"
        value={data.target_audience_description || ''}
        onChange={(e) => handleChange('target_audience_description', e.target.value)}
        error={errors.target_audience_description}
        hint="The more detailed, the better we can tailor your campaign"
        maxLength={300}
        rows={3}
      />
    </div>
  );
};

export default BriefFormStep1;

