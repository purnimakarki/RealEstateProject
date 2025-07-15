'use client';
import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useWallet } from './hooks/usewallet';

function WalletNotificationContent() {
  const { connectWallet } = useWallet();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasShownAlert = useRef(false);
  
  useEffect(() => {
    // Check if user was redirected due to wallet requirement
    const walletRequired = searchParams.get('walletRequired');
    
   
    if (walletRequired === 'true' && !hasShownAlert.current) {
      hasShownAlert.current = true;
      
      // Determine which section the user was trying to access
      const path = window.location.pathname;
      let sectionName = 'this section';
      
      if (path === '/') {
        // Check the referrer to see which section they were trying to access
        const referrer = document.referrer;
        if (referrer.includes('/page/buy')) {
          sectionName = 'property listings';
        } else if (referrer.includes('/page/sell')) {
          sectionName = 'property selling';
        } else if (referrer.includes('/page/property')) {
          sectionName = 'property details';
        }
      }
      
      // Show a simple alert instead of toast
      alert(`You need to connect your wallet to access ${sectionName}.`);
      
      // Clean up URL without refreshing the page
      const url = new URL(window.location.href);
      url.searchParams.delete('walletRequired');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, connectWallet, router]);

  return null; 
}

export function WalletNotification() {
  return (
    <Suspense fallback={null}>
      <WalletNotificationContent />
    </Suspense>
  );
}