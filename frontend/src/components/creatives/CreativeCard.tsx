import React from 'react';
import {
  Star,
  CheckCircle
} from 'lucide-react';

interface Creative {
  id: string;
  name: string;
  city: string;
  country: string;
  skills: string[];
  themes: string[];
  mediums: string[];
  years_experience: number;
  specialty_level: string;
  day_rate_band: string;
  rating: number;
  completed_projects_count: number;
  availability: string;
  languages: string[];
  past_clients: string[];
  response_time: string;
  travel_availability: string;
  min_project_duration: string;
}

interface CreativeCardProps {
  creative: Creative;
  score: number;
  scoring_breakdown: {
    skills: number;
    themes: number;
    geographic: number;
    experience: number;
    availability: number;
  };
  match_reasons: string[];
}

const CreativeCard: React.FC<CreativeCardProps> = ({
  creative,
  score,
  scoring_breakdown,
  match_reasons
}) => {

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-primary-500/50 transition-all duration-200 relative">
      {/* Match Score - Top Right */}
      <div className="absolute top-4 right-4 text-right">
        <div className="text-2xl font-bold text-primary-500">
          {Math.round(score * 100)}
        </div>
        <div className="text-xs text-gray-400">Match Score</div>
      </div>

      {/* Name and Location */}
      <div className="mb-4 pr-16">
        <h3 className="text-xl font-bold text-white mb-1">{creative.name}</h3>
        <div className="text-gray-400 text-sm">
          {creative.city}, {creative.country}
        </div>
      </div>

      {/* Formats */}
      <div className="mb-4">
        <div className="text-white font-medium mb-2">
          Formats: {creative.mediums.slice(0, 2).join(', ')}
        </div>
      </div>

      {/* Skills/Themes as colored tags */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {creative.themes.slice(0, 4).map((theme, index) => (
            <span 
              key={index} 
              className="bg-gray-700 text-primary-500 px-3 py-1 rounded text-sm font-medium"
            >
              {theme.replace('-', ' ')}
            </span>
          ))}
          {creative.skills.slice(0, 2).map((skill, index) => (
            <span 
              key={index} 
              className="bg-gray-700 text-primary-500 px-3 py-1 rounded text-sm font-medium"
            >
              {skill.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Rating and Projects - Bottom */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-primary-500 mr-1 fill-current" />
          <span className="text-white font-medium">{creative.rating}</span>
          <span className="text-gray-400 ml-2">
            <CheckCircle className="w-4 h-4 text-green-400 inline mr-1" />
            {creative.completed_projects_count} projects
          </span>
        </div>
      </div>
    </div>
  );
};

export default CreativeCard;