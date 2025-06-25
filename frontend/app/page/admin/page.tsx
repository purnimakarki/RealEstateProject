'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { usePropertyContext, Property } from '../../context/PropertyContext'; 
import { isAdmin, getCurrentUserAddress } from '../../components/utils/contractInteraction';
import { XIcon } from 'lucide-react'; 

export default function AdminPage() {
  const router = useRouter();
  const { pendingProperties, approveProperty, rejectProperty } = usePropertyContext();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentAction, setCurrentAction] = useState<{ id: number, action: string } | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State for managing the details modal - Ensure these are defined
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-950">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md py-4 mb-8 rounded-b-xl shadow-lg flex items-center justify-between border-b border-blue-900">
            <h1 className="text-4xl font-extrabold text-blue-400 tracking-tight drop-shadow-lg">Admin Dashboard</h1>
          </div>
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
          <div className="bg-gray-900/80 rounded-2xl shadow-2xl overflow-hidden border border-blue-900">
            <div className="p-8 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-1">Pending Properties</h2>
              <p className="text-gray-400 mt-1">Review and approve or reject property listings</p>
            </div>
            {pendingProperties.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No pending properties to review</p>
              </div>
            ) : (
              <div className="divide-y divide-blue-900">
                {pendingProperties.map((property) => (
                  <div key={property.id} className="p-8 hover:bg-blue-950/30 transition-colors duration-200">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-1/3 flex flex-col items-center justify-center">
                        {property.propertyImageURLs && property.propertyImageURLs.length > 0 ? (
                          <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-lg border-2 border-blue-800">
                            <Image
                              src={property.propertyImageURLs[0]}
                              alt={property.title || property.propertyAddress}
                              fill
                              className="object-cover"
                              priority
                            />
                            {property.propertyImageURLs.length > 1 && (
                              <div className="absolute bottom-2 right-2 flex gap-2">
                                <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">{property.propertyImageURLs.length} images</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-64 w-full bg-gray-700 rounded-xl flex items-center justify-center">
                            <p className="text-gray-400">No image available</p>
                          </div>
                        )}
                        {/* Property Documents Section */}
                        <div className="mt-4 w-full">
                          <h4 className="text-blue-200 font-semibold mb-2">Property Documents</h4>
                          {property.documentURLs && property.documentURLs.length > 0 ? (
                            <ul className="space-y-2">
                              {property.documentURLs.map((url, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  {/* Show icon based on file type */}
                                  {url.endsWith('.pdf') ? (
                                    <span title="PDF"><svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.828A2 2 0 0015.414 7L11 2.586A2 2 0 009.586 2H6z" /></svg></span>
                                  ) : (
                                    <span title="Image"><svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2a2 2 0 110 4 2 2 0 010-4zm0 2a1 1 0 100-2 1 1 0 000 2zm8 6H6l2.293-2.293a1 1 0 011.414 0L14 15z" /></svg></span>
                                  )}
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline break-all">Document {idx + 1}</a>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-400">No documents uploaded</p>
                          )}
                        </div>
                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-2xl font-bold text-blue-300 mb-2 tracking-tight drop-shadow">{property.title || `Property #${property.id}`}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4 text-base">
                          <div>
                            <span className="text-gray-400 font-medium">Address</span>
                            <p className="text-blue-200 font-semibold truncate" title={property.propertyAddress}>{property.propertyAddress}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Value</span>
                            <p className="text-green-400 font-bold text-lg">${Number(property.value).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Apartment Type</span>
                            <p className="text-white">{property.apartmentType || <span className="text-gray-500">N/A</span>}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Property Type</span>
                            <p className="text-white">{property.propertyType || <span className="text-gray-500">N/A</span>}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Bedrooms</span>
                            <p className="text-white">{property.bedrooms ?? <span className="text-gray-500">N/A</span>}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-medium">Bathrooms</span>
                            <p className="text-white">{property.bathrooms ?? <span className="text-gray-500">N/A</span>}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-6">
                          <button
                            onClick={() => handleViewDetails(property)}
                            className="px-5 py-2 rounded-xl font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-lg transition-colors text-base"

                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleApprove(property.id)}
                            disabled={isProcessing}
                            className={`px-5 py-2 rounded-xl font-semibold text-base transition-colors shadow-lg ${
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
                            className={`px-5 py-2 rounded-xl font-semibold text-base transition-colors shadow-lg ${
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

      {/* Modal for Property Details */}
      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[6px]">
          <div className="bg-gradient-to-br from-gray-900/90 via-blue-950/80 to-black/90 p-8 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-blue-900 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-blue-200 tracking-tight drop-shadow-lg">{selectedProperty.title || `Property #${selectedProperty.id}`}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white bg-black/30 hover:bg-blue-900/40 rounded-full p-2 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <XIcon size={28} />
              </button>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Property Images</h3>
              {selectedProperty.propertyImageURLs && selectedProperty.propertyImageURLs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProperty.propertyImageURLs.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-900 shadow-lg group">
                      <Image src={url} alt={`Property Image ${idx + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No images available.</p>
              )}
            </div>
            {/* Property Documents Section in Modal */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Property Documents</h3>
              {selectedProperty.documentURLs && selectedProperty.documentURLs.length > 0 ? (
                <ul className="space-y-2">
                  {selectedProperty.documentURLs.map((url, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {url.endsWith('.pdf') ? (
                        <span title="PDF"><svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.828A2 2 0 0015.414 7L11 2.586A2 2 0 009.586 2H6z" /></svg></span>
                      ) : (
                        <span title="Image"><svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2a2 2 0 110 4 2 2 0 010-4zm0 2a1 1 0 100-2 1 1 0 000 2zm8 6H6l2.293-2.293a1 1 0 011.414 0L14 15z" /></svg></span>
                      )}
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline break-all">Document {idx + 1}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No documents uploaded.</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
              <div>
                <span className="text-gray-400 font-medium">Address</span>
                <p className="text-blue-200 font-semibold break-words">{selectedProperty.propertyAddress}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Value</span>
                <p className="text-green-400 font-bold text-lg">${Number(selectedProperty.value).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Original Owner</span>
                <p className="text-xs text-blue-300 break-all bg-black/30 rounded px-2 py-1 inline-block mt-1">{selectedProperty.originalOwner || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Apartment Type</span>
                <p className="text-white">{selectedProperty.apartmentType || <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Property Type</span>
                <p className="text-white">{selectedProperty.propertyType || <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Bedrooms</span>
                <p className="text-white">{selectedProperty.bedrooms ?? <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Bathrooms</span>
                <p className="text-white">{selectedProperty.bathrooms ?? <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Area</span>
                <p className="text-white">{selectedProperty.area ? <span className="font-semibold">{selectedProperty.area} sq ft</span> : <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Year Built</span>
                <p className="text-white">{selectedProperty.yearBuilt || <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">City</span>
                <p className="text-white">{selectedProperty.city || <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">State</span>
                <p className="text-white">{selectedProperty.state || <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">ZIP Code</span>
                <p className="text-white">{selectedProperty.zipCode || <span className="text-gray-500">N/A</span>}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Amenities</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedProperty.amenities && selectedProperty.amenities.length > 0 ? (
                    selectedProperty.amenities.map((a, i) => (
                      <span key={i} className="bg-blue-800/80 text-blue-100 px-2 py-1 rounded-full text-xs font-semibold shadow hover:bg-blue-700/90 transition-colors cursor-pointer">{a}</span>
                    ))
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-gray-400 font-medium">Description</span>
              <p className="text-white text-base mt-1 whitespace-pre-line leading-relaxed bg-black/30 rounded-lg p-4 border border-blue-900 shadow-inner">
                {selectedProperty.description || <span className="text-gray-500">N/A</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}