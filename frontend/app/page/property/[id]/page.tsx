'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../../components/navbar';
import Footer from '../../../components/footer';
import { 
 ArrowLeft, ArrowRight, Share2
} from 'lucide-react';
import PropertyHeader from './components/PropertyHeader';
import PropertyInformation from './components/PropertyInformation';
import TokenPurchaseSection from './components/TokenPurchaseSection';
import TokenListingsSection from './components/TokenListingsSection';
import { usePropertyContract } from './hooks/usePropertyContract';
// import ethers from 'ethers';


export default function PropertyDetails() {
  const params = useParams();
  const id = Number(params.id);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { 
    account, 
    property, 
    loading, 
    userBalance, 
    listings, 
    error, 
    success, 
    listingAmount, 
    setListingAmount, 
    listingPrice, 
    setListingPrice, 
    isProcessing, 
    connectWallet, 
    createListing, 
    buyFromListing, 
    cancelListing 
  } = usePropertyContract(id);
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const nextImage = () => {
    if (property && property.images) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === property.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  const prevImage = () => {
    if (property && property.images) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? property.images.length - 1 : prevIndex - 1
      );
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-24 pb-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-white mb-4">Property Not Found</h1>
              <p className="text-gray-400 mb-8">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Property Header */}
          <PropertyHeader 
            property={property} 
            isFavorite={isFavorite} 
            toggleFavorite={toggleFavorite} 
          />
          
          {/* Property Images */}
          <div className="mb-8 relative">
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src={property.images[currentImageIndex]}
                alt={property.title}
                fill
                className="object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-white" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <ArrowRight className="h-6 w-6 text-white" />
              </button>
              
              <div className="absolute bottom-4 right-4">
                <button className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                  <Share2 className="h-5 w-5 text-white" />
                </button>
              </div>
              
              <div className="absolute bottom-4 left-4 flex space-x-2">
                {property.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  ></button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Property Information */}
              <PropertyInformation property={property} />
              
              {/* Token Listings Section */}
              <TokenListingsSection
                property={property}
                account={account}
                listings={listings}
                userBalance={userBalance}
                listingAmount={listingAmount}
                setListingAmount={setListingAmount}
                listingPrice={listingPrice}
                setListingPrice={setListingPrice}
                isProcessing={isProcessing}
                createListing={createListing}
                buyFromListing={async (index: number) => {
                  await buyFromListing(index);
                }}
                cancelListing={cancelListing}
              />
              
              {/* Status Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-lg text-green-200">
                  {success}
                </div>
              )}
            </div>
            
            {/* Right Column */}
            <div>
              {/* Token Purchase Section */}
              <TokenPurchaseSection
                property={property}
                propertyId={id}
                account={account}
                connectWallet={connectWallet}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

