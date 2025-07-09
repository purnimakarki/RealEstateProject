'use client';
import { useState, useEffect } from 'react';

// Define the type for a star
type Star = {
  width: number;
  height: number;
  top: number;
  left: number;
  opacity: number;
  animationDelay: number;
  animationDuration: number;
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);
  // Properly type the stars state
  const [stars, setStars] = useState<Star[]>([]);
  // Add state for window animation delays
  const [windowAnimationDelays, setWindowAnimationDelays] = useState<number[][]>([]);

  useEffect(() => {
    // Generate stars only on client-side to avoid hydration mismatch
    const generatedStars = Array.from({ length: 30 }, () => ({
      width: Math.random() * 2 + 1,
      height: Math.random() * 2 + 1,
      top: Math.random() * 50,
      left: Math.random() * 100,
      opacity: Math.random() * 0.8,
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 3 + 2
    }));
    
    setStars(generatedStars);
    
    // Add animation when component mounts
    setIsVisible(true);
    
    // Start cityscape animations after a delay
    setTimeout(() => {
      setAnimationActive(true);
    }, 500);
    
    // Intersection Observer to trigger animations when scrolling to footer
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          setTimeout(() => {
            setAnimationActive(true);
          }, 500);
        } else {
          setAnimationActive(false);
        }
      },
      { threshold: 0.2 }
    );
    
    const footer = document.getElementById('animated-footer');
    if (footer) observer.observe(footer);
    
    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);
  
  useEffect(() => {
    // Generate animation delays for windows in each building
    setWindowAnimationDelays([
      Array.from({ length: 56 }, () => Math.random() * 10), // skyscraper 1
      Array.from({ length: 36 }, () => Math.random() * 10), // skyscraper 2
      Array.from({ length: 36 }, () => Math.random() * 10), // office building
      Array.from({ length: 40 }, () => Math.random() * 10), // glass building
      Array.from({ length: 24 }, () => Math.random() * 10), // small building
    ]);
  }, []);
  
  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer 
      id="animated-footer" 
      className={`bg-gradient-to-b from-blue-900 via-gray-900 to-gray-900 text-white py-16 relative overflow-hidden transition-all duration-1000 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Cityscape animation layer */}
      <div className="absolute bottom-0 left-0 w-full h-64 md:h-80 overflow-hidden">
        {/* Sky with stars and moon */}
        <div className="absolute w-full h-full">
          {/* Moon */}
          <div className="absolute top-12 right-24 w-12 h-12 rounded-full bg-yellow-100 opacity-80 shadow-lg">
            {/* Moon craters */}
            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-yellow-200 opacity-50"></div>
            <div className="absolute top-5 left-7 w-1 h-1 rounded-full bg-yellow-200 opacity-50"></div>
            <div className="absolute top-7 left-3 w-1.5 h-1.5 rounded-full bg-yellow-200 opacity-50"></div>
          </div>
          
          {/* Stars - Use the client-side generated stars instead of inline random values */}
          {stars.map((star, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                width: `${star.width}px`,
                height: `${star.height}px`,
                top: `${star.top}%`,
                left: `${star.left}%`,
                opacity: star.opacity,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${star.animationDuration}s`
              }}
            ></div>
          ))}
          
          {/* Shooting star */}
          <div
            className="absolute h-px w-20 bg-white"
            style={{
              top: '15%',
              left: '65%',
              transform: 'rotate(45deg)',
              opacity: 0,
              animation: animationActive ? 'shootingStar 6s linear infinite 4s' : 'none'
            }}
          ></div>
        </div>

        {/* Buildings background layer */}
        <div className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${animationActive ? 'opacity-100' : 'opacity-0'}`}>
          {/* Modern glass skyscraper */}
          <div className="absolute bottom-0 left-4 w-20 md:w-24 h-56 md:h-64 bg-gray-700 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-transparent opacity-30"></div>
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-14 gap-1 p-1">
              {[...Array(56)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-blue-300 rounded-sm opacity-0"
                  style={{
                    animation: animationActive ? `windowLight 5s infinite ${windowAnimationDelays[0]?.[i] || 0}s` : 'none'
                  }}
                ></div>
              ))}
            </div>
            {/* Rooftop elements */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-600"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-red-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
            </div>
          </div>
          
          {/* Tall skyscraper */}
          <div className="absolute bottom-0 left-28 w-16 md:w-24 h-48 md:h-64 bg-gray-800 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-12 gap-1 p-1">
              {[...Array(36)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-yellow-400 rounded-sm opacity-0"
                  style={{
                    animation: animationActive ? `windowLight 5s infinite ${windowAnimationDelays[1]?.[i] || 0}s` : 'none'
                  }}
                ></div>
              ))}
            </div>
            {/* Antenna */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-400">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            </div>
          </div>
          
          {/* Wide office building */}
          <div className="absolute bottom-0 left-48 md:left-56 w-32 md:w-40 h-32 md:h-44 bg-gray-700 rounded-t-md overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1 p-1">
              {[...Array(36)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-yellow-400 rounded-sm opacity-0"
                  style={{
                    animation: animationActive ? `windowLight 7s infinite ${windowAnimationDelays[2]?.[i] || 0}s` : 'none'
                  }}
                ></div>
              ))}
            </div>
            {/* Billboard */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gray-800 rounded overflow-hidden border border-gray-600">
              <div className="absolute inset-1 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">REAL ESTATE</span>
              </div>
            </div>
          </div>
          
          {/* Modern glass building */}
          <div className="absolute bottom-0 right-48 w-20 md:w-28 h-40 md:h-56 bg-blue-900 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-10 gap-px p-px">
              {[...Array(40)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-blue-400 rounded-sm opacity-0"
                  style={{
                    animation: animationActive ? `windowLight 6s infinite ${windowAnimationDelays[3]?.[i] || 0}s` : 'none'
                  }}
                ></div>
              ))}
            </div>
            {/* Logo on building */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white rounded-full opacity-40 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 opacity-70"></div>
            </div>
          </div>
          
          {/* Futuristic circular building */}
          <div className="absolute bottom-0 right-16 w-24 h-36 md:h-48">
            <div className="absolute bottom-0 left-0 w-full h-full bg-gray-700 rounded-t-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-40"></div>
              <div className="absolute inset-4 grid grid-cols-6 grid-rows-6 gap-1">
                {[...Array(36)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-blue-300 rounded-sm opacity-0"
                    style={{
                      animation: animationActive ? `windowLight 4s infinite ${windowAnimationDelays[4]?.[i] || 0}s` : 'none'
                    }}
                  ></div>
                ))}
              </div>
            </div>
            {/* Center spire */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-400">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-2 rounded-full bg-red-500"></div>
            </div>
          </div>
          
          {/* Houses row */}
          <div className="absolute bottom-0 right-72 flex space-x-1">
            {/* House with roof */}
            <div className="relative w-12 md:w-16 h-20 md:h-24">
              <div className="absolute bottom-0 w-full h-14 md:h-16 bg-orange-800"></div>
              <div className="absolute bottom-14 md:bottom-16 left-0 w-full h-0 border-l-[24px] md:border-l-[32px] border-l-transparent border-r-[24px] md:border-r-[32px] border-r-transparent border-b-[16px] md:border-b-[20px] border-b-gray-700"></div>
              <div className="absolute bottom-2 left-3 md:left-4 w-6 md:w-8 h-8 md:h-10 bg-yellow-400 rounded-t-md opacity-0"
                style={{
                  animation: animationActive ? 'windowLight 4s infinite 2s' : 'none'
                }}
              ></div>
              {/* Chimney */}
              <div className="absolute bottom-20 md:bottom-24 right-2 w-2 h-4 bg-gray-800">
                {/* Smoke */}
                {animationActive && [...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-gray-300 opacity-70"
                    style={{
                      animation: `smoke 4s ease-out infinite ${i * 1.2}s`
                    }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Second house */}
            <div className="relative w-14 md:w-18 h-20 md:h-24">
              <div className="absolute bottom-0 w-full h-14 md:h-16 bg-orange-100 border border-gray-400"></div>
              <div className="absolute bottom-14 md:bottom-16 left-0 w-full h-0 border-l-[28px] md:border-l-[36px] border-l-transparent border-r-[28px] md:border-r-[36px] border-r-transparent border-b-[14px] md:border-b-[18px] border-b-red-700"></div>
              {/* Door */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 md:w-5 h-6 md:h-7 bg-brown-600 rounded-t-sm"></div>
              {/* Windows */}
              <div className="absolute bottom-8 left-2 w-3 md:w-4 h-3 md:h-4 bg-blue-200 border border-gray-400 rounded-sm opacity-0"
                style={{
                  animation: animationActive ? 'windowLight 4s infinite' : 'none'
                }}
              ></div>
              <div className="absolute bottom-8 right-2 w-3 md:w-4 h-3 md:h-4 bg-blue-200 border border-gray-400 rounded-sm opacity-0"
                style={{
                  animation: animationActive ? 'windowLight 4s infinite 2s' : 'none'
                }}
              ></div>
              
              {/* For Sale Sign */}
              <div className="absolute bottom-0 right-[-10px] h-12 w-6">
                <div className="w-0.5 h-8 bg-gray-700 absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                <div className="w-6 h-4 bg-white absolute top-0 left-0 border border-gray-400 flex items-center justify-center">
                  <span className="text-[6px] font-bold text-red-600">FOR SALE</span>
                </div>
              </div>
            </div>
            
            {/* Third house */}
            <div className="relative w-10 md:w-14 h-18 md:h-22">
              <div className="absolute bottom-0 w-full h-12 md:h-16 bg-red-900"></div>
              <div className="absolute bottom-12 md:bottom-16 left-0 w-full h-0 border-l-[20px] md:border-l-[28px] border-l-transparent border-r-[20px] md:border-r-[28px] border-r-transparent border-b-[10px] md:border-b-[14px] border-b-gray-700"></div>
              <div className="absolute bottom-2 left-2 w-6 md:w-10 h-6 md:h-8 bg-yellow-400 rounded-t-sm opacity-0"
                style={{
                  animation: animationActive ? 'windowLight 6s infinite 2.5s' : 'none'
                }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Trees row */}
        <div className={`absolute bottom-0 w-full transition-all duration-1000 ${animationActive ? 'opacity-100' : 'opacity-0'}`}>
          {/* Tree 1 */}
          <div className="absolute bottom-0 left-1/4 ml-20">
            <div className="relative w-5 md:w-6 h-16 md:h-20">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-6 md:h-8 bg-yellow-800"></div>
              <div className="absolute bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 w-5 md:w-6 h-5 md:h-6 bg-green-700 rounded-full"></div>
              <div className="absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-6 md:h-8 bg-green-700 rounded-full"></div>
              <div className="absolute bottom-11 md:bottom-14 left-1/2 transform -translate-x-1/2 w-5 md:w-6 h-5 md:h-6 bg-green-700 rounded-full"></div>
            </div>
          </div>
          
          {/* Tree 2 */}
          <div className="absolute bottom-0 right-1/4 mr-28">
            <div className="relative w-6 md:w-8 h-18 md:h-24">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-8 md:h-10 bg-yellow-800"></div>
              <div className="absolute bottom-7 md:bottom-9 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-6 md:h-8 bg-green-800 rounded-full"></div>
              <div className="absolute bottom-11 md:bottom-14 left-1/2 transform -translate-x-1/2 w-8 md:w-10 h-8 md:h-10 bg-green-800 rounded-full"></div>
              <div className="absolute bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 w-6 md:w-8 h-6 md:h-8 bg-green-800 rounded-full"></div>
            </div>
          </div>
          
          {/* Tree 3 */}
          <div className="absolute bottom-0 left-2/3 ml-8">
            <div className="relative w-4 md:w-6 h-14 md:h-18">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 md:w-2 h-5 md:h-7 bg-yellow-800"></div>
              <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 w-4 md:w-6 h-4 md:h-6 bg-green-700 rounded-full"></div>
              <div className="absolute bottom-7 md:bottom-9 left-1/2 transform -translate-x-1/2 w-5 md:w-7 h-5 md:h-7 bg-green-700 rounded-full"></div>
              <div className="absolute bottom-10 md:bottom-13 left-1/2 transform -translate-x-1/2 w-4 md:w-6 h-4 md:h-6 bg-green-700 rounded-full"></div>
            </div>
          </div>
          
          {/* Pine Tree */}
          <div className="absolute bottom-0 left-10">
            <div className="relative w-12 h-24">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-6 bg-yellow-900"></div>
              <div className="absolute bottom-5 left-0 w-full h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-green-900"></div>
              <div className="absolute bottom-10 left-1 w-10 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[7px] border-b-green-900"></div>
              <div className="absolute bottom-15 left-2 w-8 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-green-900"></div>
              <div className="absolute bottom-19 left-3 w-6 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-green-900"></div>
            </div>
          </div>
          
          {/* Bush */}
          <div className="absolute bottom-0 right-36">
            <div className="relative w-10 h-8">
              <div className="absolute bottom-0 w-full h-8 flex">
                <div className="w-5 h-5 bg-green-600 rounded-full"></div>
                <div className="w-5 h-6 bg-green-700 rounded-full -ml-2"></div>
                <div className="w-4 h-4 bg-green-800 rounded-full -ml-1"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated people - more realistic */}
        <div className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ${animationActive ? 'opacity-100' : 'opacity-0'}`}>
          {/* Running person with briefcase */}
          <div 
            className="absolute bottom-1 h-12 w-12 md:h-16 md:w-16"
            style={{
              left: '10%',
              animation: animationActive ? 'personRunning 15s linear infinite' : 'none'
            }}
          >
            {/* Body */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-6 md:h-8 bg-blue-700 rounded-md"></div>
            {/* Head */}
            <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-3 md:h-4 bg-[#FFD3B4] rounded-full"></div>
            {/* Hair */}
            <div className="absolute bottom-7 md:bottom-9 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-1 md:h-1.5 bg-gray-800 rounded-t-full"></div>
            {/* Legs - animated */}
            <div 
              className="absolute bottom-0 left-1 md:left-2 w-1 md:w-1.5 h-3 md:h-4 bg-gray-800 rounded-sm origin-top"
              style={{ animation: animationActive ? 'legMoving 0.5s infinite alternate' : 'none' }}
            ></div>
            <div 
              className="absolute bottom-0 right-1 md:right-2 w-1 md:w-1.5 h-3 md:h-4 bg-gray-800 rounded-sm origin-top"
              style={{ animation: animationActive ? 'legMoving 0.5s infinite alternate-reverse' : 'none' }}
            ></div>
            {/* Arms - animated */}
            <div 
              className="absolute bottom-3 md:bottom-4 left-0 w-3 md:w-4 h-1 md:h-1.5 bg-blue-700 rounded-full origin-right"
              style={{ animation: animationActive ? 'armSwinging 0.5s infinite alternate' : 'none' }}
            ></div>
            <div 
              className="absolute bottom-3 md:bottom-4 right-0 w-3 md:w-4 h-1 md:h-1.5 bg-blue-700 rounded-full origin-left"
              style={{ animation: animationActive ? 'armSwinging 0.5s infinite alternate-reverse' : 'none' }}
            ></div>
            {/* Briefcase */}
            <div className="absolute bottom-2 md:bottom-3 right-3 md:right-4 w-2 md:w-3 h-2 md:h-3 bg-gray-600 border border-gray-700"></div>
          </div>
          
          {/* Person with shopping bags */}
          <div 
            className="absolute bottom-1 h-12 md:h-16"
            style={{
              left: '40%',
              animation: animationActive ? 'personWalking 20s linear infinite 2s' : 'none'
            }}
          >
            {/* Body */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-6 md:h-8 bg-pink-600 rounded-md"></div>
            {/* Head */}
            <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-3 md:h-4 bg-yellow-200 rounded-full"></div>
            {/* Legs - animated */}
            <div 
              className="absolute bottom-0 left-1 md:left-2 w-1 md:w-2 h-3 md:h-4 bg-gray-800 rounded-sm origin-top"
              style={{ animation: animationActive ? 'legMoving 0.8s infinite alternate' : 'none' }}
            ></div>
            <div 
              className="absolute bottom-0 right-1 md:right-2 w-1 md:w-2 h-3 md:h-4 bg-gray-800 rounded-sm origin-top"
              style={{ animation: animationActive ? 'legMoving 0.8s infinite alternate-reverse' : 'none' }}
            ></div>
            {/* Shopping bags */}
            <div className="absolute bottom-2 left-4 w-2 h-3 bg-blue-500"></div>
            <div className="absolute bottom-2 right-4 w-2 h-4 bg-green-500"></div>
          </div>
          
          {/* Group of people discussing real estate */}
          <div 
            className="absolute bottom-1 h-12 md:h-16"
            style={{
              left: '75%',
              animation: animationActive ? 'peopleStanding 3s ease-in-out infinite' : 'none'
            }}
          >
            {/* Person 1 - real estate agent */}
            <div className="absolute bottom-0 left-0 w-6 md:w-8">
              {/* Body */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-6 md:h-8 bg-red-600 rounded-md"></div>
              {/* Head */}
              <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-3 md:h-4 bg-yellow-200 rounded-full"></div>
              {/* Arm with paper */}
              <div className="absolute bottom-4 md:bottom-5 right-0 w-4 md:w-5 h-1 md:h-2 bg-red-600 rounded-full">
                <div className="absolute top-0 right-0 w-2 md:w-3 h-3 md:h-4 bg-white transform rotate-3"></div>
              </div>
            </div>
            
            {/* Person 2 - client */}
            <div className="absolute bottom-0 left-5 md:left-7 w-6 md:w-8">
              {/* Body */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-6 md:h-8 bg-green-600 rounded-md"></div>
              {/* Head */}
              <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-3 md:h-4 bg-yellow-200 rounded-full"></div>
              {/* Arm pointing */}
              <div 
                className="absolute bottom-4 md:bottom-5 left-0 w-4 md:w-5 h-1 md:h-2 bg-green-600 rounded-full"
                style={{ animation: animationActive ? 'armPointing 2s infinite alternate' : 'none' }}
              ></div>
            </div>
            
            {/* Person 3 - another client */}
            <div className="absolute bottom-0 left-10 md:left-14 w-6 md:w-8">
              {/* Body */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-6 md:h-8 bg-purple-600 rounded-md"></div>
              {/* Head */}
              <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-3 md:h-4 bg-yellow-200 rounded-full"></div>
              {/* Arms folded */}
              <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 w-4 md:w-5 h-1 md:h-2 bg-purple-600 rounded-full"></div>
            </div>
          </div>
          
          {/* Child with balloon */}
          <div className="absolute bottom-1 left-58 w-5 h-10">
            {/* Body */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-4 bg-blue-400 rounded-md"></div>
            {/* Head */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-200 rounded-full"></div>
            {/* Balloon */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="w-3 h-4 bg-red-500 rounded-full animate-balloon"></div>
              <div className="absolute top-4 left-1.5 w-0.5 h-4 bg-gray-400"></div>
            </div>
          </div>
        </div>
        
        {/* Cars and vehicles with fixed direction */}
        <div className={`absolute bottom-2 w-full transition-all duration-1000 ${animationActive ? 'opacity-100' : 'opacity-0'}`}>
          {/* Car 1 - sedan */}
          <div 
            className="absolute bottom-1 h-5 w-10"
            style={{
              right: '5%',
              animation: animationActive ? 'carDriving 12s linear infinite' : 'none'
            }}
          >
            {/* Car body */}
            <div className="absolute bottom-0 w-full h-3 bg-blue-600 rounded-md"></div>
            {/* Car top */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-blue-700 rounded-t-md"></div>
            {/* Wheels */}
            <div className="absolute bottom-0 left-1 w-2 h-2 bg-gray-800 rounded-full border border-gray-400"></div>
            <div className="absolute bottom-0 right-1 w-2 h-2 bg-gray-800 rounded-full border border-gray-400"></div>
            {/* Windows */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-5 h-1 bg-blue-300 opacity-60"></div>
            {/* Headlights */}
            <div className="absolute bottom-1 right-0 w-1 h-1 bg-yellow-200 animate-pulse"></div>
          </div>
          
          {/* Car 2 - luxury SUV */}
          <div 
            className="absolute bottom-1 h-6 w-12"
            style={{
              left: '20%',
              animation: animationActive ? 'carDriving 16s linear infinite 2s reverse' : 'none'
            }}
          >
            {/* Car body */}
            <div className="absolute bottom-0 w-full h-3 bg-black rounded-md"></div>
            {/* Car top */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-gray-900 rounded-t-md"></div>
            {/* Wheels */}
            <div className="absolute bottom-0 left-2 w-2 h-2 bg-gray-800 rounded-full border border-gray-400"></div>
            <div className="absolute bottom-0 right-2 w-2 h-2 bg-gray-800 rounded-full border border-gray-400"></div>
            {/* Windows */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-7 h-2 bg-blue-400 opacity-60"></div>
            {/* Taillights */}
            <div className="absolute bottom-1 left-0 w-1 h-1 bg-red-500 animate-pulse"></div>
          </div>
          
          {/* Truck with moving boxes */}
          <div 
            className="absolute bottom-1 h-8 w-16"
            style={{
              left: '-10%',
              animation: animationActive ? 'truckDriving 25s linear infinite 5s' : 'none'
            }}
          >
            {/* Cab */}
            <div className="absolute bottom-0 left-0 w-5 h-5 bg-green-600 rounded-md"></div>
            {/* Truck bed */}
            <div className="absolute bottom-0 left-5 w-11 h-4 bg-green-700 rounded-sm">
              {/* Moving boxes */}
              <div className="absolute top-0 left-1 transform -translate-y-2 w-2 h-2 bg-yellow-700"></div>
              <div className="absolute top-0 left-4 transform -translate-y-3 w-3 h-3 bg-brown-600"></div>
              <div className="absolute top-0 left-8 transform -translate-y-2 w-2 h-2 bg-orange-800"></div>
            </div>
            {/* Wheels */}
            <div className="absolute bottom-0 left-2 w-2 h-2 bg-gray-800 rounded-full border border-gray-400"></div>
            <div className="absolute bottom-0 left-8 w-2 h-2 bg-gray-800 rounded-full border border-gray-400"></div>
            <div className="absolute bottom-0 left-12 w-2 h-2 bg-gray-800 rounded-full border border-gray-400"></div>
            {/* Headlights */}
            <div className="absolute bottom-2 left-0 w-1 h-1 bg-yellow-200 animate-pulse"></div>
          </div>
        </div>
        
        {/* Road */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gray-800">
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 flex justify-between">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="w-8 h-px bg-yellow-400 opacity-60"
                style={{
                  animation: animationActive ? 'roadMarkersMoving 10s linear infinite' : 'none'
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Street lamp */}
      <div className={`absolute bottom-4 left-1/3 transition-all duration-1000 ${animationActive ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-1 h-16 bg-gray-700"></div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gray-800 flex justify-center">
          <div className="w-2 h-1 bg-yellow-300 animate-glow"></div>
        </div>
        <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-yellow-200 opacity-20 animate-glow"></div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 md:mb-0">
          {/* Logo & Description */}
          <div className={`transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500">BlocAbode</h3>
              <div className="ml-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          
            <div className="mt-6 flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6 hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6 hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6 hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <span className="inline-block w-8 h-px bg-blue-400 mr-2"></span>
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', href: '/' },
                { name: 'Buy', href: '/page/buy' },
                { name: 'Sell', href: '/page/sell' },
              ].map((link, index) => (
                <li key={index} className="group">
                  <a 
                    href={link.href} 
                    className="text-gray-300 group-hover:text-white transition-colors flex items-center"
                  >
                    <span className="inline-block w-0 group-hover:w-3 h-px bg-blue-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <span className="inline-block w-8 h-px bg-blue-400 mr-2"></span>
              Contact
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-400 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Blockchain Avenue<br/>San Francisco, CA 94105</span>
              </li>
              <li className="flex items-center group hover:text-white transition-colors">
                <svg className="h-5 w-5 text-blue-400 mr-3 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>contact@blocabode.com</span>
              </li>
              <li className="flex items-center group hover:text-white transition-colors">
                <svg className="h-5 w-5 text-blue-400 mr-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <span className="inline-block w-8 h-px bg-blue-400 mr-2"></span>
              Subscribe
            </h3>
            
            <form onSubmit={handleSubscribe} className="relative">
              <div className="flex items-center border-b border-blue-400 pb-1 mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="bg-transparent text-gray-300 w-full focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors focus:outline-none"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              {isSubmitted && (
                <div className="absolute -bottom-6 left-0 text-green-400 text-sm animate-fade-in-out">
                  Thank you for subscribing!
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className={`mt-16 pt-8 border-t border-gray-800 flex flex-col justify-between items-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* <p className="text-white-600 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} BlocAdobe. All rights reserved. Powered by blockchain technology.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</a>
          </div> */}
        </div>
      </div>


    </footer>
  );
};

export default Footer;