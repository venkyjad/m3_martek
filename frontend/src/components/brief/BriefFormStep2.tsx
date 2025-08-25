import React from 'react';
import MultiSelect from '../ui/MultiSelect';
import Select from '../ui/Select';
import { CHANNEL_OPTIONS, FORMAT_OPTIONS, TONE_OPTIONS } from '../../types/brief';
import { BriefData } from '../../types/brief';

interface BriefFormStep2Props {
  data: Partial<BriefData>;
  onChange: (data: Partial<BriefData>) => void;
  errors: Record<string, string>;
}

const BriefFormStep2: React.FC<BriefFormStep2Props> = ({ data, onChange, errors }) => {
  const handleArrayChange = (field: keyof BriefData, value: string[]) => {
    onChange({ ...data, [field]: value });
  };

  const handleChange = (field: keyof BriefData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const channelOptions = CHANNEL_OPTIONS.map(channel => ({
    value: channel,
    label: channel.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }));

  const formatOptions = FORMAT_OPTIONS.map(format => ({
    value: format,
    label: format.charAt(0).toUpperCase() + format.slice(1)
  }));

  const toneOptions = [
    { value: '', label: 'Select tone of voice' },
    ...TONE_OPTIONS.map(tone => ({
      value: tone,
      label: tone.charAt(0).toUpperCase() + tone.slice(1)
    }))
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Campaign Strategy</h2>
        <p className="text-gray-400">Define your campaign channels, formats, and brand voice</p>
      </div>

      <MultiSelect
        label="Primary Marketing Channels *"
        options={channelOptions}
        value={data.primary_channels || []}
        onChange={(value) => handleArrayChange('primary_channels', value)}
        error={errors.primary_channels}
        hint="Select the main channels where you want to run your campaign"
        placeholder="Choose marketing channels..."
        maxSelection={5}
      />

      <MultiSelect
        label="Content Formats *"
        options={formatOptions}
        value={data.formats || []}
        onChange={(value) => handleArrayChange('formats', value)}
        error={errors.formats}
        hint="What types of content do you need for your campaign?"
        placeholder="Select content formats..."
        maxSelection={4}
      />

      <Select
        label="Tone of Voice *"
        options={toneOptions}
        value={data.tone_of_voice || ''}
        onChange={(e) => handleChange('tone_of_voice', e.target.value)}
        error={errors.tone_of_voice}
        hint="How should your brand communicate with your audience?"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target Countries/Regions
          </label>
          <input
            type="text"
            placeholder="e.g., US, UK, Canada (comma-separated)"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            value={data.target_audience_countries?.join(', ') || ''}
            onChange={(e) => {
              const countries = e.target.value.split(',').map(c => c.trim()).filter(c => c);
              handleArrayChange('target_audience_countries', countries);
            }}
          />
          <p className="text-sm text-gray-400 mt-1">Enter countries separated by commas</p>
        </div>


      </div>
    </div>
  );
};

export default BriefFormStep2;

