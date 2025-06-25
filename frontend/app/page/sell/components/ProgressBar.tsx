import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  return (
    <div>
      <div className="flex justify-between mb-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center ${index < currentStep ? 'text-blue-400' : 'text-gray-400'}`}
          >
            <div 
              className={`sell-glass-step-indicator
                ${index + 1 === currentStep ? 'active' : ''}
                ${index + 1 < currentStep ? 'completed' : ''}
                ${index + 1 > currentStep ? 'inactive' : ''}`}
            >
              {index + 1 < currentStep ? '✓' : index + 1}
            </div>
            <span className="text-xs mt-2">
              {index === 0 ? 'Basic Info' : 
               index === 1 ? 'Details' : 
               index === 2 ? 'Location' : 'Images & Amenities'}
            </span>
          </div>
        ))}
      </div>
      <div className="sell-glass-progress-bar">
        <div 
          className="sell-glass-progress-fill" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}