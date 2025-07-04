'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
const inter = Inter({ subsets: ['latin'] });

import { FavoritesProvider } from './components/hooks/useFavorites';
import { PropertyProvider } from './context/PropertyContext';
import Navbar from './components/navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <Providers>
          <PropertyProvider>
            <FavoritesProvider> 
              {children}
            </FavoritesProvider>
          </PropertyProvider>
        </Providers>
      </body>
    </html>
  );
}
