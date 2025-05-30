'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useWallet } from './hooks/usewallet';
import { Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll effect - only on client side
  useEffect(() => {
    const handleScroll = () => {
      // Use a more gradual threshold for scrolling
      const scrollThreshold = 20;
      const scrollProgress = Math.min(1, window.scrollY / scrollThreshold);
      
      // Only update state when crossing the threshold to avoid unnecessary renders
      if (scrollProgress >= 1 && !scrolled) {
        setScrolled(true);
      } else if (scrollProgress <= 0 && scrolled) {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  // Replace the Buy and Sell links with these conditional links
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-sm shadow-md py-3 opacity-100' 
        : 'bg-transparent py-5 opacity-100'
    } px-8 flex items-center`}>
      {/* Left side - Navigation links */}
      <div className="hidden md:flex gap-8 text-sm font-medium mr-auto">
      
        {account ? (
          <Link href="/page/buy" className={`${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors relative group`}>
            Buy
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-300 group-hover:w-full"></span>
          </Link>
        ) : (
          <button 
            onClick={() => {
              alert('You need to connect your wallet to access property listings.');
            }}
            className={`${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors relative group`}
          >
            Buy
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-300 group-hover:w-full"></span>
          </button>
        )}

        <div className="hidden md:flex space-x-8">
          
          {account ? (
            <Link href="/page/sell" className={`${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors relative group`}>
              Sell
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ) : (
            <button 
              onClick={() => {
                alert('You need to connect your wallet to list properties for sale.');
              }}
              className={`${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors relative group`}
            >
              Sell
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-300 group-hover:w-full"></span>
            </button>
          )}
          
          {/* Profile link - only visible when wallet is connected */}
          {account && (
            <Link href="/page/profile" className={`${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors relative group`}>
              Profile
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-300 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className={`md:hidden ${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Center - Logo and name */}
      <div className="flex items-center gap-0 mx-auto">
        <div className="relative group">
          <Image
            src="/logo2.png"
            alt="BlocAdobe Logo"
            width={60}
            height={60}
            className={`transition-all duration-300 ${scrolled ? 'brightness-100' : 'brightness-125'}`}
          />
        </div>
        <Link href="/" className={`text-xl font-bold transition-all duration-300 -ml-1 ${
          scrolled ? 'text-gray-900' : 'text-white'
        } hover:text-blue-500`}>
          BlocAdobe
        </Link>
      </div>
      
      {/* Right side - Wallet connection */}
      <div className="hidden md:block ml-auto">
        {account ? (
          <div className="flex items-center gap-2">
            <span className={`${scrolled ? 'bg-gray-50 border border-gray-100 text-gray-900' : 'bg-white/20 backdrop-blur-md text-white border border-white/30'} px-3 py-1.5 rounded-full text-xs flex items-center shadow-sm hover:shadow-md transition-all duration-300`}>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <button
              onClick={disconnectWallet}
              className={`${scrolled ? 'text-gray-800 hover:text-red-500' : 'text-white hover:text-red-300'} text-xs transition-colors relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bg-red-500 after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-all after:duration-300`}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className={`${
              scrolled 
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white' 
                : 'bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30'
            } px-4 py-1.5 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 relative overflow-hidden group`}
            disabled={isConnecting}
          >
            <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
      
      {/* Mobile menu - only rendered client-side */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-white/95 backdrop-blur-lg z-40 p-6 animate-fadeIn shadow-xl">
          <div className="flex flex-col gap-6">
            <Link 
              href="/page/buy"
              className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2 text-lg border-b border-gray-100 pb-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Buy
            </Link>
            
            {/* Add the missing Rent link
            <Link 
              href="/rent" 
              className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2 text-lg border-b border-gray-100 pb-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rent
            </Link> */}
          
            <Link 
              href="/page/sell" 
              className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2 text-lg border-b border-gray-100 pb-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sell
            </Link>
            
            {/* Add Profile link to mobile menu */}
            {account && (
              <Link 
                href="/page/profile" 
                className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2 text-lg border-b border-gray-100 pb-3"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={18} />
                Profile
              </Link>
            )}
            
            <div className="mt-4">
              {account ? (
                <div className="flex flex-col gap-3">
                  <span className="bg-gray-50 border border-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-full text-sm hover:bg-red-100 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-300"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}