'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import { useFavorites } from '../hooks/useFavorites';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import contractAddress from '../../../contracts/contract-address.json';

interface Property {
  id: number;
  address: string;
  value: string;
  tokenAddress: string;
  imageURL: string;
}

export default function FavoriteProperties() {
  const { favorites } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProperties = async () => {
      if (favorites.length === 0) {
        setProperties([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(
            contractAddress.RealEstateTokenFactory,
            RealEstateTokenFactoryABI,
            provider
          );

          const [propertyAddresses, values, tokenAddresses, propertyImageURLs] = await contract.getProperties();

          // Filter properties that are in favorites
          const favoriteProperties = favorites.map(id => {
            if (id < propertyAddresses.length) {
              return {
                id,
                address: propertyAddresses[id],
                value: ethers.formatUnits(values[id], 18),
                tokenAddress: tokenAddresses[id],
                imageURL: propertyImageURLs[id]?.[0] || '/imageforLanding/house.jpg'
              };
            }
            return null;
          }).filter(Boolean) as Property[];

          setProperties(favoriteProperties);
        }
      } catch (error) {
        console.error('Error fetching favorite properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteProperties();
  }, [favorites]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-4">You haven&apos;t added any properties to your favorites yet.</p>
        <Link 
          href="/page/buy" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-gray-400">
        <p>Showing {properties.length} favorite {properties.length === 1 ? 'property' : 'properties'}</p>
      </div>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <div key={property.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <div className="relative h-48">
              <Image 
                src={property.imageURL.startsWith('http') 
                  ? property.imageURL 
                  : property.imageURL.startsWith('Qm') || property.imageURL.startsWith('baf')
                    ? `https://gateway.pinata.cloud/ipfs/${property.imageURL}`
                    : property.imageURL} 
                alt={property.address} 
                fill 
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white font-bold">${property.value}</p>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                {property.address.slice(0, 20)}...
              </h3>
              
              <Link 
                href={`/page/property/${property.id}`} 
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Property
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}