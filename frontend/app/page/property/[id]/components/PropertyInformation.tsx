import React from 'react';
import { Bed, Bath, Square, MapPin, Calendar } from 'lucide-react';

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
        <div>
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
    </div>
  );
};

export default PropertyInformation;