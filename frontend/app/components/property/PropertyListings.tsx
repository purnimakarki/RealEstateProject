'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatUnits } from 'ethers';
import { useWallet } from '../hooks/usewallet';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import contractAddress from '../../../contracts/contract-address.json';

interface Listing {
  seller: string;
  tokenAmount: number;
  pricePerToken: string; // Changed to string to match formatUnits output
  index: number;
}

interface PropertyListingsProps {
  propertyId: number;
}

export default function PropertyListings({ propertyId }: PropertyListingsProps) {
  const { account, provider } = useWallet();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Fetch listings for this property
  useEffect(() => {
    const fetchListings = async () => {
      if (!provider) return;
      
      try {
        setIsLoading(true);
        
        // Get the factory contract
        const factoryContract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          provider
        );
        
        // Get listings for this property
        const listingsData: Listing[] = await factoryContract.getListings(propertyId);
        
        // Format listings
        const formattedListings = listingsData.map((listing, index) => ({
          seller: listing.seller,
          tokenAmount: Number(listing.tokenAmount),
          pricePerToken: formatUnits(listing.pricePerToken, 18),
          index: index
        }));        
        setListings(formattedListings);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListings();
  }, [provider, propertyId, success]);
  
  const handleBuyFromListing = async (listingIndex: number) => {
    if (!account || !provider) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      setIsBuying(true);
      setError(null);
      setSuccess(null);
      
      // Get signer from provider
      const signer = await provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // Get the listing details to get the exact price in wei
      const listingsData = await contract.getListings(propertyId);
      if (listingIndex >= listingsData.length) {
        throw new Error("Invalid listing index");
      }
      
      const listing = listingsData[listingIndex];
      const totalCost = listing.tokenAmount * listing.pricePerToken;
      
      console.log(`Buying from listing #${listingIndex}`);
      console.log(`Total cost in wei: ${totalCost.toString()}`);
      
      // Call the buyFromListing function with the exact wei amount
      const tx = await contract.buyFromListing(propertyId, listingIndex, {
        value: totalCost
      });
      
      // Wait for transaction to be mined
      await tx.wait();
      
      setSuccess(`Successfully purchased tokens from listing #${listingIndex + 1}`);
    } catch (err: unknown) {
      console.error("Error buying from listing:", err);
      setError(err instanceof Error ? err.message : "Failed to buy from listing. Please try again.");
    } finally {
      setIsBuying(false);
    }
  };    // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Available Listings</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Available Listings</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      
      {listings.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No listings available for this property</p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const totalCost = listing.tokenAmount * Number(listing.pricePerToken);
            
            return (
              <div key={listing.index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-gray-300 text-sm">Seller: {formatAddress(listing.seller)}</p>
                    <p className="text-white font-medium mt-1">{listing.tokenAmount} Tokens</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">Price per token</p>
                    <p className="text-white font-bold">${parseFloat(listing.pricePerToken).toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                  <p className="text-white font-medium">Total: ${totalCost.toFixed(2)}</p>
                  <button
                    onClick={() => handleBuyFromListing(listing.index)}
                    disabled={isBuying || !account || listing.seller.toLowerCase() === account.toLowerCase()}
                    className={`px-4 py-2 rounded-lg text-sm font-medium
                      ${isBuying 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : listing.seller.toLowerCase() === account?.toLowerCase()
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                      }`}
                  >
                    {isBuying 
                      ? 'Processing...' 
                      : listing.seller.toLowerCase() === account?.toLowerCase()
                        ? 'Your Listing'
                        : 'Buy Now'
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}