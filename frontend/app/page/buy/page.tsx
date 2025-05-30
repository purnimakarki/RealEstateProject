'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { useWallet } from '../../components/hooks/usewallet';
import { useFavorites } from '../../components/hooks/useFavorites';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Filter, DollarSign, Home, Tag } from 'lucide-react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import contractAddress from '../../../contracts/contract-address.json';
import { PropertyResponse } from '../../../types/property';

export default function BuyPage() {
  const { account } = useWallet();
  const { toggleFavorite, isFavorite } = useFavorites();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [isWalletChecked, setIsWalletChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isWalletChecked && account === null) {
      router.push('/?walletRequired=true');
    }
  }, [isWalletChecked, account, router]);

  useEffect(() => {
    if (account !== undefined && account !== null) {
      setIsWalletChecked(true);
    }
  }, [account]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          provider
        );

        try {
          // Only destructure the fields that are actually returned by the contract
          const [
            propertyAddresses, 
            values, 
            tokenAddresses, 
            propertyImageURLs
          ] = await contract.getProperties();

          if (!propertyAddresses || propertyAddresses.length === 0) {
            console.warn('No properties found.');
            setProperties([]);
            setIsLoading(false);
            return;
          }

          const fetchedProperties = propertyAddresses.map((address: string, index: number) => ({
            propertyAddress: address,
            value: values[index],
            tokenAddress: tokenAddresses[index],
            propertyImageURLs: propertyImageURLs[index] || [],
            // Set default values for fields not returned by the contract
            bedrooms: 3,
            bathrooms: 2,
            area: 1500,
            yearBuilt: 2023,
            description: "A beautiful property available for investment through blockchain technology.",
            amenities: ["Parking", "Security", "Garden"]
          }));

          setProperties(fetchedProperties);
          setError(null);
        } catch (error) {
          console.error('Error fetching properties:', error);
          setError('Failed to load properties. Please try again later.');
          setProperties([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProperties();
  }, []);

  // Handle favorite toggle using the context
  const handleToggleFavorite = (id: number) => {
    toggleFavorite(id);
  };

  if (!account) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Browse Properties</h1>
            <p className="text-gray-400">Discover and invest in tokenized real estate properties</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {properties.length > 0 ? (
                properties.map((property, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-xl overflow-hidden transition duration-300 hover:shadow-xl group border border-gray-700"
                  >
                    <div className="relative h-64">
                      {property.propertyImageURLs?.length > 0 ? (
                        <Image
                          src={property.propertyImageURLs[0].startsWith('http') 
                            ? property.propertyImageURLs[0] 
                            : `https://gateway.pinata.cloud/ipfs/${property.propertyImageURLs[0]}`}
                          alt={property.propertyAddress || 'Property Image'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-700">
                          <Home className="h-12 w-12 opacity-50" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleFavorite(index);
                        }}
                        className="absolute top-4  p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
                      >
                        <Heart
                          className={`h-6 w-6 ${isFavorite(index)
                            ? 'fill-red-500 text-red-500'
                            : 'text-white'
                            }`}
                        />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-green-400 mr-1" />
                          <p className="text-white font-bold text-xl">
                            {Number(ethers.formatUnits(property.value, 18)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {property.propertyAddress
                              ? property.propertyAddress.length > 25
                                ? `${property.propertyAddress.slice(0, 25)}...`
                                : property.propertyAddress
                              : 'Unknown Address'}
                          </h3>
                          <div className="flex items-center mt-2 text-sm text-gray-400">
                            <Tag className="h-4 w-4 mr-1" />
                            <span>
                              Token: {property.tokenAddress
                                ? `${property.tokenAddress.slice(0, 6)}...${property.tokenAddress.slice(-4)}`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm text-gray-400 mt-4 pb-4 border-b border-gray-700">
                        <div className="flex items-center">
                          <span>{(property as any).bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center">
                          <span>{(property as any).bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center">
                          <span>{(property as any).area} sqft</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Link
                          href={`/page/property/${index}`}
                          className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Filter className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No properties found</h3>
                  <p className="text-gray-400 mb-4">Try again later or refresh the page</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}