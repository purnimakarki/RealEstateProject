'use client';
import React, { Suspense } from 'react';
import Navbar from './components/navbar';
import HeroSection from './components/home/HeroSection';
import FeaturedProperties from './components/home/FeaturedProperties';
import ServicesSection from './components/home/ServicesSection';
import CallToAction from './components/home/CallToAction';
import TestimonialsSection from './components/home/TestimonialsSection';
import Footer from './components/footer';
import { WalletNotification } from './components/wallet-notification';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Suspense fallback={null}>
        <WalletNotification />
      </Suspense>
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <ServicesSection />
      <CallToAction />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}