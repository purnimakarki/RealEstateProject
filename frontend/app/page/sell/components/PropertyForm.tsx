

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PropertyFormProps {
  currentStep: number;
  formData: {
    propertyType: string;
    apartmentType: string;
    title: string;
    description: string;
    price: string;
    bedrooms: string;
    bathrooms: string;
    area: string;
    floor: string;
    totalFloors: string;
    yearBuilt: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    amenities: string[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleAmenityToggle: (amenity: string) => void;
  validateField: (name: string, value: string) => boolean;
}

export default function PropertyForm({
  currentStep,
  formData,
  errors,
  touched,
  handleInputChange,
  handleBlur,
  handleAmenityToggle,
}: PropertyFormProps) {
  
  // Available apartment types
  const apartmentTypes = [
    'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4+ Bedroom',
    'Loft', 'Duplex', 'Penthouse'
  ];

  // Available amenities for apartments
  const availableAmenities = [
    'Swimming Pool', 'Gym', 'Elevator', 'Parking', 'Security System', 'Wifi',
    'Balcony', 'Air Conditioning', 'Heating', 'Laundry Room', 'Storage Room',
    'Pet Friendly', 'Furnished', 'Wheelchair Access', 'Concierge Service'
  ];

  const renderError = (fieldName: string) => {
    if (touched[fieldName] && errors[fieldName]) {
      return (
        <div className="text-red-500 text-sm mt-1 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  switch(currentStep) {
    case 1:
      return (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="apartmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Apartment Type*
              </label>
              <select
                id="apartmentType"
                name="apartmentType"
                value={formData.apartmentType}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-2 border ${touched.apartmentType && errors.apartmentType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900`}
              >
                <option value="">Select Apartment Type</option>
                {apartmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {renderError('apartmentType')}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Listing Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                placeholder="e.g. Modern Downtown Apartment"
                className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('title')}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                rows={4}
                placeholder="Describe your apartment in detail..."
                className={`w-full px-4 py-2 border ${touched.description && errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('description')}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD)*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                min="0"
                placeholder="e.g. 450000"
                className={`w-full px-4 py-2 border ${touched.price && errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('price')}
            </div>

            <div>
              <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                Year Built
              </label>
              <input
                type="number"
                id="yearBuilt"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
                placeholder="e.g. 2010"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      );
    
    case 2:
      return (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Apartment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms*
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                min="0"
                placeholder="e.g. 2"
                className={`w-full px-4 py-2 border ${touched.bedrooms && errors.bedrooms ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('bedrooms')}
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms*
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                min="0"
                step="0.5"
                placeholder="e.g. 1"
                className={`w-full px-4 py-2 border ${touched.bathrooms && errors.bathrooms ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('bathrooms')}
            </div>

            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                Area (sq ft)*
              </label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                min="0"
                placeholder="e.g. 1200"
                className={`w-full px-4 py-2 border ${touched.area && errors.area ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('area')}
            </div>

            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor Number
              </label>
              <input
                type="number"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g. 3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700 mb-1">
                Total Floors in Building
              </label>
              <input
                type="number"
                id="totalFloors"
                name="totalFloors"
                value={formData.totalFloors}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g. 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      );
    
    case 3:
      return (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                placeholder="e.g. 123 Main Street, Apt 4B"
                className={`w-full px-4 py-2 border ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('address')}
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City*
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                placeholder="e.g. San Francisco"
                className={`w-full px-4 py-2 border ${touched.city && errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('city')}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State/Province*
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                placeholder="e.g. California"
                className={`w-full px-4 py-2 border ${touched.state && errors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('state')}
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP/Postal Code*
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                placeholder="e.g. 94105"
                className={`w-full px-4 py-2 border ${touched.zipCode && errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
              />
              {renderError('zipCode')}
            </div>
          </div>
        </div>
      );
    
    case 4:
      return (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Amenities</h2>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Select Available Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableAmenities.map(amenity => (
                <div key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
}