import React from 'react';
import { Heart } from 'lucide-react';

interface PropertyHeaderProps {
  property: any;
  isFavorite: boolean;
  toggleFavorite: () => void;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ 
  property, 
  isFavorite, 
  toggleFavorite 
}) => {
  if (!property) return null;
  
  return (
    <div className="mb-6 bg-gradient-to-r from-gray-900 to-black p-6 rounded-lg border border-gray-800">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">{property.title}</h1>
        <button 
          onClick={toggleFavorite}
          className="p-2 rounded-full hover:bg-gray-800 transition-all duration-300"
        >
          <Heart 
            size={24} 
            fill={isFavorite ? "#FF6B6B" : "none"} 
            color={isFavorite ? "#FF6B6B" : "white"} 
          />
        </button>
      </div>
      <p className="text-gray-400 mt-2">{property.address}, {property.city}, {property.state}</p>
      <div className="mt-2 text-2xl font-semibold text-blue-400">
        ${property.price.toLocaleString()}
      </div>
    </div>
  );
};

export default PropertyHeader;