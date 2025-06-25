import { ethers } from "ethers";
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import PropertyTokenABI from '../../../contracts/PropertyTokenABI.json';
import contractAddress from '../../../contracts/contract-address.json'
import axios from "axios";

const PINATA_API_KEY = "f5151a020e32a782a73e";
const PINATA_SECRET_API_KEY = "d2fd4c05e87d7ff481eb8cb45272f01427726658e8e2644114b8082a596b5008";

// ABI for RealEstateTokenFactory contract
const factoryABI = RealEstateTokenFactoryABI;

// ABI for PropertyToken contract
const tokenABI = PropertyTokenABI;
// Contract address for RealEstateTokenFactory contract
const FACTORY_CONTRACT_ADDRESS = contractAddress.RealEstateTokenFactory;

// Get contract instance
export const getFactoryContract = async (needSigner = false) => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not available");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);

  if (needSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, signer);
  }

  return new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, provider);
};

// Get token contract instance
export const getTokenContract = async (tokenAddress, needSigner = false) => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not available");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  if (needSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(tokenAddress, tokenABI, signer);
  }

  return new ethers.Contract(tokenAddress, tokenABI, provider);
};

// Get all properties
export const getAllProperties = async () => {
  try {
    const contract = await getFactoryContract();
    const [propertyAddresses, values, tokenAddresses, propertyImageURLs] = await contract.getProperties();

    // Create an array of property objects from the separate arrays
    const properties = [];
    for (let i = 0; i < propertyAddresses.length; i++) {
      properties.push({
        id: i,
        address: propertyAddresses[i],
        value: ethers.formatUnits(values[i], 18), // Format with 18 decimals
        tokenAddress: tokenAddresses[i],
        images: propertyImageURLs[i] ? 
          propertyImageURLs[i].map(url => 
            url.startsWith('http') ? url : `https://gateway.pinata.cloud/ipfs/${url}`
          ) : []
      });
    }

    return properties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

// Buy tokens from initial sale
export const buyTokensFromSale = async (propertyId, tokenAmount) => {
  try {
    if (!tokenAmount || tokenAmount <= 0) {
      throw new Error("Token amount must be greater than 0");
    }

    const contract = await getFactoryContract(true);
    
    // Calculate cost exactly as the contract expects
    // $50 per token converted to wei (10^18)
    const tokenPriceWei = ethers.parseUnits("50", 18);
    const totalCost = tokenPriceWei * BigInt(tokenAmount);

    console.log(`Buying ${tokenAmount} tokens for property #${propertyId}`);
    console.log(`Total cost: ${ethers.formatEther(totalCost)} ETH`);
    
    const tx = await contract.buyFromSale(propertyId, tokenAmount, {
      value: totalCost,
    });

    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenAmount: tokenAmount
    };
  } catch (error) {
    console.error("Error buying tokens from sale:", error);
    throw error;
  }
};

// Enhanced function to buy tokens from a listing
export const buyTokensFromListingV2 = async (propertyId, listingIndex) => {
  try {
    const contract = await getFactoryContract(true);
    const listings = await contract.getListings(propertyId);
    
    if (listingIndex >= listings.length) {
      throw new Error("Invalid listing index");
    }
    
    const listing = listings[listingIndex];
    
    // Calculate total cost
    const tokenAmount = Number(listing.tokenAmount);
    const pricePerToken = ethers.formatUnits(listing.pricePerToken, 18);
    const totalCostUSD = tokenAmount * Number(pricePerToken);
    
    // Convert USD to ETH
    const ethRate = await getEthToUsdRate();
    const costInEth = totalCostUSD / ethRate;
    const totalCost = ethers.parseEther(costInEth.toString());

    console.log(`Buying ${tokenAmount} tokens from listing #${listingIndex}`);
    console.log(`Total cost: $${totalCostUSD} (${costInEth} ETH)`);
    
    const tx = await contract.buyFromListing(propertyId, listingIndex, {
      value: totalCost,
    });
    
    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenAmount: tokenAmount,
      seller: listing.seller
    };
  } catch (error) {
    console.error("Error buying tokens from listing:", error);
    throw error;
  }
};

