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
      <head>
        <title>RealEstate</title>
        <link rel="icon" href="/logo2.png" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white`}>
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
