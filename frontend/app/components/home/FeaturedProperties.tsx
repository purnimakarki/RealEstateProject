'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bed, Bath, Square, Wallet, Lock, MapPin, Shield,  } from 'lucide-react';
import { useWallet } from '../hooks/usewallet';
import { useFavorites } from '../hooks/useFavorites';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import contractAddress from '../../../contracts/contract-address.json';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  apartmentType: string;
  amenities: string[];
  images: string[];
  yearBuilt: number;
  featured: boolean;
  documentURLs: string[];
  originalOwner: string;
}

export default function FeaturedProperties() {
  const { account, connectWallet, isConnecting } = useWallet();
  const {  toggleFavorite, isFavorite } = useFavorites();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const router = useRouter();

  // Fetch featured properties
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(
            contractAddress.RealEstateTokenFactory,
            RealEstateTokenFactoryABI,
            provider
          );

          const [
            propertyAddresses,
            values,
            ,
            propertyImageURLsList,
            documentURLs,
            originalOwners,
            titles,
            descriptions,
            propertyTypes,
            apartmentTypes,
            bedroomsList,
            bathroomsList,
            areas,
            yearsBuilt,
            cities,
            states,
            zipCodes,
            amenitiesList
          ] = await contract.getProperties();
          
          const propertyCount = Math.min(3, propertyAddresses ? propertyAddresses.length : 0);
          
          if (propertyCount === 0) {
            setFeaturedProperties([]);
            return;
          }

          const formattedProperties = Array.from({ length: propertyCount }).map((_, index) => {
            // Process image URLs
            let imageUrls = propertyImageURLsList?.[index];
            if (!imageUrls) {
              imageUrls = [];
            } else if (typeof imageUrls === 'string') {
              imageUrls = [imageUrls];
            } else if (!Array.isArray(imageUrls)) {
              imageUrls = [];
            }
            const processedImages = imageUrls.map((url: string) => {
              if (!url) return null;
              if (url.startsWith('http')) return url;
              if (url.startsWith('Qm') || url.startsWith('baf')) {
                return `https://gateway.pinata.cloud/ipfs/${url}`;
              }
              return url;
            }).filter(Boolean);

            // Ensure numeric values are properly converted
            const bedroomValue = bedroomsList?.[index];
            const bathroomValue = bathroomsList?.[index];
            const areaValue = areas?.[index];
            const yearValue = yearsBuilt?.[index];

            return {
              id: index,
              title: titles?.[index] || `Property ${index + 1}`,
              description: descriptions?.[index] || '',
              price: Number(ethers.formatUnits(values[index], 18)),
              bedrooms: bedroomValue ? Number(bedroomValue) : 0,
              bathrooms: bathroomValue ? Number(bathroomValue) : 0,
              area: areaValue ? Number(areaValue) : 0,
              address: propertyAddresses[index] || '',
              city: cities?.[index] || '',
              state: states?.[index] || '',
              zipCode: zipCodes?.[index] || '',
              propertyType: propertyTypes?.[index] || '',
              apartmentType: apartmentTypes?.[index] || '',
              amenities: amenitiesList?.[index] || [],
              images: processedImages.length > 0 ? processedImages : ['/imageforLanding/house.jpg'],
              yearBuilt: yearValue ? Number(yearValue) : 0,
              featured: true,
              documentURLs: documentURLs?.[index] || [],
              originalOwner: originalOwners?.[index] || ''
            };
          });
          
          console.log('Processed properties:', formattedProperties);
          setFeaturedProperties(formattedProperties);
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
        setFeaturedProperties([]);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle property click - redirect to details or prompt wallet connection
  const handlePropertyClick = (e: React.MouseEvent, propertyId: number) => {
    e.preventDefault();
    
    if (!account) {
      alert('Please connect your wallet to view property details');
    } else {
      router.push(`/page/property/${propertyId}`);
    }
  };

  return (
    <div className="py-24 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100 rounded-full filter blur-3xl opacity-30 -mt-24 -mr-24"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-100 rounded-full filter blur-3xl opacity-30 -mb-24 -ml-24"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Exclusive Selection</span>
          <h2 className="mt-3 text-4xl font-bold text-gray-900">Featured Properties</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto my-6"></div>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our handpicked selection of premium properties, each verified and secured with blockchain technology
          </p>
        </div>
        
        <div className="mt-16 grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Ensure featuredProperties is an array before calling .map() */}
          {Array.isArray(featuredProperties) && featuredProperties.length > 0 ? (
            featuredProperties.map((property) => (
              <div 
                key={property.id} 
                className="group bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl border border-gray-200 hover:border-blue-300 transform hover:-translate-y-2"
              >
                <div className="relative h-72">
                  <Image 
                    src={property.images[0] || "/imageforLanding/house.jpg"} 
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(property.id);
                    }}
                    className="absolute top-4  p-3 bg-white/90 rounded-full hover:bg-white transition-colors z-10 shadow-md btn-press-effect"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isFavorite(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                      }`}
                    />
                  </button>
                  {property.featured && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 shadow-md flex items-center">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      Verified
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <p className="text-white font-bold text-2xl">{formatPrice(property.price)}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{property.title}</h3>
                      <div className="flex items-center mt-1 text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <p className="text-gray-500 text-sm line-clamp-1">{[property.address, property.city, property.state, property.zipCode].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {property.propertyType && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium mb-1">{property.propertyType}</span>}
                      {property.apartmentType && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{property.apartmentType}</span>}
                    </div>
                  </div>
                  {property.description && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{property.description}</p>}
                  <div className="flex justify-between text-sm text-gray-600 mt-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{property.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{property.bathrooms} Baths</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{property.area} sqft</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {account ? (
                      <Link href={`/page/property/${property.id}`} className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium btn-press-effect btn-ripple">
                        View Details
                      </Link>
                    ) : (
                      <button 
                        onClick={(e) => handlePropertyClick(e, property.id)}
                        className="flex w-full text-center px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors items-center justify-center font-medium btn-press-effect btn-ripple"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Connect to View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No properties available to display.</p>
          )}
        </div>
        
        <div className="mt-16 text-center">
          {account ? (
            <Link href="/page/buy" className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-lg hover:shadow-xl btn-press-effect btn-ripple">
              View All Properties
            </Link>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-md ">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl text-black font-semibold">Unlock Premium Properties</h3>
              <p className="text-black">Connect your wallet to view all available properties and unlock the full potential of our blockchain-powered platform</p>
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md btn-press-effect btn-ripple"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}