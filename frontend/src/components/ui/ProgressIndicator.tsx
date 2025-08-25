import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isConnected = index < steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                    isCompleted
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : isCurrent
                      ? 'border-primary-500 bg-gray-800 text-primary-500'
                      : 'border-gray-600 bg-gray-800 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-primary-400' : isCompleted ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {isConnected && (
                <div
                  className={`flex-1 h-px mx-4 transition-all duration-200 ${
                    index < currentStepIndex || completedSteps.includes(step.id)
                      ? 'bg-primary-500'
                      : 'bg-gray-600'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;

