"use client";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../hooks/usewallet";
import Image from 'next/image'; 
import RealEstateTokenFactoryABI from "../../../contracts/RealEstateTokenFactoryABI.json";
import PropertyTokenABI from "../../../contracts/PropertyTokenABI.json";
import contractAddress from "../../../contracts/contract-address.json";

interface PropertyBuyProps {
  propertyId: number;
}

export default function PropertyBuy({ propertyId }: PropertyBuyProps) {
  const { account } = useWallet();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null); 
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [pricePerToken, setPricePerToken] = useState<number>(50);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [propertyDetails, setPropertyDetails] = useState<{
    tokenAddress: string;
    pricePerToken: string;
    availableTokens: number;
    totalTokens: number;
    imageCID?: string; 
  } | null>(null);

  // Initialize provider
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Create provider from window.ethereum
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
        } catch (err) {
          console.error("Failed to initialize provider:", err);
        }
      }
    };

    initProvider();
  }, []);

  // Calculate total purchase value
  const totalValue = tokenAmount * pricePerToken;

  // Fetch property details and user's token balance
  useEffect(() => {
    const fetchPropertyAndBalance = async () => {
      if (!provider) return;

      try {
        setIsLoadingBalance(true);

        // Get the factory contract
        const factoryContract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          provider
        );

        // Get the property details
        const properties = await factoryContract.getProperties();

        if (propertyId >= properties.length) {
          throw new Error("Property not found");
        }

        const property = properties[propertyId];
        setPropertyDetails({
          tokenAddress: property.tokenAddress,
          pricePerToken: ethers.formatUnits(property.pricePerToken, 18),
          availableTokens: property.availableTokens.toNumber(),
          totalTokens: property.totalTokens.toNumber(),
          imageCID: property.propertyImageURL, // Fetch image CID
        });

        // Set the price per token from the contract
        setPricePerToken(
          parseFloat(ethers.formatUnits(property.pricePerToken, 18))
        );

        // If account is connected, fetch token balance
        if (account) {
          const tokenContract = new ethers.Contract(
            property.tokenAddress,
            PropertyTokenABI,
            provider
          );

          const balance = await tokenContract.balanceOf(account);
          const decimals = await tokenContract.decimals();

          // Convert from token units to token count
          const balanceInTokens = parseFloat(
            ethers.formatUnits(balance, decimals)
          );
          setTokenBalance(balanceInTokens);
        }
      } catch (err: unknown) {
        console.error("Error fetching property details:", err);
        setError(
          (err as Error).message ||
            "Failed to fetch property details. Please try again."
        );
      } finally {
        setIsLoadingBalance(false);
      }
    };
    fetchPropertyAndBalance();
  }, [account, provider, propertyId, success]);

  const handleBuyTokens = async () => {
    if (!account || !provider || !propertyDetails) {
      setError("Please connect your wallet first");
      return;
    }

    if (tokenAmount <= 0) {
      setError("Token amount must be greater than 0");
      return;
    }

    if (tokenAmount > propertyDetails.availableTokens) {
      setError(
        `Only ${propertyDetails.availableTokens} tokens available for purchase`
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // Get signer from provider
      const signer = await provider.getSigner();

      // Get the factory contract
      const factoryContract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );

      const ethRate = 2000; // 1 ETH = $2000
      const ethCost = totalValue / ethRate;
      
      // Add a 10% buffer to ensure enough ETH is sent
      const ethCostWithBuffer = ethCost * 1.1;
      const ethCostWei = ethers.parseEther(ethCostWithBuffer.toFixed(18));
  
      // Call the buyFromSale function instead of buyTokens
      const tx = await factoryContract.buyFromSale(propertyId, tokenAmount, {
        value: ethCostWei,
      });
  
      // Wait for transaction to be mined
      await tx.wait();
  
      setSuccess(true);
      setTokenAmount(1);
      
      // Send notification to property owner
      try {
        // Get property owner address
        const propertyOwner = await factoryContract.getPropertyOwner(propertyId);
        
        // Create notification data
        const notificationData = {
          type: 'TOKEN_PURCHASE',
          propertyId: propertyId,
          tokenAmount: tokenAmount,
          buyerAddress: account,
          totalCost: ethers.formatEther(ethCostWei),
          timestamp: new Date().toISOString(),
          propertyName: `Property ${propertyId + 1}`
        };
        
        // Store notification in localStorage
        const existingNotifications = JSON.parse(localStorage.getItem('propertyNotifications') || '{}');
        
        if (!existingNotifications[propertyOwner]) {
          existingNotifications[propertyOwner] = [];
        }
        
        existingNotifications[propertyOwner].push(notificationData);
        localStorage.setItem('propertyNotifications', JSON.stringify(existingNotifications));
        
        console.log(`Notification sent to property owner ${propertyOwner}`);
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't fail the transaction if notification fails
      }
    } catch (err: unknown) {
      console.error("Error buying tokens:", err);
      setError(
        (err as Error).message || "Failed to buy tokens. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Buy Property Tokens
      </h2>

      {propertyDetails?.imageCID && (
        <div className="mb-4">
          <Image
            src={`https://gateway.pinata.cloud/ipfs/${propertyDetails.imageCID}`}
            alt="Property Image"
            width={600}
            height={400}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-300 mb-2">
          Your Balance:{" "}
          {isLoadingBalance ? "Loading..." : `${tokenBalance} tokens`}
        </p>
        <p className="text-gray-300 mb-4">
          Purchase tokens to own a share of this property.
        </p>
      </div>

      {propertyDetails && (
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Available tokens:</span>
            <span className="text-white">
              {propertyDetails.availableTokens} / {propertyDetails.totalTokens}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Price per token:</span>
            <span className="text-white">
              ${parseFloat(propertyDetails.pricePerToken).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="tokenAmount"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Number of Tokens to Buy
        </label>
        <input
          type="number"
          id="tokenAmount"
          value={tokenAmount}
          onChange={(e) =>
            setTokenAmount(Math.max(1, parseInt(e.target.value) || 0))
          }
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
          min="1"
          max={propertyDetails?.availableTokens || 1}
        />
      </div>

      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Number of tokens:</span>
          <span className="text-white">{tokenAmount}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Price per token:</span>
          <span className="text-white">${pricePerToken.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-600">
          <span className="text-gray-300 font-medium">Total cost:</span>
          <span className="text-white font-bold">${totalValue.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4">
          Successfully purchased {tokenAmount} tokens!
        </div>
      )}

      <button
        onClick={handleBuyTokens}
        disabled={
          isLoading ||
          !account ||
          !propertyDetails ||
          propertyDetails.availableTokens <= 0
        }
        className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center
          ${
            !account || !propertyDetails || propertyDetails.availableTokens <= 0
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          }`}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : !account ? (
          "Connect Wallet to Buy"
        ) : !propertyDetails || propertyDetails.availableTokens <= 0 ? (
          "No Tokens Available"
        ) : (
          "Buy Tokens"
        )}
      </button>
    </div>
  );
}
