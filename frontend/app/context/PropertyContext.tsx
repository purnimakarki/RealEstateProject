'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  approvePropertyContract, 
  rejectPropertyContract, 
  getPendingProperties 
} from '../components/utils/contractInteraction';


export type Property = { 
  id: number;
  propertyAddress: string;
  value: string;
  tokenAddress: string;
  propertyImageURLs: string[];
  documentURLs?: string[];
  status: 'pending' | 'approved' | 'rejected';
  originalIndex?: number; 
  contractIndex?: number; 
  originalOwner?: string; 
  title?: string;
  description?: string;
  apartmentType?: string;
  bedrooms?: number | string; 
  bathrooms?: number | string; 
  area?: number | string;
 
  propertyType?: string;
  yearBuilt?: number | string;
  city?: string;
  state?: string;
  zipCode?: string;
  amenities?: string[];
};

type PropertyContextType = {
  pendingProperties: Property[];
  approvedProperties: Property[];
  rejectedProperties: Property[]; 
  approveProperty: (id: number) => Promise<void>;
  rejectProperty: (id: number) => Promise<void>;
  addProperty: (property: Property) => void;
  refreshPendingProperties: () => Promise<void>;
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with empty arrays instead of mock data
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [approvedProperties, setApprovedProperties] = useState<Property[]>([]);
  const [rejectedProperties, setRejectedProperties] = useState<Property[]>([]);

  // Function to fetch pending properties
  const fetchPendingProperties = async () => {
    try {
      
      // Check if window is defined (client-side only)
      if (typeof window === 'undefined') {
        return;
      }
      
      // Check if ethereum provider is available
      if (!window.ethereum) {
        return;
      }
      
      const properties = await getPendingProperties();
      
      // Add this check to handle empty or invalid properties early
      if (!properties || !Array.isArray(properties) || properties.length === 0) {
        setPendingProperties([]);
        return;
      }
      
      // Filter out invalid properties first
      const validProperties = properties.filter(prop => 
        prop && (prop.propertyAddress || prop.value)
      );
      
      // If no valid properties remain after filtering, update state and return
      if (validProperties.length === 0) {
        setPendingProperties([]);
        return;
      }
      
      // Transform the properties to match our expected format
      const formattedProperties = validProperties
        .map((prop, index) => {
          // Process propertyImageURLs to ensure they are valid URLs
          const processedImageURLs = (prop.propertyImageURLs || []).map((url: string) =>
            typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')) ? url : `https://gateway.pinata.cloud/ipfs/${url}`
          );
          // Process documentURLs to ensure they are valid URLs
          const processedDocumentURLs = (prop.documentURLs || []).map((url: string) =>
            typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')) ? url : `https://gateway.pinata.cloud/ipfs/${url}`
          );
          return {
            id: index,
            propertyAddress: prop?.propertyAddress || 'No Address Provided',
            value: prop?.value || '0',
            tokenAddress: '',  
            propertyImageURLs: processedImageURLs,
            documentURLs: processedDocumentURLs,
            status: 'pending' as const,
            originalIndex: index, // Store the UI index
            contractIndex: prop?.contractIndex || index,
            originalOwner: prop?.originalOwner || '', 
           
            title: prop?.title,
            description: prop?.description,
            apartmentType: prop?.apartmentType,
            bedrooms: prop?.bedrooms,
            bathrooms: prop?.bathrooms,
            area: prop?.area,
            propertyType: prop?.propertyType,
            yearBuilt: prop?.yearBuilt,
            city: prop?.city,
            state: prop?.state,
            zipCode: prop?.zipCode,
            amenities: prop?.amenities,
          };
        });
      setPendingProperties(formattedProperties as Property[]);
    } catch {
      setPendingProperties([]);
    }
  };

  // Fetch pending properties from the blockchain
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      fetchPendingProperties();
      
    }
  }, []);

  const approveProperty = async (id: number) => {
    // Find the property to approve
    const property = pendingProperties.find(p => p.id === id);
    if (!property) {
      return;
    }
    try {
      // Use the contractIndex from the property object
      const contractIndex = property.contractIndex !== undefined ? property.contractIndex : id;
      // Call the contract to approve the property
      await approvePropertyContract(contractIndex);
      // Update local state
      setPendingProperties(prev => prev.filter(p => p.id !== id));
      setApprovedProperties(prev => [...prev, {...property, status: 'approved'}]);
      // Refresh the pending properties list
      await fetchPendingProperties();
    } catch {
      // Check for the specific error message from the contract
      await fetchPendingProperties();
      throw new Error(`Property #${id} might have already been approved or rejected.`);
    }
  };

  const rejectProperty = async (id: number) => {
    // Find the property to reject
    const property = pendingProperties.find(p => p.id === id);
    if (!property) {
      return;
    }
    try {
      // Use the contractIndex from the property object
      const contractIndex = property.contractIndex !== undefined ? property.contractIndex : id;
      // Call the contract to reject the property
      await rejectPropertyContract(contractIndex);
      // Update local state
      setPendingProperties(prev => prev.filter(p => p.id !== id));
      setRejectedProperties(prev => [...prev, {...property, status: 'rejected'}]);
      // Refresh the pending properties list
      await fetchPendingProperties();
    } catch {
       // Check for the specific error message from the contract
      await fetchPendingProperties();
      throw new Error(`Property #${id} might have already been approved or rejected.`);
    }
  };

  const addProperty = async (property: Property) => {
    setPendingProperties(prev => {
     
      const existingProperty = prev.find(p => p.id === property.id && p.status === property.status);
      if (existingProperty) {
        return prev; 
      }
      return [...prev, property];
    });
    
  
  };

  return (
    <PropertyContext.Provider value={{
      pendingProperties,
      approvedProperties,
      rejectedProperties,
      approveProperty,
      rejectProperty,
      addProperty,
      refreshPendingProperties: fetchPendingProperties
    }}>
      <div suppressHydrationWarning={true}>
        {children}
      </div>
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('usePropertyContext must be used inside PropertyProvider');
  return context;
};