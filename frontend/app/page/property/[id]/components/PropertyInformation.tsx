import React from 'react';
import { Bed, Bath, Square, MapPin, Calendar, FileText } from 'lucide-react';

interface PropertyInformationProps {
  property: any;
}

const PropertyInformation: React.FC<PropertyInformationProps> = ({ property }) => {
  if (!property) return null;
  
  return (
    <div className="mb-8 text-white">
      <h2 className="text-xl font-semibold mb-4">Property Details</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Bed size={20} className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Bedrooms</p>
            <p className="font-medium">{property.bedrooms}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Bath size={20} className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Bathrooms</p>
            <p className="font-medium">{property.bathrooms}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Square size={20} className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Area</p>
            <p className="font-medium">{property.area} sq ft</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Year Built</p>
            <p className="font-medium">{property.yearBuilt}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Description</h3>
        <p className="text-white">{property.description}</p>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Location</h3>
        <div className="flex items-start gap-2">
          <MapPin size={20} className="text-blue-600 mt-1" />
          <p className="text-white">
            {property.address}, {property.city}, {property.state} {property.zipCode}
          </p>
        </div>
      </div>
      
      {property.amenities && property.amenities.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {property.amenities.map((amenity: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {property.documentURLs && property.documentURLs.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Documents</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {property.documentURLs.map((url: string, index: number) => {
              const segments = url.split('/');
              const lastSegment = segments.pop() || 'document';
              const decodedSegment = decodeURIComponent(lastSegment);
              const fileName = decodedSegment.split('?')[0];
              const displayName = fileName.length > 16 ? fileName.slice(0, 8) + '...' + fileName.slice(-8) : fileName;
              const ipfsUrl = url.startsWith('http') ? url : `https://gateway.pinata.cloud/ipfs/${url}`;
              return (
                <div
                  key={index}
                  className="flex items-center bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow group"
                >
                  <FileText className="h-8 w-8 text-blue-400 mr-4 group-hover:text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 font-medium hover:underline break-all truncate block"
                      title={fileName}
                    >
                      {displayName}
                    </a>
                    <div className="text-xs text-gray-400 mt-1">Document</div>
                  </div>
                  <a
                    href={ipfsUrl}
                    download
                    className="ml-4 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    title="Download"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6-6m6 6l6-6" />
                    </svg>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyInformation;