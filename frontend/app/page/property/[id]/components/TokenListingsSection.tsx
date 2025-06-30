import React from 'react';
import { Tag } from 'lucide-react';

interface TokenListingsSectionProps {
  property: any;
  account: string;
  listings: any[];
  userBalance: number;
  listingAmount: number;
  setListingAmount: (amount: number) => void;
  listingPrice: number;
  setListingPrice: (price: number) => void;
  isProcessing: boolean;
  createListing: () => Promise<void>;
  buyFromListing: (index: number) => Promise<void>;
  cancelListing: (index: number) => Promise<void>;
}

const TokenListingsSection: React.FC<TokenListingsSectionProps> = ({
  property,
  account,
  listings,
  userBalance,
  listingAmount,
  setListingAmount,
  listingPrice,
  setListingPrice,
  isProcessing,
  createListing,
  buyFromListing,
  cancelListing
}) => {
  if (!property || !account) return null;
  
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-800 pb-2">Token Marketplace</h2>
      
      {userBalance > 0 && (
        <div className="bg-gray-900 text-white p-6 rounded-lg mb-6 border border-gray-800 shadow-lg shadow-blue-900/10">
          <h3 className="font-medium mb-3 text-blue-400">Sell Your Tokens</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="listingAmount" className="block text-sm font-medium mb-1 text-gray-300">
                Number of Tokens to Sell
              </label>
              <input
                type="number"
                id="listingAmount"
                min="1"
                max={userBalance}
                value={listingAmount}
                onChange={(e) => setListingAmount(Number(e.target.value))}
                className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
              />
            </div>
            
            <div>
              <label htmlFor="listingPrice" className="block text-sm font-medium mb-1 text-gray-300">
                Price per Token (USD)
              </label>
              <input
                type="number"
                id="listingPrice"
                min="1"
                value={listingPrice}
                onChange={(e) => setListingPrice(Number(e.target.value))}
                className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
              />
            </div>
          </div>
          
          <button
            onClick={createListing}
            disabled={isProcessing || listingAmount <= 0 || listingAmount > userBalance}
            className={`w-full py-2 rounded-md font-medium transition-all duration-300 ${
              isProcessing || listingAmount <= 0 || listingAmount > userBalance
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Create Listing'}
          </button>
        </div>
      )}
      
      <div>
        <h3 className="font-medium mb-3 flex items-center gap-2 text-white">
          <Tag size={18} className="text-blue-400" />
          <span>Available Listings</span>
        </h3>
        
        {listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map((listing, index) => (
              <div key={index} className="border border-gray-800 rounded-lg p-4 bg-gray-900 hover:bg-gray-800 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium text-white">{listing.tokenAmount} Tokens</p>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="font-semibold text-gray-300">Price per token:</span> 
                      <span className="text-blue-400 font-mono ml-1">{listing.pricePerToken.toFixed(6)} ETH</span>
                      <span className="mx-1 text-gray-500">/</span>
                      <span className="text-green-400 font-mono">${listing.pricePerTokenUSD.toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-gray-400 font-semibold">Total:</span>
                    <span className="font-bold text-blue-400 font-mono">{(listing.tokenAmount * listing.pricePerToken).toFixed(6)} ETH</span>
                    <span className="mx-1 text-gray-500">/</span>
                    <span className="font-bold text-green-400 font-mono">${listing.totalUSD.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400 truncate max-w-[200px]">
                    Seller: {listing.seller === account ? 'You' : listing.seller}
                  </p>
                  {listing.seller === account ? (
                    <button
                      onClick={() => cancelListing(index)}
                      disabled={isProcessing}
                      className="px-3 py-1 text-sm bg-red-900/50 text-red-400 rounded-md hover:bg-red-900/80 transition-all duration-300"
                    >
                      Cancel Listing
                    </button>
                  ) : (
                    <button
                      onClick={() => buyFromListing(index)}
                      disabled={isProcessing}
                      className="px-3 py-1 text-sm bg-blue-900/50 text-blue-400 rounded-md hover:bg-blue-900/80 transition-all duration-300"
                    >
                      Buy Tokens
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 bg-gray-900 p-4 rounded-lg border border-gray-800">No listings available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default TokenListingsSection;