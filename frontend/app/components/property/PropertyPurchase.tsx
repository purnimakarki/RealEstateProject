'use client';
import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/usewallet';
import { buyTokensFromSale, buyTokensFromListing, getUserTokenBalance } from '../utils/contractInteraction';
import { DollarSign, Wallet, AlertCircle, Check } from 'lucide-react';

interface PropertyPurchaseProps {
  propertyId: number;
  propertyPrice: number;
  tokenAddress: string;
  listingIndex?: number; 
  listingPrice?: number;
  listingTokenAmount?: number;
  purchaseType: 'sale' | 'listing';
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export default function PropertyPurchase({
  propertyId,
  propertyPrice,
  listingIndex,
  listingPrice,
  listingTokenAmount,
  purchaseType,
  onSuccess,
  onError
}: PropertyPurchaseProps) {
  const { account } = useWallet();
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
 
  const [userBalance, setUserBalance] = useState<number>(0);
  const [ethPrice] = useState<number>(2000); 
  
  // Calculate token price based on property value
  const tokenPrice = purchaseType === 'sale' ? 50 : listingPrice || 50; // Default $50 per token
  const totalTokens = Math.floor(propertyPrice / 50);
  const maxTokens = purchaseType === 'listing' ? (listingTokenAmount || 1) : totalTokens;
  
  // Fetch user's token balance
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!account || propertyId === undefined) return;
      
      try {
        const balance = await getUserTokenBalance(propertyId, account);
        setUserBalance(Number(balance));
      } catch (err) {
        console.error("Error fetching user balance:", err);
      }
    };
    
    fetchUserBalance();
  }, [account, propertyId, transactionHash]);
  
  // Handle purchase
  const handlePurchase = async () => {
    if (!account || tokenAmount <= 0 || propertyId === undefined) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      let result;
      
      if (purchaseType === 'sale') {
        // Buy from initial sale
        result = await buyTokensFromSale(propertyId, tokenAmount);
      } else if (purchaseType === 'listing' && listingIndex !== undefined) {
        // Buy from listing
        result = await buyTokensFromListing(propertyId, listingIndex);
      } else {
        throw new Error("Invalid purchase type or missing listing index");
      }
      
      setTransactionHash(result.transactionHash);
      
      if (onSuccess) onSuccess(result);
      
    } catch (err: any) {
      console.error("Error purchasing tokens:", err);
      setError(err.message || "Failed to purchase tokens. Please try again.");
      
      // Call error callback if provided
      if (onError) onError(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Calculate total cost
  const totalCost = tokenAmount * tokenPrice;
  const ethCost = totalCost / ethPrice;
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-8 border border-gray-800 shadow-lg shadow-blue-900/10 text-white">
      <h2 className="text-xl font-semibold mb-4">
        {purchaseType === 'sale' ? 'Invest in This Property' : 'Buy Tokens from Listing'}
      </h2>
      
      <div className="mb-4">
        <p className="text-gray-300 mb-2">
          {purchaseType === 'sale' 
            ? `This property has been tokenized into ${totalTokens} tokens.`
            : `This listing offers ${maxTokens} tokens for sale.`}
        </p>
        <div className="flex items-center gap-2 text-blue-400">
          <DollarSign size={20} />
          <span className="font-semibold">${tokenPrice.toFixed(2)} per token</span>
        </div>
      </div>
      
      {account ? (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tokenAmount" className="font-medium text-gray-300">
                Number of Tokens
              </label>
              <div className="text-sm text-gray-400 flex items-center gap-1">
                <Wallet size={16} />
                <span>Your Balance: {userBalance} tokens</span>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                id="tokenAmount"
                min="1"
                max={maxTokens}
                value={tokenAmount}
                onChange={(e) => setTokenAmount(Number(e.target.value))}
                className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
                disabled={purchaseType === 'listing'}
              />
              {purchaseType === 'sale' && (
                <>
                  <button
                    onClick={() => setTokenAmount(1)}
                    className="px-3 py-2 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
                  >
                    Min
                  </button>
                  <button
                    onClick={() => setTokenAmount(10)}
                    className="px-3 py-2 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
                  >
                    10
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-gray-800 rounded-md border border-gray-700">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Cost for {tokenAmount} tokens</span>
              <span className="font-semibold text-blue-400">
                ${totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-sm text-gray-400">
              <span>Estimated ETH:</span>
              <span>{ethCost.toFixed(6)} ETH</span>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-md text-sm text-red-300">
              {error}
            </div>
          )}
          
          {transactionHash && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-800/50 rounded-md text-sm flex items-start gap-2">
              <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-medium">Purchase successful!</p>
                <p className="text-gray-400 text-xs mt-1 break-all">
                  Transaction: {transactionHash}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={handlePurchase}
            disabled={isProcessing || tokenAmount <= 0}
            className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${
              isProcessing || tokenAmount <= 0
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900'
            }`}
          >
            {isProcessing ? 'Processing...' : `Buy ${tokenAmount} Tokens`}
          </button>
          
          <div className="mt-3 text-xs text-gray-400 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              Token purchases are final and non-refundable. The value of tokens may fluctuate 
              based on market conditions. Please invest responsibly.
            </p>
          </div>
        </>
      ) : (
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.ethereum) {
              window.ethereum.request({ method: 'eth_requestAccounts' });
            } else {
              console.error('Ethereum provider not found');
            }
          }}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
        >
          Connect Wallet to Invest
        </button>
      )}
    </div>
  );
}