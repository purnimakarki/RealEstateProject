import React from 'react';
import Image from 'next/image';

interface Property {
  id: number;
  propertyAddress: string;
  value: string;
  tokenAddress: string;
  propertyImageURLs: string[];
  status: 'pending' | 'approved' | 'rejected';
}

interface PropertyDetailsProps {
  property: Property;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  isProcessing: boolean;
  currentAction: { id: number, action: string } | null;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onApprove,
  onReject,
  isProcessing,
  currentAction
}) => {
  return (
    <div className="p-6 border-b border-gray-700">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          {property.propertyImageURLs && property.propertyImageURLs.length > 0 ? (
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={property.propertyImageURLs[0]}
                alt={property.propertyAddress}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">No image available</p>
            </div>
          )}
          
          {property.propertyImageURLs && property.propertyImageURLs.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {property.propertyImageURLs.slice(1, 5).map((url, index) => (
                <div key={index} className="relative h-16 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`Property image ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="w-full md:w-2/3">
          <h3 className="text-xl font-semibold text-white mb-2">
            Property #{property.id}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-sm">Address</p>
              <p className="text-white">{property.propertyAddress}</p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Value</p>
              <p className="text-white">${Number(property.value).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => onApprove(property.id)}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg font-medium ${
                isProcessing && currentAction?.id === property.id && currentAction?.action === 'approve'
                  ? 'bg-blue-800 text-blue-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isProcessing && currentAction?.id === property.id && currentAction?.action === 'approve' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Approve'
              )}
            </button>
            
            <button
              onClick={() => onReject(property.id)}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg font-medium ${
                isProcessing && currentAction?.id === property.id && currentAction?.action === 'reject'
                  ? 'bg-red-800 text-red-200 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isProcessing && currentAction?.id === property.id && currentAction?.action === 'reject' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Reject'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;