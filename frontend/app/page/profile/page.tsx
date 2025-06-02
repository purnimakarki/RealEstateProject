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
import { usePropertyContext, Property } from '../../context/PropertyContext';

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
}


export default function ProfilePage() {
  const { account } = useWallet();
  const { favorites } = useFavorites();
  const { pendingProperties, approvedProperties, rejectedProperties } = usePropertyContext();
  const [listedProperties, setListedProperties] = useState<ListedProperty[]>([]);
  const [purchasedTokens, setPurchasedTokens] = useState<PurchasedToken[]>([]);
  const [userSubmittedProperties, setUserSubmittedProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState('listed');
  const [isLoading, setIsLoading] = useState(true);
  const [listingAmount, setListingAmount] = useState<Record<number, string>>({});
  const [listingPrice, setListingPrice] = useState<Record<number, string>>({});
  const [isListing, setIsListing] = useState<Record<number, boolean>>({});
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev);
  }, []);

  const handleListingAmountChange = (propertyId: number, value: string) => {
    setListingAmount(prev => ({ ...prev, [propertyId]: value }));
  };

  const handleListingPriceChange = (propertyId: number, value: string) => {
    setListingPrice(prev => ({ ...prev, [propertyId]: value }));
  };

  const fetchUserData = useCallback(async () => {
    if (!account) return;

    try {
      setIsLoading(true);

      const allUserProps = [
        ...pendingProperties,
        ...approvedProperties,
        ...rejectedProperties
      ].filter(p => p.originalOwner && p.originalOwner.toLowerCase() === account.toLowerCase());
      setUserSubmittedProperties(allUserProps);

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
          const listings = await contract.getListings(i);
          const userListings = listings.filter((listing: { seller: string }) =>
            listing.seller.toLowerCase() === account.toLowerCase()
          );

          if (userListings.length > 0) {
            let imageUrl = propertyImageURLs[i]?.[0] || '/imageforLanding/house.jpg';
            if (imageUrl && !imageUrl.startsWith('http') && imageUrl !== '/imageforLanding/house.jpg') {
              imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUrl}`;
            }

            userListedProperties.push({
              id: i,
              address: propertyAddresses[i],
              value: ethers.formatUnits(values[i], 18),
              tokenAddress: tokenAddresses[i],
              imageURL: imageUrl,
              listings: userListings.map((listing: { tokenAmount: number; pricePerToken: bigint }) => ({
                tokenAmount: Number(listing.tokenAmount),
                pricePerToken: ethers.formatUnits(listing.pricePerToken, 18)
              }))
            });
          }

          if (tokenAddresses[i]) {
            const tokenContract = new ethers.Contract(
              tokenAddresses[i],
              PropertyTokenABI,
              provider
            );

            const balance = await tokenContract.balanceOf(account);
            const decimals = await tokenContract.decimals();
            const tokenBalance = parseFloat(ethers.formatUnits(balance, decimals));

            if (tokenBalance > 0) {
              const isAlreadyListed = userListedProperties.some(prop => prop.id === i);

              if (!isAlreadyListed) {
                let purchasedImageUrl = propertyImageURLs[i]?.[0] || '/imageforLanding/house.jpg';
                if (purchasedImageUrl && !purchasedImageUrl.startsWith('http') && purchasedImageUrl !== '/imageforLanding/house.jpg') {
                  purchasedImageUrl = `https://gateway.pinata.cloud/ipfs/${purchasedImageUrl}`;
                }
                userPurchasedTokens.push({
                  id: i,
                  address: propertyAddresses[i],
                  value: ethers.formatUnits(values[i], 18),
                  tokenAddress: tokenAddresses[i],
                  imageURL: purchasedImageUrl,
                  tokenBalance
                });
              }
            }
          }
        }

        setListedProperties(userListedProperties);
        setPurchasedTokens(userPurchasedTokens);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, pendingProperties, approvedProperties, rejectedProperties]);

  const handleListForSale = async (propertyId: number) => {
    const amount = listingAmount[propertyId];
    const price = listingPrice[propertyId];

    if (!amount || !price) {
      alert('Please enter both amount and price');
      return;
    }

    const property = purchasedTokens.find(p => p.id === propertyId);
    if (!property) return;

    try {
      setIsListing(prev => ({ ...prev, [propertyId]: true }));

      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

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

        const tokenAmount = parseInt(amount);
        const pricePerToken = ethers.parseUnits(price, 18);
        const decimals = await tokenContract.decimals();
        const tokenAmountWithDecimals = BigInt(tokenAmount) * BigInt(10 ** Number(decimals));

        alert('Step 1 of 2: Please approve the token transfer in your wallet');

        console.log(`Approving ${tokenAmountWithDecimals} tokens for transfer`);
        const approveTx = await tokenContract.approve(
          contractAddress.RealEstateTokenFactory,
          tokenAmountWithDecimals
        );

        console.log('Approval transaction sent:', approveTx.hash);
        console.log('Waiting for approval transaction to be mined...');
        const approveReceipt = await approveTx.wait();
        console.log('Approval confirmed in block:', approveReceipt.blockNumber);

        alert('Step 2 of 2: Please confirm the listing transaction in your wallet');

        console.log(`Listing ${tokenAmount} tokens at ${price} ETH per token`);
        const listTx = await factoryContract.listForSale(
          propertyId,
          tokenAmount,
          pricePerToken
        );

        console.log('Listing transaction sent:', listTx.hash);
        console.log('Waiting for listing transaction to be mined...');
        await listTx.wait();
        console.log('Listing confirmed!');

        setListingAmount(prev => ({ ...prev, [propertyId]: '' }));
        setListingPrice(prev => ({ ...prev, [propertyId]: '' }));
        fetchUserData();

        alert('Tokens listed for sale successfully!');
      }
    } catch (error) {
      console.error('Error listing tokens for sale:', error);
      alert('Error listing tokens for sale. See console for details.');
    } finally {
      setIsListing(prev => ({ ...prev, [propertyId]: false }));
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
                  className="rounded-full w-20 h-20"
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
                className={`px-6 py-3 font-medium ${activeTab === 'initialSubmissions' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('initialSubmissions')}
              >
                Initial Submissions
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'resaleListings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('resaleListings')}
              >
                My Resale Listings
              </button>
              <button
                className={`px-6 py-3 font-medium ${activeTab === 'purchased' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => setActiveTab('purchased')}
              >
                Purchased Tokens
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
              {activeTab === 'initialSubmissions' && (
                <div>
                  {userSubmittedProperties.length > 0 ? (
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {userSubmittedProperties.map((property) => (
                        <div key={property.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                          <div className="relative h-48">
                            <Image
                              src={property.propertyImageURLs?.[0]?.startsWith('http')
                                ? property.propertyImageURLs[0]
                                : `https://gateway.pinata.cloud/ipfs/${property.propertyImageURLs?.[0] || 'default_image_hash'}`}
                              alt={property.propertyAddress}
                              fill
                              className="object-cover"
                            />
                            <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full
                              ${property.status === 'pending' ? 'bg-yellow-500 text-black' :
                                property.status === 'approved' ? 'bg-green-500 text-white' :
                                'bg-red-500 text-white'}`}>
                              {property.status === 'pending' ? 'Pending Approval' : property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <p className="text-white font-bold">
                                {typeof property.value === 'string' ? property.value : ethers.formatUnits(property.value, 18)} USD
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {property.propertyAddress.slice(0, 30)}...
                            </h3>
                            <p className="text-sm text-gray-400 mb-1">Status: {property.status === 'pending' ? 'Pending Approval' : property.status}</p>
                            {property.status === 'approved' && (
                              <Link
                                href={`/page/property/${property.id}`}
                                className="mt-2 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                View Property / Manage Listing
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-4">You haven&apos;t submitted any properties yet.</p>
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
              {activeTab === 'resaleListings' && (
                <div>
                  {listedProperties.length > 0 ? (
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {listedProperties.map((property) => (
                        <div key={property.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                          <div className="relative h-48">
                            <Image
                              src={property.imageURL}
                              alt={property.address}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {property.address.slice(0, 30)}...
                            </h3>
                            <p className="text-sm text-gray-400 mb-1">Value: {property.value} USD</p>
                            {property.listings && property.listings.length > 0 && (
                              <div className="mt-2">
                                <h4 className="text-xs text-gray-300 font-semibold mb-1">Your Listings:</h4>
                                {property.listings.map((listing, index) => (
                                  <div key={index} className="text-xs text-gray-400">
                                    <span>{listing.tokenAmount} tokens @ {listing.pricePerToken} ETH/token</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <Link
                              href={`/page/property/${property.id}`}
                              className="mt-3 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              View Property / Manage Listing
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg">You haven&apos;t listed any of your purchased properties for resale yet.</p>
                    </div>
                  )}
                </div>
              )}
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
                              <p className="text-white font-bold">${property.value}</p>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">
                              {property.address.slice(0, 20)}...
                            </h3>
                            <div className="mb-4">
                              <p className="text-gray-400 text-sm">Your balance:</p>
                              <p className="text-white font-medium">{property.tokenBalance} tokens</p>
                            </div>
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
                                  type="number"
                                  placeholder="Price per token"
                                  className="flex-1 max-w-[120px] px-1 py-2 bg-gray-800 rounded text-white text-sm"
                                  value={listingPrice[property.id] || ''}
                                  onChange={(e) => handleListingPriceChange(property.id, e.target.value)}
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