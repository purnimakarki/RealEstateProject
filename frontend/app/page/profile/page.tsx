'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { useWallet } from '../../components/hooks/usewallet';
import { useFavorites } from '../../components/hooks/useFavorites';
import FavoriteProperties from '@/app/components/profile/FavoriteProperties';
import PropertyNotifications from '@/app/components/notifications/PropertyNotifications';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import PropertyTokenABI from '../../../contracts/PropertyTokenABI.json';
import contractAddress from '../../../contracts/contract-address.json';
import NotificationsList from '../../components/notifications/NotificationsList';
import { getUserSubmittedProperties } from '../../components/utils/contractInteraction';

interface ListedProperty {
  id: number;
  address: string;
  value: string;
  tokenAddress: string;
  imageURL: string;
  listings: {
    tokenAmount: number;
    pricePerToken: string;
  }[];
}

interface PurchasedToken {
  id: number;
  address: string;
  value: string;
  tokenAddress: string;
  imageURL: string;
  tokenBalance: number;
  listedTokenCount: number;
}

interface SubmittedProperty {
  id: number;
  propertyAddress: string;
  value: string;
  tokenAddress?: string;
  propertyImageURLs: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export default function ProfilePage() {
  const { account } = useWallet();
  const { favorites } = useFavorites();
  const [listedProperties, setListedProperties] = useState<ListedProperty[]>([]);
  const [purchasedTokens, setPurchasedTokens] = useState<PurchasedToken[]>([]);
  const [activeTab, setActiveTab] = useState('listed');
  const [isLoading, setIsLoading] = useState(true);
  const [listingAmount, setListingAmount] = useState<{[key: number]: string}>({});
  const [listingPrice, setListingPrice] = useState<{[key: number]: string}>({});
  const [isListing, setIsListing] = useState<{[key: number]: boolean}>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [submittedProperties, setSubmittedProperties] = useState<SubmittedProperty[]>([]);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const handleListingAmountChange = (propertyId: number, value: string) => {
    setListingAmount(prev => ({...prev, [propertyId]: value}));
  };

  const handleListingPriceChange = (propertyId: number, value: string) => {
    // Remove any non-digit characters including decimals
    const wholeNumber = value.replace(/[^\d]/g, '');
    setListingPrice(prev => ({...prev, [propertyId]: wholeNumber}));
  };

  const fetchUserData = useCallback(async () => {
    if (!account) return;

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

        const userListedProperties: ListedProperty[] = [];
        const userPurchasedTokens: PurchasedToken[] = [];

        for (let i = 0; i < propertyAddresses.length; i++) {
          // Get all listings for this property
          const listings = await contract.getListings(i);
          
          // Filter listings where the user is the seller
          const userListings = listings.filter((listing: { seller: string }) =>
            listing.seller.toLowerCase() === account.toLowerCase()
          );
          
          // Calculate total tokens listed (escrowed) by the user
          const listedTokenCount = userListings.reduce((sum: number, l: any) => sum + Number(l.tokenAmount), 0);
          
          // If user has listings for this property, add to listedProperties
          if (userListings.length > 0) {
            userListedProperties.push({
              id: i,
              address: propertyAddresses[i],
              value: ethers.formatUnits(values[i], 18),
              tokenAddress: tokenAddresses[i],
              imageURL: propertyImageURLs[i]?.[0] || '/imageforLanding/house.jpg',
              listings: userListings.map((listing: { tokenAmount: number; pricePerToken: bigint }) => ({
                tokenAmount: Number(listing.tokenAmount),
                pricePerToken: ethers.formatUnits(listing.pricePerToken, 18)
              }))
            });
          }

          // Check if user has tokens for this property
          if (tokenAddresses[i]) {
            const tokenContract = new ethers.Contract(
              tokenAddresses[i],
              PropertyTokenABI,
              provider
            );

            const balance = await tokenContract.balanceOf(account);
            const decimals = await tokenContract.decimals();
            const tokenBalance = parseFloat(ethers.formatUnits(balance, decimals));

            // Show property if user has tokens in wallet or listed for sale
            if ((tokenBalance + listedTokenCount) > 0) {
              userPurchasedTokens.push({
                id: i,
                address: propertyAddresses[i],
                value: ethers.formatUnits(values[i], 18),
                tokenAddress: tokenAddresses[i],
                imageURL: propertyImageURLs[i]?.[0] || '/imageforLanding/house.jpg',
                tokenBalance,
                listedTokenCount
              });
            }
          }
        }

        setListedProperties(userListedProperties);
        setPurchasedTokens(userPurchasedTokens);
        
        // Fetch user submitted properties
        const userSubmittedProps = await getUserSubmittedProperties(account);
        setSubmittedProperties(userSubmittedProps);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  const handleListForSale = async (propertyId: number) => {
    const amount = listingAmount[propertyId];
    const price = listingPrice[propertyId];
    
    if (!amount || !price) {
      alert('Please enter both amount and price');
      return;
    }

    // Validate amount and price
    if (!Number.isInteger(Number(amount))) {
      alert('Token amount must be a whole number');
      return;
    }

    if (!Number.isInteger(Number(price))) {
      alert('Price must be a whole number');
      return;
    }
    
    const property = purchasedTokens.find(p => p.id === propertyId);
    if (!property) return;
    
    try {
      setIsListing(prev => ({...prev, [propertyId]: true}));
      
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // First approve the factory contract to transfer tokens
        const tokenContract = new ethers.Contract(
          property.tokenAddress,
          PropertyTokenABI,
          signer
        );
        
        const factoryContract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          signer
        );
        
        // Convert amount and price to the correct format - use whole numbers only
        const tokenAmount = parseInt(amount);
        const pricePerToken = ethers.parseUnits(price, 18); // Convert whole number to wei
        
        const decimals = await tokenContract.decimals();
        const tokenAmountWithDecimals = BigInt(tokenAmount) * BigInt(10 ** Number(decimals));
        
        alert('Step 1 of 2: Please approve the token transfer in your wallet');
        
        const approveTx = await tokenContract.approve(
          contractAddress.RealEstateTokenFactory,
          tokenAmountWithDecimals
        );
        
        await approveTx.wait();
        
        alert('Step 2 of 2: Please confirm the listing transaction in your wallet');
        
        const listTx = await factoryContract.listForSale(
          propertyId,
          tokenAmount,
          pricePerToken
        );
        
        await listTx.wait();
        
        setListingAmount(prev => ({...prev, [propertyId]: ''}));
        setListingPrice(prev => ({...prev, [propertyId]: ''}));
        
        fetchUserData();
        
        alert('Tokens listed for sale successfully!');
      }
    } catch (error) {
      console.error('Error listing tokens for sale:', error);
      alert('Error listing tokens for sale. Please check your token balance.');
    } finally {
      setIsListing(prev => ({...prev, [propertyId]: false}));
    }
  };
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  if (!account) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Please Connect Your Wallet</h1>
            <p className="text-gray-400 mb-8">You need to connect your wallet to view your profile</p>
          </div>
        </div>        
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-xl overflow-hidden mb-8">
            <div className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="bg-black rounded-full p-6 flex items-center justify-center">
                <Image 
                  src="/logo2.png" 
                  alt="Profile" 
                  width={80} 
                  height={80} 
                  className="rounded-full w-20 h-20 "
                />
              </div>
              
              <div className="text-center md:text-left flex-grow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Your Profile</h1>
                    <p className="text-gray-400 mb-4">Wallet Address: {account}</p>
                    
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <div className="bg-gray-700 px-4 py-2 rounded-lg">
                        <span className="text-gray-400 text-sm">Listed</span>
                        <p className="text-xl font-bold">{listedProperties.length}</p>
                      </div>
                      
                      <div className="bg-gray-700 px-4 py-2 rounded-lg">
                        <span className="text-gray-400 text-sm">Purchased</span>
                        <p className="text-xl font-bold">{purchasedTokens.length}</p>
                      </div>
                      
                      <div className="bg-gray-700 px-4 py-2 rounded-lg">
                        <span className="text-gray-400 text-sm">Favorites</span>
                        <p className="text-xl font-bold">{favorites.length}</p>
                      </div>
                    </div>
                  </div>
                    <div className="mt-4 md:mt-0">
                    <div onClick={toggleNotifications}>
                      <PropertyNotifications />
                    </div>
                    <div className={showNotifications ? "block" : "hidden"}>
                      <NotificationsList notifications={[]} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex border-b border-gray-700">
              <button 
                className={`px-6 py-3 font-medium ${activeTab === 'listed' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('listed')}
              >
                Listed Properties
              </button>
              <button 
                className={`px-6 py-3 font-medium ${activeTab === 'purchased' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('purchased')}
              >
                Purchased Tokens
              </button>
              <button 
                className={`px-6 py-3 font-medium ${activeTab === 'submitted' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('submitted')}
              >
                Submitted Properties
              </button>
              <button 
                className={`px-6 py-3 font-medium ${activeTab === 'favorites' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('favorites')}
              >
                Favorites
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div>
              {/* Listed Properties Tab */}
              {activeTab === 'listed' && (
                <div>
                  {listedProperties.length > 0 ? (
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {listedProperties.map((property) => (
                        <div key={property.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                          {/* Add image section here */}
                          <div className="relative h-48">
                            <Image 
                              src={property.imageURL.startsWith('http') 
                                ? property.imageURL 
                                : `https://gateway.pinata.cloud/ipfs/${property.imageURL}`} 
                              alt={property.address} 
                              fill 
                              className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <p className="text-white font-bold">${parseFloat(property.value).toFixed(0)}</p>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {property.address.slice(0, 20)}...
                            </h3>
                            
                            <div className="mb-4">
                              <p className="text-gray-400 text-sm">Your listings:</p>
                              {property.listings.map((listing, idx) => (
                                <div key={idx} className="bg-gray-700 p-2 rounded mt-2">
                                  <p className="text-sm">{listing.tokenAmount} tokens @ ${listing.pricePerToken}/token</p>
                                </div>
                              ))}
                            </div>
                            
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
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-4">You haven&apos;t listed any properties for sale yet</p>
                      <Link 
                        href="/page/sell" 
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        List a Property
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* Purchased Tokens Tab */}
              {activeTab === 'purchased' && (
                <div>
                  {purchasedTokens.length > 0 ? (
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {purchasedTokens.map((property) => (
                        <div key={property.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                          <div className="relative h-48">
                            <Image 
                              src={property.imageURL.startsWith('http') 
                                ? property.imageURL 
                                : `https://gateway.pinata.cloud/ipfs/${property.imageURL}`} 
                              alt={property.address} 
                              fill 
                              className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <p className="text-white font-bold">${parseFloat(property.value).toFixed(0)}</p>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {property.address.slice(0, 20)}...
                            </h3>
                            
                            <div className="mb-4">
                              <p className="text-gray-400 text-sm">Your balance:</p>
                              <p className="text-white font-medium">{property.tokenBalance} tokens</p>
                              {property.listedTokenCount > 0 && (
                                <p className="text-blue-400 text-sm">Listed for sale: {property.listedTokenCount} tokens</p>
                              )}
                            </div>
                            
                            {/* Add listing form */}
                            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                              <p className="text-sm text-gray-300 mb-2">List tokens for sale:</p>
                              <div className="flex gap-2 mb-2">
                                <input
                                  type="number"
                                  placeholder="Amount"
                                  className="flex-1 px-1 py-2 bg-gray-800 rounded text-white text-sm"
                                  value={listingAmount[property.id] || ''}
                                  onChange={(e) => handleListingAmountChange(property.id, e.target.value)}
                                />
                                <input
                                  type="text"
                                  placeholder="Price per token (whole numbers only)"
                                  className="flex-1 max-w-[120px] px-1 py-2 bg-gray-800 rounded text-white text-sm"
                                  value={listingPrice[property.id] || ''}
                                  onChange={(e) => handleListingPriceChange(property.id, e.target.value)}
                                  pattern="\d*"
                                  inputMode="numeric"
                                />
                              </div>
                             
                              <button
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                onClick={() => handleListForSale(property.id)}
                                disabled={isListing[property.id]}
                              >
                                {isListing[property.id] ? 'Processing...' : 'List for Sale'}
                              </button>
                            </div>
                            
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
                  ) : (
                    <div className="text-center py-12">
                    <p className="text-gray-400 mb-4">You haven&apos;t purchased any property tokens yet.</p>

                      <Link 
                        href="/page/buy" 
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Properties
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {/* Submitted Properties Tab */}
              {activeTab === 'submitted' && (
                <div>
                  {submittedProperties.length > 0 ? (
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {submittedProperties.map((property) => (
                        <div key={property.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                          <div className="relative h-48">
                            <Image 
                              src={property.propertyImageURLs[0]?.startsWith('http') 
                                ? property.propertyImageURLs[0] 
                                : `https://gateway.pinata.cloud/ipfs/${property.propertyImageURLs[0]}`} 
                              alt={property.propertyAddress} 
                              fill 
                              className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <p className="text-white font-bold">${property.value}</p>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {property.propertyAddress}
                            </h3>
                            
                            <div className="flex items-center mb-4">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                property.status === 'pending' ? 'bg-yellow-900/30 text-yellow-500' :
                                property.status === 'approved' ? 'bg-green-900/30 text-green-500' :
                                'bg-red-900/30 text-red-500'
                              }`}>
                                {property.status === 'pending' ? 'Pending ' :
                                 property.status === 'approved' ? 'Approved' : 'Rejected'}
                              </div>
                            </div>
                            
                            {property.status === 'approved' && (
                              <Link 
                                href={`/page/property/${property.id}`}
                                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                View Property
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-4">You haven&apos;t submitted any properties yet</p>
                      <Link 
                        href="/page/sell" 
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Submit a Property
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <FavoriteProperties />
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}