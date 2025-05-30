import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  prevStep: () => void;
  nextStep: () => void;
  isSubmitting: boolean;
}

export default function FormNavigation({ 
  currentStep, 
  totalSteps, 
  prevStep, 
  nextStep, 
  isSubmitting 
}: FormNavigationProps) {
  return (
    <div className="flex justify-between mt-8">
      {currentStep > 1 ? (
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
            isSubmitting
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Property'}
        </button>
      )}
    </div>
  );
}