import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SuccessMessageProps {
  resetForm: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ resetForm }) => {
  const router = useRouter();
  
  const handleListAnotherProperty = () => {
    // First reset the form
    resetForm();
    
    // Then refresh the current page to show the form again
    router.refresh();
    
    // Alternatively, you could navigate to the sell page
    // router.push('/page/sell');
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <CheckCircle size={64} className="text-green-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Submitted Successfully!</h2>
      
      <p className="text-gray-600 mb-6">
        Your property has been submitted for approval. An administrator will review your listing shortly.
        Once approved, your property will be tokenized and available for investment.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* <Link href="/page/admin" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Go to Admin Page
        </Link> */}
        
        <button
          onClick={handleListAnotherProperty}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          List Another Property
        </button>
      </div>
    </div>
  );
};

export default SuccessMessage;