// Get user token balance
export const getUserTokenBalance = async (propertyId, userAddress) => {
  try {
    const contract = await getFactoryContract();
    const [ tokenAddresses] = await contract.getProperties();

    if (propertyId >= tokenAddresses.length) {
      throw new Error("Invalid property ID");
    }

    const tokenAddress = tokenAddresses[propertyId];
    const tokenContract = await getTokenContract(tokenAddress);

    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();

    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
};

// Get current user address
export const getCurrentUserAddress = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not available");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return await signer.getAddress();
};

// List tokens for sale from profile page
export const listTokensForSaleFromProfile = async (propertyId, tokenAmount, pricePerToken) => {
  try {
    if (!tokenAmount || tokenAmount <= 0) {
      throw new Error("Token amount must be greater than 0");
    }
    
    if (!pricePerToken || pricePerToken <= 0) {
      throw new Error("Price per token must be greater than 0");
    }
    
    const contract = await getFactoryContract(true);
    
    // Convert price to wei (assuming price is in USD)
    const priceInWei = ethers.parseEther(pricePerToken.toString());
    
    // Get token contract to approve transfer
    const [ tokenAddresses] = await contract.getProperties();
    
    if (propertyId >= tokenAddresses.length) {
      throw new Error("Invalid property ID");
    }
    
    const tokenAddress = tokenAddresses[propertyId]; 
    const tokenContract = await getTokenContract(tokenAddress, true);
    
    // Get token decimals and calculate approval amount correctly
    const decimals = await tokenContract.decimals();
    const approvalAmount = BigInt(tokenAmount) * BigInt(10 ** Number(decimals));
    
    // Approve the factory contract to transfer tokens
    await tokenContract.approve(FACTORY_CONTRACT_ADDRESS, approvalAmount);
    
    // Call the listForSale function
    const tx = await contract.listForSale(propertyId, tokenAmount, priceInWei);
    
    // Wait for transaction to be mined
    return await tx.wait();
  } catch (error) {
    console.error("Error listing tokens for sale:", error);
    throw error;
  }
};

// Buy tokens from a listing
export const buyTokensFromListing = async (propertyId, listingIndex) => {
  try {
    const contract = await getFactoryContract(true);
    const listings = await contract.getListings(propertyId);
    
    if (listingIndex >= listings.length) {
      throw new Error("Invalid listing index");
    }
    
    const listing = listings[listingIndex];
    
    // Use the exact price from the listing
    const totalCost = listing.tokenAmount * listing.pricePerToken;

    const tx = await contract.buyFromListing(propertyId, listingIndex, {
      value: totalCost,
    });
    return await tx.wait();
  } catch (error) {
    console.error("Error buying tokens from listing:", error);
    throw error;
  }
};

// Fetch active listings for a property
export const getActiveListings = async (propertyId) => {
  try {
    const contract = await getFactoryContract();
    const listings = await contract.getListings(propertyId);

    return listings.map((listing, index) => ({
      id: index,
      seller: listing.seller,
      tokenAmount: Number(listing.tokenAmount),
      pricePerToken: ethers.formatEther(listing.pricePerToken),
    }));
  } catch (error) {
    console.error("Error fetching active listings:", error);
    throw error;
  }
};

// Fetch buyers for a property
export const getPropertyBuyers = async (propertyId) => {
  try {
    const contract = await getFactoryContract();
    return await contract.getBuyers(propertyId);
  } catch (error) {
    console.error("Error fetching property buyers:", error);
    throw error;
  }
};

// Fetch buyer information
export const getBuyerInfo = async (propertyId, userAddress) => {
  try {
    const contract = await getFactoryContract();
    const tokensBought = await contract.getBuyerInfo(propertyId, userAddress);
    return ethers.formatUnits(tokensBought, 0);
  } catch (error) {
    console.error("Error fetching buyer info:", error);
    throw error;
  }
};

