import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  prevStep: () => void;
  nextStep: () => void;
  isSubmitting: boolean;
  canProceed: boolean;
  isFormValid: boolean;
}

export default function FormNavigation({ 
  currentStep, 
  totalSteps, 
  prevStep, 
  nextStep, 
  isSubmitting, 
  canProceed, 
  isFormValid 
}: FormNavigationProps) {
  return (
    <div className="flex justify-between mt-8">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={prevStep}
          className="sell-glass-button sell-glass-button-secondary flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </button>
      ) : (
        <div></div>
      )}
      
      {currentStep < totalSteps ? (
        <button
          type="button"
          onClick={nextStep}
          className="sell-glass-button flex items-center"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="sell-glass-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Property'}
        </button>
      )}
    </div>
  );
}