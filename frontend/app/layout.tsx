import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers'; // Make sure this is imported and used

const inter = Inter({ subsets: ['latin'] });

import { FavoritesProvider } from './components/hooks/useFavorites';
import { PropertyProvider } from './context/PropertyContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers> {/* Add this wrapper */}
          <PropertyProvider>
            <FavoritesProvider> {/* Make sure FavoritesProvider is used */}
              {children}
            </FavoritesProvider>
          </PropertyProvider>
        </Providers>
      </body>
    </html>
  );
}