// Update the uploadToIPFS function to handle both single files and arrays
export const uploadToIPFS = async (files) => {
  try {
    // Convert to array if a single file is passed
    const fileArray = Array.isArray(files) ? files : [files];
    console.log('Files to upload to IPFS:', fileArray);

    // Create FormData for Pinata API
    const formData = new FormData();
    fileArray.forEach((file) => {
      formData.append('file', file);
    });

    // Upload to Pinata
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data;`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    // Return the IPFS hash
    return `${res.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};
// Fetch featured properties
export const getFeaturedProperties = async (limit = 3) => {
  try {
    const allProperties = await getAllProperties();
    
    // Sort properties by some criteria (e.g., value) and take the top ones
    const sortedProperties = allProperties.sort((a, b) => 
      parseFloat(b.value) - parseFloat(a.value)
    );
    
    return sortedProperties.slice(0, limit);
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    throw error;
  }
};

// Unified function to list tokens for sale from any page
export const listTokensForSale = async (propertyId, tokenAmount, pricePerToken) => {
  try {
    if (!tokenAmount || tokenAmount <= 0) {
      throw new Error("Token amount must be greater than 0");
    }
    
    if (!pricePerToken || pricePerToken <= 0) {
      throw new Error("Price per token must be greater than 0");
    }
    
    const contract = await getFactoryContract(true);
    
    // Get property details to find token address
    const [propertyAddresses, tokenAddresses] = await contract.getProperties();
    
    if (propertyId >= propertyAddresses.length) {
      throw new Error("Invalid property ID");
    }
    
    const tokenAddress = tokenAddresses[propertyId];
    
    // Get token contract
    const tokenContract = await getTokenContract(tokenAddress, true);
    
    // Convert price to wei directly (no USD conversion needed)
    const priceInWei = ethers.parseUnits(pricePerToken.toString(), 18);
    
    // Get token decimals
    const decimals = await tokenContract.decimals();
    
    // Calculate token amount in smallest units
    const tokenAmountWithDecimals = BigInt(tokenAmount) * BigInt(10 ** Number(decimals));
    
    // Approve the factory contract to transfer tokens
    await tokenContract.approve(FACTORY_CONTRACT_ADDRESS, tokenAmountWithDecimals);
    
    // Call the listForSale function
    const tx = await contract.listForSale(propertyId, tokenAmount, priceInWei);
    
    // Wait for transaction to be mined
    return await tx.wait();
  } catch (error) {
    console.error("Error listing tokens for sale:", error);
    throw error;
  }
};

// Get pending properties for admin dashboard
export const getPendingProperties = async () => {
  try {
    console.log("Getting pending properties from contract...");
    const contract = await getFactoryContract();
    const pendingProps = await contract.getPendingProperties();
    
    console.log("Total pending properties in contract:", pendingProps.length);
    
    if (!pendingProps || pendingProps.length === 0) {
      console.log("No pending properties found in contract");
      return [];
    }
    
    // Format the pending properties
    const formattedPendingProps = pendingProps[1].map((prop, index) => {
      // Add null checks for each property
      if (!prop) return null;
      // Check if value exists before formatting
      const formattedValue = prop.value ? ethers.formatUnits(prop.value, 18) : '0';
      // Format image and document URLs
      const processedImageURLs = (prop.propertyImageURLs || []).map((url) =>
        typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')) ? url : `https://gateway.pinata.cloud/ipfs/${url}`
      );
      const processedDocumentURLs = (prop.documentURLs || []).map((url) =>
        typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')) ? url : `https://gateway.pinata.cloud/ipfs/${url}`
      );
      return {
        index,
        propertyAddress: prop.propertyAddress || '',
        value: formattedValue,
        originalOwner: prop.originalOwner || '',
        propertyImageURLs: processedImageURLs,
        documentURLs: processedDocumentURLs,
        approved: prop.approved || false,
        exists: prop.exists || false,
        contractIndex: pendingProps[0][index], // Use the correct index from the IDs array
        // Map all additional fields from the contract struct
        title: prop.title || '',
        description: prop.description || '',
        propertyType: prop.propertyType || '',
        apartmentType: prop.apartmentType || '',
        bedrooms: prop.bedrooms !== undefined ? Number(prop.bedrooms) : '',
        bathrooms: prop.bathrooms !== undefined ? Number(prop.bathrooms) : '',
        area: prop.area !== undefined ? Number(prop.area) : '',
        yearBuilt: prop.yearBuilt !== undefined ? Number(prop.yearBuilt) : '',
        city: prop.city || '',
        state: prop.state || '',
        zipCode: prop.zipCode || '',
        amenities: prop.amenities || [],
      };
    }).filter(Boolean); // Remove null entries
    
    console.log("Received properties:", formattedPendingProps);
    return formattedPendingProps;
  } catch (error) {
    console.error("Error fetching pending properties:", error);
    throw error;
  }
};

// Get all listings across properties
export const getAllListings = async () => {
  try {
    const contract = await getFactoryContract();
    const [propertyAddresses, values, tokenAddresses] = await contract.getProperties();
    
    const allListings = [];
    
    for (let i = 0; i < propertyAddresses.length; i++) {
      const listings = await contract.getListings(i);
      
      if (listings && listings.length > 0) {
        for (let j = 0; j < listings.length; j++) {
          allListings.push({
            propertyId: i,
            propertyAddress: propertyAddresses[i],
            tokenAddress: tokenAddresses[i],
            value: ethers.formatUnits(values[i], 18),
            listingIndex: j,
            seller: listings[j].seller,
            tokenAmount: Number(listings[j].tokenAmount),
            pricePerToken: ethers.formatUnits(listings[j].pricePerToken, 18)
          });
        }
      }
    }
    
    console.log("All listings:", allListings);
    return allListings;
  } catch (error) {
    console.error("Error fetching all listings:", error);
    throw error;
  }
};

// Approve property
export const approvePropertyContract = async (pendingIndex) => {
  try {
    const contract = await getFactoryContract(true);
    const tx = await contract.approveAndTokenizeProperty(pendingIndex);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error approving property:", error);
    throw error;
  }
};

// Reject property
export const rejectPropertyContract = async (pendingIndex) => {
  try {
    const contract = await getFactoryContract(true);
    const tx = await contract.disapproveProperty(pendingIndex);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error rejecting property:", error);
    throw error;
  }
};

// Check if user is admin
export const isAdmin = async (userAddress) => {
  try {
    if (!userAddress) {
      console.error("No user address provided");
      return false;
    }
    
    const contract = await getFactoryContract();
    const ownerAddress = await contract.owner();
    
    console.log("Contract owner:", ownerAddress);
    console.log("Current user:", userAddress);
    
    // Ensure case-insensitive comparison of Ethereum addresses
    return ownerAddress.toLowerCase() === userAddress.toLowerCase();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Add a new function to check admin status with better error handling
export const checkAdminStatus = async (userAddress) => {
  try {
    if (!userAddress) {
      console.error("No user address provided");
      return false;
    }
    
    const contract = await getFactoryContract();
    const ownerAddress = await contract.owner();
    
    // Simple direct comparison without string conversion
    const isOwner = ownerAddress.toLowerCase() === userAddress.toLowerCase();
    console.log("Admin check result:", isOwner);
    return isOwner;
  } catch (error) {
    console.error("Error in checkAdminStatus:", error);
    return false;
  }
};

// Submit property for approval
export const submitProperty = async (propertyAddress, valueUSD, imageUrls) => {
  try {
    const contract = await getFactoryContract(true);
    
    // Submit property for approval
    const tx = await contract.submitPropertyForApproval(
      propertyAddress,
      valueUSD,
      imageUrls
    );
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      success: true,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error("Error submitting property:", error);
    throw error;
  }
};

// Get ETH to USD conversion rate (mock implementation)
export const getEthToUsdRate = async () => {
  try {
    // In a real implementation, you would fetch this from an API
    // For now, we'll return a fixed rate
    return 2000; // 1 ETH = $2000 USD
  } catch (error) {
    console.error("Error fetching ETH to USD rate:", error);
    return 2000; // Default fallback
  }
};

// Calculate ETH amount from USD
export const calculateEthFromUsd = async (usdAmount) => {
  const ethRate = await getEthToUsdRate();
  return usdAmount / ethRate;
};

// Format image URL (helper function)
export const formatImageUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://gateway.pinata.cloud/ipfs/${url}`;
};

// Get the most recently created property
export const getLatestProperty = async () => {
  try {
    const properties = await getAllProperties();
    if (properties.length === 0) {
      throw new Error("No properties found");
    }
    
    // Return the last property in the array (most recently created)
    return properties[properties.length - 1];
  } catch (error) {
    console.error("Error fetching latest property:", error);
    throw error;
  }
};

// Navigate to property owner profile
export const navigateToOwnerProfile = async (propertyId) => {
  try {
    const contract = await getFactoryContract();
    const pendingProps = await contract.getPendingProperties();
    
    // Find the property with the matching ID
    const property = pendingProps.find(prop => prop.id === propertyId);
    if (!property) {
      throw new Error(`Property with ID ${propertyId} not found`);
    }
    
    // Return the owner's address
    return property.originalOwner;
  } catch (error) {
    console.error("Error navigating to owner profile:", error);
    throw error;
  }
};

// Get properties submitted by a specific user
export const getUserSubmittedProperties = async (userAddress) => {
  try {
    const contract = await getFactoryContract();
    
    // Get all pending properties
    const pendingProps = await contract.getPendingProperties();
    const pendingProperties = pendingProps[1].map((prop, index) => {
      if (!prop) return null;
      
      const formattedValue = prop.value ? ethers.formatUnits(prop.value, 18) : '0';
      
      return {
        id: index,
        propertyAddress: prop.propertyAddress || '',
        value: formattedValue,
        originalOwner: prop.originalOwner || '',
        propertyImageURLs: prop.propertyImageURLs || [],
        approved: prop.approved || false,
        exists: prop.exists || false,
        contractIndex: pendingProps[0][index],
        status: 'pending'
      };
    }).filter(Boolean);
    
    // Get all approved properties
    const [
      propertyAddresses,
      values,
      tokenAddresses,
      propertyImageURLs,
      documentURLs,
      originalOwners,
      ,
      ,
      ,
      ,
      bedrooms,
      bathrooms,
      ,
      ,
      ,
      ,
      ,
      
    ] = await contract.getProperties();

    const approvedProperties = [];
    for (let i = 0; i < propertyAddresses.length; i++) {
      approvedProperties.push({
        id: i,
        propertyAddress: propertyAddresses[i],
        value: ethers.formatUnits(values[i], 18),
        tokenAddress: tokenAddresses[i],
        propertyImageURLs: propertyImageURLs[i] || [],
        documentURLs: documentURLs[i] || [],
        originalOwner: originalOwners ? originalOwners[i] : '',
        bedrooms: bedrooms[i] !== undefined ? Number(bedrooms[i]) : 0,
        bathrooms: bathrooms[i] !== undefined ? Number(bathrooms[i]) : 0,
        status: 'approved'
      });
    }
    
    let rejectedProperties = [];
    try {
      // Check if the contract has a method to get rejected properties
      if (contract.getRejectedProperties) {
        const rejected = await contract.getRejectedProperties();
        rejectedProperties = rejected.map((prop, index) => ({
          id: index,
          propertyAddress: prop.propertyAddress || '',
          value: prop.value ? ethers.formatUnits(prop.value, 18) : '0',
          originalOwner: prop.originalOwner || '',
          propertyImageURLs: prop.propertyImageURLs || [],
          status: 'rejected'
        }));
      }
    } catch (err) {
      console.log("Contract doesn't support getRejectedProperties or other error:", err);
    }
    
    // Filter properties by user address
    const userPendingProperties = pendingProperties.filter(
      prop => prop.originalOwner && prop.originalOwner.toLowerCase() === userAddress.toLowerCase()
    );
    
    const userApprovedProperties = approvedProperties.filter(
      prop => prop.originalOwner && typeof prop.originalOwner === 'string' && prop.originalOwner.toLowerCase() === userAddress.toLowerCase()
    );
    
    const userRejectedProperties = rejectedProperties.filter(
      prop => prop.originalOwner && typeof prop.originalOwner === 'string' && prop.originalOwner.toLowerCase() === userAddress.toLowerCase()
    );
    
    // Combine all user properties
    return [...userPendingProperties, ...userApprovedProperties, ...userRejectedProperties];
  } catch (error) {
    console.error("Error fetching user submitted properties:", error);
    return [];
  }
};
