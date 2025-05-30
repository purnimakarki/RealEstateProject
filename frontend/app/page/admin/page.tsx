'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { usePropertyContext } from '../../context/PropertyContext';
import { isAdmin, getCurrentUserAddress } from '../../components/utils/contractInteraction';

export default function AdminPage() {
  const router = useRouter();
  const { pendingProperties, approveProperty, rejectProperty } = usePropertyContext();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<{ id: number, action: string } | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (typeof window === "undefined" || !window.ethereum) {
          setError('Ethereum provider not available. Please install MetaMask.');
          setIsLoading(false);
          setIsAuthorized(false);
          return;
        }
        
        // Get user address
        const userAddress = await getCurrentUserAddress();
        console.log("Current user address:", userAddress);
        
        // Check admin status
        const adminStatus = await isAdmin(userAddress);
        console.log("Admin status:", adminStatus);
        
        setIsAuthorized(adminStatus);
        setIsLoading(false);
        
        if (!adminStatus) {
          // If not admin, redirect after a short delay
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin status. Please connect your wallet.');
        setIsLoading(false);
        setIsAuthorized(false);
      }
    };
    
    checkAdminAccess();
  }, [router]);

  const handleApprove = async (id: number) => {
    setIsProcessing(true);
    setCurrentAction({ id, action: 'approve' });
    setError('');
    setSuccess('');

    try {
      await approveProperty(id);
      setSuccess(`Property #${id} has been approved successfully`);

     
    } catch (err: any) {
      console.error('Error approving property:', err);
      setError(err.message || 'Failed to approve property');
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const handleReject = async (id: number) => {
    setIsProcessing(true);
    setCurrentAction({ id, action: 'reject' });
    setError('');
    setSuccess('');

    try {
      await rejectProperty(id);
      setSuccess(`Property #${id} has been rejected`);

      
    } catch (err: any) {
      console.error('Error rejecting property:', err);
      setError(err.message || 'Failed to reject property');
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You do not have permission to access the admin dashboard.</p>
            <p className="mt-2">Redirecting to home page...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
          
          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}
          
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Pending Properties</h2>
              <p className="text-gray-400 mt-1">Review and approve or reject property listings</p>
            </div>
            
            {pendingProperties.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <p>No pending properties to review</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {pendingProperties.map((property) => (
                  <div key={property.id} className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        {property.propertyImageURLs && property.propertyImageURLs.length > 0 ? (
                          <div className="relative h-64 rounded-lg overflow-hidden">
                            <Image
                              src={property.propertyImageURLs[0]}
                              alt={property.propertyAddress}
                              fill
                              className="object-cover"
                              priority // Add the priority prop here
                            />
                          </div>
                        ) : (
                          <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                            <p className="text-gray-400">No image available</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full md:w-2/3">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Property #{property.id}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-gray-400 text-sm">Address</p>
                            <p className="text-white">{property.propertyAddress}</p>
                          </div>
                          
                          <div>
                            <p className="text-gray-400 text-sm">Value</p>
                            <p className="text-white">${Number(property.value).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mt-6">
                          <button
                            onClick={() => handleApprove(property.id)}
                            disabled={isProcessing}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              isProcessing && currentAction?.id === property.id && currentAction?.action === 'approve'
                                ? 'bg-blue-800 text-blue-200 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isProcessing && currentAction?.id === property.id && currentAction?.action === 'approve' ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              'Approve'
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleReject(property.id)}
                            disabled={isProcessing}
                            className={`px-4 py-2 rounded-lg font-medium ${
                              isProcessing && currentAction?.id === property.id && currentAction?.action === 'reject'
                                ? 'bg-red-800 text-red-200 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {isProcessing && currentAction?.id === property.id && currentAction?.action === 'reject' ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </span>
                            ) : (
                              'Reject'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}