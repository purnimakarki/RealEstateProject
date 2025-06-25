// app/providers.tsx
'use client';
import { PropertyProvider } from './context/PropertyContext';
import { NotificationProvider } from './context/NotificationContext'; // Import NotificationProvider

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PropertyProvider>
      <NotificationProvider> {/* Wrap with NotificationProvider */}
        {children}
      </NotificationProvider>
    </PropertyProvider>
  );
}
