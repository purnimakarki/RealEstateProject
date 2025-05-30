'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { ethers } from 'ethers';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  
  // Check for existing connection when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      // Check if user manually disconnected
      const isDisconnected = localStorage.getItem('walletDisconnected') === 'true';
      
      if (isDisconnected) {
        return; // Don't auto-connect if user disconnected
      }

      if (window.ethereum) {
        try {
          // Initialize provider
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
          
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          }) as string[];
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            localStorage.removeItem('walletDisconnected'); // Clear disconnected state
            Cookies.set('walletConnected', 'true', { expires: 1 }); // Set cookie for 1 day
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };

    // Only run on client-side
    if (typeof window !== 'undefined') {
      checkConnection();
    }
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
        if (account) {
            // Ensure the wallet connection state is properly updated
            const isWalletConnected = Cookies.get('walletConnected') === 'true';
            if (!isWalletConnected) {
                Cookies.set('walletConnected', 'true', { expires: 1 });
            }
        }
    };

    checkWalletConnection();
  }, [account]);

  useEffect(() => {
    const syncWalletState = async () => {
        if (account) {
            const isWalletConnected = Cookies.get('walletConnected') === 'true';
            if (!isWalletConnected) {
                Cookies.set('walletConnected', 'true', { expires: 1 });
            }
        } else {
            Cookies.remove('walletConnected');
        }
    };

    syncWalletState();
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        localStorage.removeItem('walletDisconnected'); // Clear disconnected state

        // Initialize provider if not already done
        if (!provider) {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);
        }

        // Force MetaMask popup
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          Cookies.set('walletConnected', 'true', { expires: 1 }); // Set cookie for 1 day
        }
      } catch (err) {
        console.error("Error connecting wallet:", err);
        if (err instanceof Error) {
          alert(`Error connecting wallet: ${err.message}`);
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask not found. Please install it or enable it for this site.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    localStorage.setItem('walletDisconnected', 'true'); // Remember disconnected state
    Cookies.remove('walletConnected'); // Remove the cookie
  };

  return { account, connectWallet, disconnectWallet, isConnecting, provider };
}
