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

export default function HeroSection() {
  // State for image slideshow
  const [currentImageIndex, setCurrentImageIndex] = useState(0);  

  useEffect(() => {
    const interval = setInterval(() => {
      // Change to next image every 3 seconds
      setCurrentImageIndex((prevIndex) =>
        prevIndex === houseImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Find Your Dream Home
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-200">
            Discover exceptional properties that match your lifestyle and
            aspirations with our premium real estate services.
          </p>
        </div>
      </div>
    </div>
  );
}