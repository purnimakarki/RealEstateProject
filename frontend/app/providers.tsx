// app/providers.tsx
'use client';
import { PropertyProvider } from './context/PropertyContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <PropertyProvider>{children}</PropertyProvider>;
}
