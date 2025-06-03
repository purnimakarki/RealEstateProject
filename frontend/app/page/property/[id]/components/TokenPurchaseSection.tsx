'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Wallet, Info, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../../../contracts/RealEstateTokenFactoryABI.json';
import contractAddress from '../../../../../contracts/contract-address.json';
import PropertyTokenABI from '../../../../../contracts/PropertyTokenABI.json';

interface TokenPurchaseSectionProps {
  property: any;
  propertyId: number;
  account: string | null;
  connectWallet: () => Promise<void>;
}

const TokenPurchaseSection: React.FC<TokenPurchaseSectionProps> = ({
  property,
  propertyId,
  account,
  connectWallet
}) => {
  // State variables
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(2000); // Default ETH price in USD
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [tokenPrice, setTokenPrice] = useState<number>(50); // Default price per token is $50
  const [totalTokens, setTotalTokens] = useState<number>(0);
  
  // Fixed token price in ETH as defined in the smart contract
  const tokenPriceInEth = 50; // 50 $ per token
  
  // Calculate USD price based on current ETH price
  const tokenPriceInUsd = tokenPriceInEth * ethPrice;
  const totalCostInUsd = tokenPriceInUsd * tokenAmount;
  
  // Fetch ETH price
  useEffect(() => {
    let isMounted = true;

    const fetchEthPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',
          },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.ethereum && data.ethereum.usd && isMounted) {
          setEthPrice(data.ethereum.usd);
          console.log("Successfully fetched ETH price:", data.ethereum.usd);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        console.error("Error fetching ETH price from CoinGecko:", err);
        
        try {
          const altResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', {
            signal: AbortSignal.timeout(5000)
          });
          
          if (altResponse.ok && isMounted) {
            const altData = await altResponse.json();
            if (altData && altData.price) {
              const price = parseFloat(altData.price);
              setEthPrice(price);
              console.log("Successfully fetched ETH price from Binance:", price);
              return;
            }
          }
          console.log("Using fallback ETH price of $2000");
        } catch (altErr) {
          console.error("Error fetching ETH price from alternative source:", altErr);
          console.log("Using fallback ETH price of $2000");
        }
      }
    };
    
    fetchEthPrice();
    
    // Retry mechanism
    const retryTimeout = setTimeout(() => {
      if (isMounted && ethPrice === 2000) {
        console.log("Retrying ETH price fetch...");
        fetchEthPrice();
      }
    }, 5000);
    
    return () => {
      isMounted = false;
      clearTimeout(retryTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ethPrice intentionally excluded due to isMounted handling retry logic
  
  // Fetch token price and total tokens
  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!property || propertyId === undefined) return;
      
      try {
        const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
        if (!provider) return;
        
        const contract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          provider
        );
        
        const properties = await contract.getProperties();
        if (propertyId < properties[0].length) {
          setTokenPrice(50);
          const propertyValue = Number(ethers.formatUnits(properties[1][propertyId]));
          const calculatedTotalTokens = Math.floor(propertyValue / 50);
          setTotalTokens(calculatedTotalTokens);
        }
      } catch (err) {
        console.error("Error fetching token details:", err);
      }
    };
    
    fetchTokenDetails();
  }, [property, propertyId]);
  
  // Fetch user's token balance
  const fetchUserBalance = useCallback(async () => {
    if (!account || !property || propertyId === undefined) return;
    
    setIsLoadingBalance(true);
    
    try {
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
      if (!provider) return;
      
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        provider
      );
      
      const buyerInfo = await contract.getBuyerInfo(propertyId, account);
      let balance = Number(buyerInfo);
      
      if (property.tokenAddress) {
        const tokenContract = new ethers.Contract(
          property.tokenAddress,
          PropertyTokenABI,
          provider
        );
        
        const tokenBalance = await tokenContract.balanceOf(account);
        const decimals = await tokenContract.decimals();
        const formattedBalance = Number(ethers.formatUnits(tokenBalance, decimals));
        
        balance = Math.max(balance, formattedBalance);
      }
      
      setUserBalance(balance);
    } catch (err) {
      console.error("Error fetching user balance:", err);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [account, property, propertyId]);
  
  useEffect(() => {
    fetchUserBalance();
  }, [account, property, propertyId, transactionHash, fetchUserBalance]);
  
  // Buy tokens function
  const buyTokens = async () => {
    if (!account || !property || tokenAmount <= 0 || propertyId === undefined) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
      if (!provider) throw new Error("Please install MetaMask to continue");
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      const tokenPriceWei = ethers.parseUnits(tokenPriceInEth.toString(), 'wei');
      const totalCost = tokenPriceWei * BigInt(tokenAmount);
      
      console.log(`Buying ${tokenAmount} tokens for property #${propertyId}`);
      console.log(`Total cost: ${ethers.formatEther(totalCost)} ETH (approx. $${totalCostInUsd.toLocaleString()})`);
      
      const tx = await contract.buyFromSale(propertyId, tokenAmount, {
        value: totalCost
      });
      
      const receipt = await tx.wait();
      
      setTransactionHash(receipt.hash);
      setSuccess(`Successfully purchased ${tokenAmount} tokens for ${ethers.formatEther(totalCost)} ETH`);
      
      try {
        const propertyOwner = await contract.getPropertyOwner(propertyId);
        
        const notificationData = {
          type: 'purchase',
          propertyId: propertyId,
          tokenAmount: tokenAmount,
          buyerAddress: account,
          totalCost: ethers.formatEther(totalCost),
          timestamp: new Date().toISOString(),
          propertyAddress: property.address || "Property #" + propertyId,
          transactionHash: receipt.hash
        };
        
        const allNotifications = JSON.parse(localStorage.getItem('propertyNotifications') || '{}');
        
        if (!allNotifications[propertyOwner]) {
          allNotifications[propertyOwner] = [];
        }
        
        allNotifications[propertyOwner].push(notificationData);
        localStorage.setItem('propertyNotifications', JSON.stringify(allNotifications));
        
        console.log(`Notification sent to property owner ${propertyOwner}:`, notificationData);
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
      
      setTokenAmount(1);
      fetchUserBalance();
    } catch (err) {
      console.error("Error buying tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to buy tokens. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!property) return null;
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-8 border border-gray-800 shadow-lg shadow-blue-900/10 text-white">
      <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
        <span>Invest in This Property</span>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-400 hover:text-blue-300"
        >
          <Info size={18} />
        </button>
      </h2>
      
      {showInfo && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-md text-sm">
          <p className="text-gray-300">
            When you purchase tokens, you&apos;re buying partial ownership of this property. 
            Each token represents a fraction of the property&apos;s value. You can later sell 
            these tokens on the marketplace to other investors.
          </p>
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-300 mb-2">
          This property has been tokenized into {totalTokens} tokens.
          Each token represents partial ownership of the property.
        </p>
        <div className="flex items-center gap-2 text-blue-400">
          <DollarSign size={20} />
          <span className="font-semibold">${tokenPrice.toFixed(2)} per token</span>
        </div>
        
        {ethPrice === 2000 && (
          <div className="mt-2 text-xs flex items-center gap-1 text-yellow-400">
            <AlertCircle size={14} />
            <span>Using estimated ETH price ($2000). Live price unavailable.</span>
          </div>
        )}
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
                <span>
                  Your Balance: {isLoadingBalance ? (
                    <RefreshCw size={14} className="inline animate-spin ml-1" />
                  ) : (
                    `${userBalance} tokens`
                  )}
                </span>
                <button 
                  onClick={fetchUserBalance}
                  className="ml-1 text-blue-400 hover:text-blue-300"
                  disabled={isLoadingBalance}
                >
                  <RefreshCw size={14} className={isLoadingBalance ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                id="tokenAmount"
                min="1"
                max={totalTokens}
                value={tokenAmount}
                onChange={(e) => setTokenAmount(Number(e.target.value))}
                className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
              />
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
              <button
                onClick={() => setTokenAmount(Math.min(totalTokens, 100))}
                className="px-3 py-2 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
              >
                Max
              </button>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-gray-800 rounded-md border border-gray-700">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Cost for {tokenAmount} tokens</span>
              <span className="font-semibold text-blue-400">
                ${(tokenAmount * tokenPrice).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-sm text-gray-400">
              <span>Estimated ETH:</span>
              <span>{((tokenAmount * tokenPrice) / ethPrice).toFixed(6)} ETH</span>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-md text-sm flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-600 rounded-md text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-white flex-shrink-0" />
                <p className="text-white">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="text-white hover:text-gray-200"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {transactionHash && (
            <div className="mb-4 p-4 bg-gray-800 rounded-md text-sm flex items-start gap-2">
              <div className="w-full">
                <p className="text-gray-600 font-semibold mb-1">Transaction Hash</p>
                <div className="flex items-center">
                  <div className="w-full p-2 bg-gray-200 rounded-md flex items-center justify-between">
                    <code className="text-blue-800 break-all">{transactionHash}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transactionHash);
                        alert("Copied to clipboard!");
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-400"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <a
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-400 block mt-2"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          )}
          
          <button
            onClick={buyTokens}
            disabled={isProcessing || tokenAmount <= 0}
            className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${
              isProcessing || tokenAmount <= 0
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <RefreshCw size={18} className="animate-spin text-white" />
                Processing...
              </span>
            ) : (
              `Buy ${tokenAmount} Tokens for $${(tokenPrice * Number(tokenAmount)).toFixed(2)}`
            )}
          </button>
          
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-gray-400" />
              <p>
                All purchases final. Token values may vary. Invest wisely.
              </p>
            </div>
          </div>
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-all duration-200"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default TokenPurchaseSection;