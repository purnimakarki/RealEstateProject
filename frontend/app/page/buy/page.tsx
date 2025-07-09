'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { useWallet } from '../../components/hooks/usewallet';
import { useFavorites } from '../../components/hooks/useFavorites';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Filter, Home, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import contractAddress from '../../../contracts/contract-address.json';
import { PropertyResponse } from '../../../types/property';

export default function BuyPage() {
  // All hooks at the top, before any conditional return
  const { account } = useWallet();
  const { toggleFavorite, isFavorite } = useFavorites();
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [isWalletChecked, setIsWalletChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedApartmentType, setSelectedApartmentType] = useState('');
  // Unique values for dropdowns
  const locations = Array.from(new Set(properties.map(p => p.city).filter(Boolean)));
  const apartmentTypes = Array.from(new Set(properties.map(p => p.apartmentType).filter(Boolean)));
  // Filtered properties
  const filteredProperties = properties.filter(p =>
    (selectedLocation ? p.city === selectedLocation : true) &&
    (selectedApartmentType ? p.apartmentType === selectedApartmentType : true)
  );
  const totalPagesFiltered = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // All useEffects here
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
          // Destructure all fields returned by the contract
          const [
            propertyAddresses,
            values,
            tokenAddresses,
            propertyImageURLsList,
            ,
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
            propertyImageURLs: propertyImageURLsList[index] || [],
            originalOwner: originalOwners[index],
            title: titles[index],
            description: descriptions[index],
            propertyType: propertyTypes[index],
            apartmentType: apartmentTypes[index],
            bedrooms: bedroomsList[index] !== undefined ? Number(bedroomsList[index]) : 'N/A',
            bathrooms: bathroomsList[index] !== undefined ? Number(bathroomsList[index]) : 'N/A',
            area: areas[index] !== undefined ? Number(areas[index]) : 'N/A',
            yearBuilt: yearsBuilt[index] !== undefined ? Number(yearsBuilt[index]) : 'N/A',
            city: cities[index],
            state: states[index],
            zipCode: zipCodes[index],
            amenities: amenitiesList[index] && amenitiesList[index].length > 0 ? amenitiesList[index] : ["None listed"]
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocation, selectedApartmentType]);

  // Only rendering logic below
  if (!account) return null;

  // Handle favorite toggle using the context
  const handleToggleFavorite = (id: number) => {
    toggleFavorite(id);
  };

  // Pagination controls component
  const PaginationControls = () => (
    <div className="flex justify-center items-center gap-2 my-6">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-blue-800/60 text-white disabled:opacity-40 flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {[...Array(totalPagesFiltered)].map((_, idx) => (
        <button
          key={idx}
          onClick={() => setCurrentPage(idx + 1)}
          className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-blue-500 text-white font-bold' : 'bg-blue-800/40 text-white'}`}
        >
          {idx + 1}
        </button>
      ))}
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPagesFiltered))}
        disabled={currentPage === totalPagesFiltered}
        className="px-3 py-1 rounded bg-blue-800/60 text-white disabled:opacity-40 flex items-center justify-center"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Creative animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Animated gradient blob top left */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-gradient-to-br from-blue-400 via-blue-600 to-purple-500 opacity-30 rounded-full filter blur-3xl animate-blob1"></div>
        {/* Animated gradient blob bottom right */}
        <div className="absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] bg-gradient-to-tr from-purple-400 via-blue-500 to-green-400 opacity-30 rounded-full filter blur-3xl animate-blob2"></div>
      </div>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Browse Properties</h1>
           
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 items-center justify-end">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Location</label>
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="p-2 rounded bg-gray-800 text-white border border-gray-600"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Apartment Type</label>
              <select
                value={selectedApartmentType}
                onChange={e => setSelectedApartmentType(e.target.value)}
                className="p-2 rounded bg-gray-800 text-white border border-gray-600"
              >
                <option value="">All Types</option>
                {apartmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
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
            <>
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {paginatedProperties.length > 0 ? (
                  paginatedProperties.map((property, index) => {
                    const globalIndex = index + (currentPage - 1) * ITEMS_PER_PAGE;
                    return (
                      <div
                        key={globalIndex}
                        className="glass-container bg-gradient-to-br from-blue-900/80 to-blue-700/80 rounded-2xl shadow-2xl border border-blue-300 relative overflow-hidden flex flex-col justify-between transition duration-300 hover:shadow-2xl hover:scale-[1.02]"
                      >
                        <div className="relative h-64 rounded-xl overflow-hidden mb-2">
                          {property.propertyImageURLs?.length > 0 ? (
                            <Image
                              src={property.propertyImageURLs[0].startsWith('http') 
                                ? property.propertyImageURLs[0] 
                                : `https://gateway.pinata.cloud/ipfs/${property.propertyImageURLs[0]}`}
                              alt={property.propertyAddress || 'Property Image'}
                              fill
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-700">
                              <Home className="h-12 w-12 opacity-50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          <span className="absolute top-4 left-4 bg-white/80 text-blue-700 font-bold px-3 py-1 rounded-full shadow">${Number(ethers.formatUnits(property.value, 18)).toLocaleString()}</span>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                                {property.propertyAddress || 'Unknown Address'}
                              </h3>
                              <div className="flex items-center mt-1 text-gray-300 text-sm">
                                <Tag className="h-4 w-4 mr-1" />
                                <span>
                                  Token: {property.tokenAddress
                                    ? `${property.tokenAddress.slice(0, 6)}...${property.tokenAddress.slice(-4)}`
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleToggleFavorite(globalIndex);
                              }}
                              className="p-2 bg-white/70 rounded-full hover:bg-blue-200 transition-colors z-10 shadow-md btn-press-effect"
                            >
                              <Heart
                                className={`h-6 w-6 ${isFavorite(globalIndex)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-blue-700'
                                  }`}
                              />
                            </button>
                          </div>

                          <div className="flex justify-between text-sm text-blue-100 mt-4 pb-4 border-b border-blue-200/20">
                            <div className="flex items-center">
                              <span className="font-semibold text-lg text-white">{(property as any).bedrooms}</span>
                              <span className="ml-1">Beds</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-lg text-white">{(property as any).bathrooms}</span>
                              <span className="ml-1">Baths</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-lg text-white">{(property as any).area}</span>
                              <span className="ml-1">sqft</span>
                            </div>
                          </div>

                          <div className="mt-6">
                            <Link
                              href={`/page/property/${globalIndex}`}
                              className="block w-full text-center px-4 py-3 glass-button hover:bg-blue-700 transition-colors font-medium"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center py-12">
                    <Filter className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">No properties found</h3>
                    <p className="text-gray-400 mb-4">Try again later or refresh the page</p>
                  </div>
                )}
              </div>
              <PaginationControls />
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}