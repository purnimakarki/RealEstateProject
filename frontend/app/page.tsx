'use client';
import React, { Suspense } from 'react';
import Navbar from './components/navbar';
import HeroSection from './components/home/HeroSection';
import FeaturedProperties from './components/home/FeaturedProperties';
import ServicesSection from './components/home/ServicesSection';
// import CallToAction from './components/home/CallToAction';
import TestimonialsSection from './components/home/TestimonialsSection';
import Footer from './components/footer';
import { WalletNotification } from './components/wallet-notification';
import HowPlatformWorks from './components/home/HowPlatformWorks';
import HowToUsePlatform from './components/home/HowToUsePlatform';

export default function Home() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Creative animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Animated gradient blob top left */}
        <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-gradient-to-br from-blue-400 via-blue-600 to-purple-500 opacity-30 rounded-full filter blur-3xl animate-blob1"></div>
        {/* Animated gradient blob bottom right */}
        <div className="absolute bottom-[-140px] right-[-140px] w-[600px] h-[600px] bg-gradient-to-tr from-purple-400 via-blue-500 to-green-400 opacity-30 rounded-full filter blur-3xl animate-blob2"></div>
        {/* Optional: Add a third, smaller blob for extra depth */}
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-br from-pink-400 via-blue-300 to-blue-500 opacity-20 rounded-full filter blur-2xl animate-blob3"></div>
      </div>
      <Suspense fallback={null}>
        <WalletNotification />
      </Suspense>
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <ServicesSection />
      {/* <CallToAction /> */}
      <HowPlatformWorks />
      <HowToUsePlatform />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}