'use client';
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../../../contracts/RealEstateTokenFactoryABI.json';
import PropertyTokenABI from '../../../../../contracts/PropertyTokenABI.json';
import contractAddress from '../../../../../contracts/contract-address.json';
import { formatImageUrl } from '../../../../components/utils/imageUtils';
import { useNotification } from '@/app/context/NotificationContext'; 

export const usePropertyContract = (propertyId: number) => {
  const { addNotification } = useNotification(); 
  const [account, setAccount] = useState<string>("");
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [listingAmount, setListingAmount] = useState<number>(1);
  const [listingPrice, setListingPrice] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ethPrice] = useState<number>(2000);
  const tokenPrice = 50; 
  
  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        return accounts[0];
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setError("Failed to connect wallet");
        return "";
      }
    } else {
      setError("Please install MetaMask to use this feature");
      return "";
    }
  };

  // Fetch property data
  const fetchProperty = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        provider
      );

      // Fetch live ETH price for USD conversion
      let ethPriceUSD = 2000;
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        if (data && data.ethereum && data.ethereum.usd) {
          ethPriceUSD = data.ethereum.usd;
        }
      } catch {}

      // Correctly destructure the arrays returned by getProperties
      const [
        propertyAddresses,
        values,
        tokenAddresses,
        propertyImageURLsList,
        documentURLsList,
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

      // Defensive: check if propertyId is valid
      if (!propertyAddresses || propertyId >= propertyAddresses.length) {
        console.error(`Property with ID ${propertyId} not found.`);
        setProperty(null);
        setLoading(false);
        return;
      }

      // Map the arrays to a property object
      const formattedProperty = {
        address: propertyAddresses[propertyId] || "Address not provided",
        price: values[propertyId] ? Number(ethers.formatUnits(values[propertyId], 18)) : 0,
        tokenAddress: tokenAddresses[propertyId],
        images: propertyImageURLsList[propertyId] && propertyImageURLsList[propertyId].length > 0
          ? propertyImageURLsList[propertyId].map((img: string) => formatImageUrl(img))
          : [],
        documentURLs: documentURLsList[propertyId] && documentURLsList[propertyId].length > 0
            ? documentURLsList[propertyId].map((doc: string) => formatImageUrl(doc))
            : [],
        originalOwner: originalOwners[propertyId],
        title: titles[propertyId] || "Not Available",
        description: descriptions[propertyId] || "No description provided.",
        propertyType: propertyTypes[propertyId] || "Type not specified",
        apartmentType: apartmentTypes[propertyId] || "Type not specified",
        bedrooms: bedroomsList[propertyId] !== undefined ? Number(bedroomsList[propertyId]) : "N/A",
        bathrooms: bathroomsList[propertyId] !== undefined ? Number(bathroomsList[propertyId]) : "N/A",
        area: areas[propertyId] !== undefined ? Number(areas[propertyId]) : "N/A",
        yearBuilt: yearsBuilt[propertyId] !== undefined ? Number(yearsBuilt[propertyId]) : "N/A",
        city: cities[propertyId] || "",
        state: states[propertyId] || "",
        zipCode: zipCodes[propertyId] || "",
        amenities: amenitiesList[propertyId] && amenitiesList[propertyId].length > 0
          ? amenitiesList[propertyId]
          : ["None listed"],
        featured: true, // This can be made dynamic later if needed
        totalTokens: values[propertyId] ? Math.floor(Number(ethers.formatUnits(values[propertyId], 18)) / tokenPrice) : 0
      };

      setProperty(formattedProperty);

      const propertyListings = await contract.getListings(propertyId);
      const formattedListings = propertyListings.map((listing: any) => {
        const pricePerTokenETH = Number(ethers.formatUnits(listing.pricePerToken ?? 0, 18)) || 0;
        const pricePerTokenUSD = pricePerTokenETH * ethPriceUSD || 0;
        const tokenAmount = Number(listing.tokenAmount ?? 0) || 0;
        const totalUSD = pricePerTokenUSD * tokenAmount || 0;
        return {
          seller: listing.seller ?? '',
          tokenAmount,
          pricePerToken: pricePerTokenETH,
          pricePerTokenUSD,
          totalUSD
        };
      });
      const filteredListings = formattedListings.filter(
        (l: any) => !isNaN(l.pricePerToken) && !isNaN(l.pricePerTokenUSD) && !isNaN(l.tokenAmount) && !isNaN(l.totalUSD)
      );
      setListings(filteredListings);

      const accounts = await provider.listAccounts();
      if (accounts.length > 0 && accounts[0]) {
        const userAccountSigner = accounts[0];
        let userAccount: string = '';
        if (typeof userAccountSigner === 'string') {
          userAccount = userAccountSigner;
        } else if (userAccountSigner && typeof userAccountSigner === 'object' && 'address' in userAccountSigner) {
          userAccount = (userAccountSigner as { address: string }).address;
        }
        setAccount(userAccount);
        if (userAccount && formattedProperty.tokenAddress && formattedProperty.tokenAddress !== ethers.ZeroAddress) {
          const tokenContract = new ethers.Contract(
            formattedProperty.tokenAddress,
            PropertyTokenABI,
            provider
          );
          const balance = await tokenContract.balanceOf(userAccount);
          const decimals = await tokenContract.decimals();
          setUserBalance(Number(ethers.formatUnits(balance, decimals)));
        } else {
          setUserBalance(0);
        }
      } else {
        setAccount("");
        setUserBalance(0);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      setError('Failed to fetch property details. Please try again.');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId, tokenPrice]);
  
  // Buy tokens from initial sale
  const buyTokens = async () => {
    if (!account || !property || tokenAmount <= 0 || propertyId === undefined) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
      if (!provider) throw new Error("Please install MetaMask to continue");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      const totalCostUSD = tokenAmount * tokenPrice;
      
      if (!ethPrice || ethPrice === 0) {
        throw new Error("ETH price is not available. Please try again later.");
      }
      
      const costInEth = totalCostUSD / ethPrice;
      
      if (isNaN(costInEth) || costInEth <= 0) {
        throw new Error("Invalid cost calculation. Please try again.");
      }
      
      const costInEthWithBuffer = costInEth * 1.1;
      
      const totalCostInWei = ethers.parseEther(costInEthWithBuffer.toFixed(18));
      
      const tx = await contract.buyFromSale(propertyId, tokenAmount, {
        value: totalCostInWei
      });
      
      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens!`);
      
      try {
        // Fetch property details to get the original owner
        const propertyDetails = await contract.properties(propertyId);
        const propertyOwner = propertyDetails.originalOwner; // Access the originalOwner from the struct

        const currentTimestamp = new Date().toISOString();
        const totalCostFormatted = ethers.formatEther(totalCostInWei);

        // Notification for Property Owner
        if (propertyOwner && propertyOwner.toLowerCase() !== account.toLowerCase()) {
          const notificationForOwner = {
            type: 'PROPERTY_SOLD', // Standardized type
            propertyId: propertyId,
            tokenAmount: tokenAmount,
            buyerAddress: account,
            totalCost: totalCostFormatted,
            timestamp: currentTimestamp,
            propertyName: property?.title || `Property #${propertyId + 1}`,
          };
          addNotification(notificationForOwner, propertyOwner);
          console.log(`Notification sent to property owner ${propertyOwner}`);
        }

        // Notification for Buyer
        const notificationForBuyer = {
          type: 'PROPERTY_PURCHASED', // Standardized type
          propertyId: propertyId,
          tokenAmount: tokenAmount,
          buyerAddress: account, // Buyer is the current user
          totalCost: totalCostFormatted,
          timestamp: currentTimestamp,
          propertyName: property?.title || `Property #${propertyId + 1}`,
        };
        addNotification(notificationForBuyer, account);
        console.log(`Notification sent to buyer ${account}`);

      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
      }
      
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        provider
      );
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(ethers.formatUnits(balance, decimals)));
      
    } catch (error: any) {
      console.error('Error buying tokens:', error);
      setError(error.message || 'Failed to buy tokens. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Helper to fetch live ETH price in USD
  const fetchLiveEthPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      if (data && data.ethereum && data.ethereum.usd) {
        return data.ethereum.usd;
      }
    } catch {
      console.warn('Failed to fetch live ETH price, using fallback $2000');
    }
    return 2000;
  };
  
  // Create a listing to sell tokens
  const createListing = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    if (listingAmount <= 0) {
      setError('Please enter a valid token amount');
      return;
    }
    if (listingPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }
    if (listingAmount > userBalance) {
      setError('You don\'t have enough tokens');
      return;
    }
    setIsProcessing(true);
    setError('');
    setSuccess('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        signer
      );
      const decimals = await tokenContract.decimals();
      const base = BigInt(10);
      const exponent = BigInt(decimals);
      const multiplier = base ** exponent;
      const tokenAmountWithDecimals = BigInt(listingAmount) * multiplier;
      const approveTx = await tokenContract.approve(
        contractAddress.RealEstateTokenFactory,
        tokenAmountWithDecimals
      );
      await approveTx.wait();
      // --- USD to Wei conversion for pricePerToken ---
      const ethPriceUSD = await fetchLiveEthPrice();
      // Calculate price per token in ETH as a number
      const pricePerTokenETH = Number(listingPrice) / Number(ethPriceUSD);
      // Convert to string with up to 18 decimals for parseUnits
      const pricePerTokenETHString = pricePerTokenETH.toLocaleString('fullwide', {useGrouping:false, maximumSignificantDigits:21});
      // Use parseUnits for precision
      const pricePerTokenWei = ethers.parseUnits(pricePerTokenETHString, 18);
      // Debug logs
      console.log('Listing price input (USD):', listingPrice);
      console.log('ETH price (USD):', ethPriceUSD);
      console.log('Price per token (ETH):', pricePerTokenETH);
      console.log('Price per token (ETH, string):', pricePerTokenETHString);
      console.log('Price per token (Wei):', pricePerTokenWei.toString());
      if (pricePerTokenETH > 1) {
        setError('Listing price per token is more than 1 ETH. Please check your input.');
        setIsProcessing(false);
        return;
      }
      const tx = await contract.listForSale(propertyId, listingAmount, pricePerTokenWei);
      await tx.wait();
      setSuccess('Listing created successfully!');
      const propertyListings = await contract.getListings(propertyId);
      const formattedListings = propertyListings.map((listing: any) => ({
        seller: listing.seller,
        tokenAmount: Number(listing.tokenAmount),
        pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18))
      }));
      setListings(formattedListings);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setError(error.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Buy tokens from a listing
  const buyFromListing = async (listingIndex: number) => {
    if (!account || !property || propertyId === undefined) return;
    
    setIsProcessing(true);
    setError(''); 
    
    try {
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
      if (!provider) throw new Error("Please install MetaMask to continue");
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      const listingsData = await contract.getListings(propertyId);
      if (listingIndex >= listingsData.length) {
        throw new Error("Invalid listing index");
      }
      
      const listing = listingsData[listingIndex];
      const numTokensToBuy = listing.tokenAmount;
      const pricePerTokenWei = listing.pricePerToken;

      // Calculate total cost in wei using BigInt math to avoid overflow
      const totalCostWei = BigInt(pricePerTokenWei) * BigInt(numTokensToBuy);

      // Check if user has enough ETH to cover the purchase
      const userBalanceWei = await provider.getBalance(account);
      if (userBalanceWei < totalCostWei) {
        setError(`You do not have enough ETH to complete this purchase. Required: ${ethers.formatEther(totalCostWei)} ETH, Available: ${ethers.formatEther(userBalanceWei)} ETH.`);
        setIsProcessing(false);
        return;
      }

      console.log(`Buying from listing #${listingIndex}:
        Number of tokens: ${numTokensToBuy.toString()}
        Price per token (Wei): ${pricePerTokenWei.toString()}
        Total cost (Wei): ${totalCostWei.toString()}
        Price per token (ETH): ${ethers.formatEther(pricePerTokenWei)} ETH
        Total cost (ETH): ${ethers.formatEther(totalCostWei)} ETH`);

      const tx = await contract.buyFromListing(propertyId, listingIndex, {
        value: totalCostWei
      });
      
      const receipt = await tx.wait();
      
      setSuccess(`Successfully purchased ${numTokensToBuy.toString()} tokens from listing #${listingIndex + 1}.`);
      
      const currentTimestamp = new Date().toISOString();
      const totalCostForNotification = ethers.formatEther(totalCostWei);

      if (listing.seller && listing.seller.toLowerCase() !== account.toLowerCase()) { 
        const notificationForSeller = { 
          type: 'TOKEN_SOLD_IN_RESALE', 
          propertyId: propertyId,
          tokenAmount: Number(numTokensToBuy),
          buyerAddress: account, 
          totalCost: totalCostForNotification, 
          timestamp: currentTimestamp,
          propertyName: property?.title || `Property #${propertyId + 1}`
        };
        addNotification(notificationForSeller, listing.seller);
      }

      const notificationForBuyer = {
        type: 'PURCHASE_CONFIRMATION_RESALE',
        propertyId: propertyId,
        tokenAmount: Number(numTokensToBuy),
        buyerAddress: account, 
        sellerAddress: listing.seller,
        totalCost: totalCostForNotification,
        timestamp: currentTimestamp,
        propertyName: property?.title || `Property #${propertyId + 1}`,
        transactionHash: receipt.hash
      };
      addNotification(notificationForBuyer, account);

      fetchProperty(); 
    } catch (err: any) {
      console.error('Error buying from listing:', err); 
      setError(err.message || 'Failed to buy from listing. Please try again.'); 
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Cancel a listing
  const cancelListing = async (listingIndex: number) => {
    setIsProcessing(true);
    setError("");
    setSuccess("");
    try {
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
      if (!provider) throw new Error("Please install MetaMask to continue");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      const tx = await contract.cancelListing(propertyId, listingIndex);
      await tx.wait();
      setSuccess("Listing cancelled and tokens returned to your wallet.");
      fetchProperty();
    } catch (err: any) {
      console.error("Error cancelling listing:", err);
      setError(err.message || "Failed to cancel listing. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Initialize data
  useEffect(() => {
    fetchProperty();

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      });
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, [propertyId, fetchProperty]);

  return {
    account,
    property,
    loading,
    userBalance,
    listings,
    error,
    success,
    tokenAmount,
    setTokenAmount,
    listingAmount,
    setListingAmount,
    listingPrice,
    setListingPrice,
    isProcessing,
    setError,
    setSuccess,
    connectWallet,
    fetchProperty,
    buyTokens,
    createListing,
    buyFromListing,
    cancelListing
  };
};