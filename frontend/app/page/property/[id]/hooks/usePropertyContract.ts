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
      const formattedListings = propertyListings.map((listing: any) => ({
        seller: listing.seller,
        tokenAmount: Number(listing.tokenAmount),
        pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18)),
      }));
      setListings(formattedListings);

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
      
      const ethPriceUSD = 2000; 
      const priceInEth = listingPrice / ethPriceUSD;
      const priceInWei = ethers.parseEther(priceInEth.toString());
      
      const tx = await contract.listForSale(propertyId, listingAmount, priceInWei);
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
    // const { addNotification } = useNotification(); // Already declared at the top of the hook
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
      
      const listingsData = await contract.getListings(propertyId); // Renamed to avoid conflict
      if (listingIndex >= listingsData.length) {
        throw new Error("Invalid listing index");
      }
      
      const listing = listingsData[listingIndex];
      const seller = listing.seller;
      const numTokensToBuy = listing.tokenAmount;
      const pricePerTokenWei = listing.pricePerToken; // Already in wei

      // Calculate total cost in wei
      const totalCostWei = numTokensToBuy * pricePerTokenWei;

      console.log(`Buying ${ethers.formatUnits(numTokensToBuy, 0)} tokens from listing #${listingIndex}`);
      console.log(`Price per token (wei from contract): ${pricePerTokenWei.toString()}`);
      console.log(`Total cost in wei (tx.value): ${totalCostWei.toString()}`);
      console.log(`Seller: ${seller}`);

      const tx = await contract.buyFromListing(propertyId, listingIndex, {
        value: totalCostWei // Use the correct ETH value in Wei
      });
      
      const receipt = await tx.wait();
      
      setSuccess(`Successfully purchased ${ethers.formatUnits(numTokensToBuy, 0)} tokens from listing #${listingIndex + 1}.`);
      
      const currentTimestamp = new Date().toISOString();
     
      const totalCostForNotification = ethers.formatEther(totalCostWei); 

      if (seller && seller.toLowerCase() !== account.toLowerCase()) { 
        const notificationForSeller = { 
          type: 'TOKEN_SOLD_IN_RESALE', 
          propertyId: propertyId,
          tokenAmount: Number(numTokensToBuy),
          buyerAddress: account, 
          totalCost: totalCostForNotification, 
          timestamp: currentTimestamp,
          propertyName: property?.title || `Property #${propertyId + 1}`
        };
        addNotification(notificationForSeller, seller);
        console.log(`Notification sent to seller ${seller}:`, notificationForSeller);
      }

      // --- Add Notification for Buyer ---
      const notificationForBuyer = {
        type: 'PURCHASE_CONFIRMATION_RESALE',
        propertyId: propertyId,
        tokenAmount: Number(numTokensToBuy),
        buyerAddress: account, 
        sellerAddress: seller,
        totalCost: totalCostForNotification,
        timestamp: currentTimestamp,
        propertyName: property?.title || `Property #${propertyId + 1}`,
        transactionHash: receipt.hash
      };
      addNotification(notificationForBuyer, account);
      console.log('Notification sent to buyer:', notificationForBuyer);

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