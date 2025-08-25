import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import ProgressIndicator from '../ui/ProgressIndicator';
import BriefFormStep1 from './BriefFormStep1';
import BriefFormStep2 from './BriefFormStep2';
import BriefFormStep3 from './BriefFormStep3';
import BriefFormStep4 from './BriefFormStep4';
import { BriefData } from '../../types/brief';
import { briefApi } from '../../services/api';

const STEPS = [
  {
    id: 'basic',
    title: 'Basic Info',
    description: 'Brand and objectives'
  },
  {
    id: 'strategy',
    title: 'Strategy',
    description: 'Channels and formats'
  },
  {
    id: 'budget',
    title: 'Budget',
    description: 'Budget and timeline'
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Final review'
  }
];

const BriefForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('basic');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<BriefData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDataChange = useCallback((data: Partial<BriefData>) => {
    setFormData(data);
    // Clear errors for changed fields
    const newErrors = { ...errors };
    Object.keys(data).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  }, [errors]);

  const validateStep = (stepId: string): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepId) {
      case 'basic':
        if (!formData.business_objective?.trim()) {
          newErrors.business_objective = 'Business objective is required';
        }
        if (!formData.brand_category?.trim()) {
          newErrors.brand_category = 'Brand category is required';
        }
        break;

      case 'strategy':
        if (!formData.primary_channels?.length) {
          newErrors.primary_channels = 'At least one marketing channel is required';
        }
        if (!formData.formats?.length) {
          newErrors.formats = 'At least one content format is required';
        }
        if (!formData.tone_of_voice?.trim()) {
          newErrors.tone_of_voice = 'Tone of voice is required';
        }
        break;

      case 'budget':
        if (!formData.budget_range?.trim()) {
          newErrors.budget_range = 'Budget range is required';
        }
        if (!formData.timeline_duration?.trim()) {
          newErrors.timeline_duration = 'Timeline duration is required';
        }
        break;

      case 'review':
        // Final validation - check all required fields
        if (!formData.business_objective?.trim()) {
          newErrors.business_objective = 'Business objective is required';
        }
        if (!formData.brand_category?.trim()) {
          newErrors.brand_category = 'Brand category is required';
        }
        if (!formData.primary_channels?.length) {
          newErrors.primary_channels = 'At least one marketing channel is required';
        }
        if (!formData.formats?.length) {
          newErrors.formats = 'At least one content format is required';
        }
        if (!formData.tone_of_voice?.trim()) {
          newErrors.tone_of_voice = 'Tone of voice is required';
        }
        if (!formData.budget_range?.trim()) {
          newErrors.budget_range = 'Budget range is required';
        }
        if (!formData.timeline_duration?.trim()) {
          newErrors.timeline_duration = 'Timeline duration is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }

      const currentIndex = STEPS.findIndex(step => step.id === currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1].id);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('review')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await briefApi.create(formData as BriefData);
      
      if (response.data.success) {
        // Navigate to campaign generation with the brief ID
        navigate(`/campaign/generate/${response.data.brief_id}`, {
          state: { briefData: formData }
        });
      }
    } catch (error: any) {
      console.error('Error creating brief:', error);
      setErrors({
        submit: error.response?.data?.error || 'Failed to create brief. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <BriefFormStep1
            data={formData}
            onChange={handleDataChange}
            errors={errors}
          />
        );
      case 'strategy':
        return (
          <BriefFormStep2
            data={formData}
            onChange={handleDataChange}
            errors={errors}
          />
        );
      case 'budget':
        return (
          <BriefFormStep3
            data={formData}
            onChange={handleDataChange}
            errors={errors}
          />
        );
      case 'review':
        return (
          <BriefFormStep4
            data={formData}
            onChange={handleDataChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);
  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Marketing Brief Builder</h1>
          <p className="text-gray-400">Define your campaign requirements to generate strategic plans and find creative talent</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        {/* Form Content */}
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
          {renderCurrentStep()}

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-xl">
              <p className="text-red-300">{errors.submit}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                className="flex items-center"
              >
                Generate Campaign Strategy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BriefForm;

