'use client';
import React from 'react';
import { ArrowRight, Shield, Zap, Lock, Globe } from 'lucide-react';
import { useWallet } from '../hooks/usewallet';
import { useRouter } from 'next/navigation';

export default function CallToAction() {
  const { account, connectWallet } = useWallet();
  const router = useRouter();

  const handleExploreClick = () => {
    if (!account) {
      alert('Please connect your wallet to explore properties');
    } else {
      router.push('/page/buy');
    }
  };

  return (
    <div className="relative py-24 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900"></div>
      
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-48 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-indigo-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 p-5 rounded-full backdrop-blur-sm border border-white/20 shadow-xl">
            <Shield className="h-12 w-12 text-white" />
          </div>
        </div>
        
        <h2 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">Ready to Find Your Perfect Property?</h2>
        <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
          Connect with our blockchain-powered platform today and take the first step towards your dream home with unparalleled security and transparency.
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
          <button 
            onClick={handleExploreClick}
            className="group px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition duration-300 shadow-xl flex items-center justify-center text-lg relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Explore Properties
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          {!account && (
            <button 
              onClick={connectWallet}
              className="group px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition duration-300 flex items-center justify-center text-lg relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Connect Wallet
                <Lock className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
        </div>
        
        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 transform transition-transform hover:scale-105 hover:shadow-xl">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">100% Secure</h3>
            <p className="text-blue-100">All transactions are secured by blockchain technology for maximum protection</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 transform transition-transform hover:scale-105 hover:shadow-xl">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Fast Transactions</h3>
            <p className="text-blue-100">Complete property deals in a fraction of the time with our smart contracts</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 transform transition-transform hover:scale-105 hover:shadow-xl">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Global Access</h3>
            <p className="text-blue-100">Access premium properties from anywhere in the world with our platform</p>
          </div>
        </div>
        
        {/* Stats with animated counters */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">500+</div>
            <div className="text-blue-200 mt-2">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">300+</div>
            <div className="text-blue-200 mt-2">Happy Clients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">100%</div>
            <div className="text-blue-200 mt-2">Secure Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">24/7</div>
            <div className="text-blue-200 mt-2">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}