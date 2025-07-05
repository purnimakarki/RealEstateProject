"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

// Array of house images from the correct path
const houseImages = [
  "/imageforLanding/house.jpg",
  "/imageforLanding/house2.jpg",
  "/imageforLanding/house3.jpg",
  "/imageforLanding/house4.jpg",
  "/imageforLanding/house5.jpg",
  "/imageforLanding/house6.jpg",
  "/imageforLanding/house7.jpg",
];

// Add your quotes here
const heroQuotes = [
  {
    heading: "Find Your Dream Home",
    subheading: "Discover exceptional properties that match your lifestyle and aspirations with our premium real estate services."
  },
  {
    
    subheading: "Build wealth and security with fractional ownership in high-value real estate assets."
  },
  {
  
    subheading: "Explore a curated collection of homes designed for comfort, style, and innovation."
  },
  {
    
    subheading: "Experience seamless property buying and selling powered by blockchain technology."
  },
  {
    
    subheading: "Browse, invest, and own with confidence—your perfect property is just a click away."
  }
];

export default function HeroSection() {
  // State for image slideshow
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // State for rotating quotes
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Change to next image every 3 seconds
      setCurrentImageIndex((prevIndex) =>
        prevIndex === houseImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Change quote every 5 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) =>
        prev === heroQuotes.length - 1 ? 0 : prev + 1
      );
    }, 1000);
    return () => clearInterval(quoteInterval);
  }, []);

  const { subheading } = heroQuotes[currentQuoteIndex];

  return (
    <div className="relative h-[900px] md:h-[750px] bg-black">
      <div className="absolute inset-0 overflow-hidden">
        {houseImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={img}
              alt={`Luxury home ${index + 1}`}
              fill
              priority={index === 0}
              quality={90}
              sizes="100vw"
              className="object-cover transform transition-transform duration-10000 animate-slow-zoom"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/700" />
      </div>

      <div className="relative h-full flex flex-col justify-center px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up transition-all duration-1000">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Find Your Dream Home
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-200">
            {subheading}
          </p>
        </div>
      </div>
    </div>
  );
}