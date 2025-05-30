'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { useWallet } from './usewallet';

// Define the context type
type FavoritesContextType = {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

// Create context with default values
const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
});

// Provider component
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { account } = useWallet();
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from localStorage when component mounts or account changes
  useEffect(() => {
    if (account) {
      const storedFavorites = localStorage.getItem(`favorites_${account}`);
      if (storedFavorites) {
        try {
          setFavorites(JSON.parse(storedFavorites));
        } catch (error) {
          console.error('Error parsing favorites from localStorage:', error);
          setFavorites([]);
        }
      }
    } else {
      setFavorites([]);
    }
  }, [account]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (account) {
      localStorage.setItem(`favorites_${account}`, JSON.stringify(favorites));
    }
  }, [favorites, account]);

  // Toggle a property's favorite status
  const toggleFavorite = (id: number) => {
    if (!account) {
      alert('Please connect your wallet to save favorites');
      return;
    }
    
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

  // Check if a property is favorited
  const isFavorite = (id: number) => {
    return favorites.includes(id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook to use the favorites context
export function useFavorites() {
  return useContext(FavoritesContext);
}