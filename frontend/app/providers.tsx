'use client';
import { PropertyProvider } from './context/PropertyContext';
import { NotificationProvider } from './context/NotificationContext'; 
import { ToastProvider } from './components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PropertyProvider>
      <NotificationProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </NotificationProvider>
    </PropertyProvider>
  );
}
