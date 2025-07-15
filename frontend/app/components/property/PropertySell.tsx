'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/usewallet';

import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json'
import PropertyTokenABI from "../../../contracts/PropertyTokenABI.json";
import contractAddress from '../../../contracts/contract-address.json';

interface PropertySellProps {
  propertyId: number;
}

export default function PropertySell({ propertyId }: PropertySellProps) {
  const { account, provider } = useWallet(); 
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [pricePerToken, setPricePerToken] = useState<number>(50);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  
  // Calculate total sale value
  const totalValue = tokenAmount * pricePerToken;
  
  // Fetch user's token balance for this property
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!account || !provider) return;
      
      try {
        setIsLoadingBalance(true);
        
        // Get the factory contract
        const factoryContract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          provider
        );
        
        // Get the property details to find the token address
        const [propertyAddresses, tokenAddresses] = await factoryContract.getProperties();
        const propertyTokenAddress = tokenAddresses[propertyId];
        
        if (propertyId >= propertyAddresses.length) {
          throw new Error("Property not found");
        }
        
        // Get the token contract
        const tokenContract = new ethers.Contract(
          propertyTokenAddress,
          PropertyTokenABI,
          provider
        );
        
        // Get user's token balance
        const balance = await tokenContract.balanceOf(account);
        const decimals = await tokenContract.decimals();
        
        // Convert from token units to token count
        const balanceInTokens = parseFloat(ethers.formatUnits(balance, decimals));
        setTokenBalance(balanceInTokens);
      } catch (err: Error | unknown) {
        console.error("Error fetching token balance:", err);
        setTokenBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };    
    fetchTokenBalance();
  }, [account, provider, propertyId, success]);
  
  const handleListForSale = async () => {
    if (!account || !provider) {
      setError("Please connect your wallet first");
      return;
    }
    
    if (tokenAmount <= 0) {
      setError("Token amount must be greater than 0");
      return;
    }
    
    if (pricePerToken <= 0) {
      setError("Price per token must be greater than 0");
      return;
    }
    
    if (tokenAmount > tokenBalance) {
      setError("You don't have enough tokens");
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
      
      // Get the property details to find the token address
      const properties = await factoryContract.getProperties();
      const propertyTokenAddress = properties[3][propertyId]; // Using index 3 for tokenAddresses
      
      // Get the token contract
      const tokenContract = new ethers.Contract(
        propertyTokenAddress,
        PropertyTokenABI,
        signer
      );
      
      // Approve the factory contract to spend tokens
      const decimals = await tokenContract.decimals();
      const tokenAmountWithDecimals = ethers.parseUnits(tokenAmount.toString(), decimals);
      
      // First approve the tokens
      const approveTx = await tokenContract.approve(
        contractAddress.RealEstateTokenFactory,
        tokenAmountWithDecimals
      );
      await approveTx.wait();
      
      // Then list for sale
      const listTx = await factoryContract.listForSale(
        propertyId,
        tokenAmount,
        ethers.parseUnits(pricePerToken.toString(), 18) // Price in wei
      );
      
      // Wait for transaction to be mined
      await listTx.wait();
      
      setSuccess(true);
      setTokenAmount(1);
      setPricePerToken(50);
      
      // Explicitly return to prevent any further execution
      return;
    } catch (err: Error | unknown) {
      console.error("Error listing tokens for sale:", err);
      setError(err instanceof Error ? err.message : "Failed to list tokens for sale. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Sell Your Property Tokens</h2>
      
      <div className="mb-4">
        <p className="text-gray-300 mb-2">Your Balance: {isLoadingBalance ? 'Loading...' : `${tokenBalance} tokens`}</p>
        <p className="text-gray-300 mb-4">List your property tokens for sale on the marketplace.</p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-300 mb-1">
          Number of Tokens to Sell
        </label>
        <input
          type="number"
          id="tokenAmount"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(Math.max(1, parseInt(e.target.value) || 0))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
          min="1"
          max={tokenBalance}
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="pricePerToken" className="block text-sm font-medium text-gray-300 mb-1">
          Price Per Token (USD)
        </label>
        <input
          type="number"
          id="pricePerToken"
          value={pricePerToken}
          onChange={(e) => setPricePerToken(Math.max(1, parseInt(e.target.value) || 0))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
          min="1"
        />
      </div>
      
      <div className="bg-gray-700 p-4 rounded-lg mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Number of tokens:</span>
          <span className="text-white">{tokenAmount}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-300">Price per token:</span>
          <span className="text-white">${pricePerToken}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-600">
          <span className="text-gray-300 font-medium">Total value:</span>
          <span className="text-white font-bold">${totalValue}</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4">
          Successfully listed {tokenAmount} tokens for sale!
        </div>
      )}
      
      <button
        onClick={handleListForSale}
        disabled={isLoading || !account || tokenBalance <= 0}
        className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center
          ${!account || tokenBalance <= 0
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
          }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : !account ? (
          'Connect Wallet to Sell'
        ) : tokenBalance <= 0 ? (
          'No Tokens to Sell'
        ) : (
          'List Tokens for Sale'
        )}
      </button>
    </div>
  );
}
