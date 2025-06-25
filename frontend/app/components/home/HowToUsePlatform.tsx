'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, Search, Wallet, Shield, CheckCircle } from 'lucide-react';

// Function to generate deterministic random number
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const HowToUsePlatform: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [flowProgress, setFlowProgress] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = (prev + 1) % 4;
        if (next === 0) {
          setCompletedSteps([]);
          setFlowProgress(0);
        } else {
          setCompletedSteps(prevSteps => [...prevSteps, prevSteps.length]);
          setFlowProgress((next) * (100 / 3));
        }
        return next;
      });
    }, 4000); 

    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 1,
      icon: User,
      title: "Register Your Account",
      description: "Click 'Sign Up', fill in your details (email, password). Check your email for a verification link to activate your account. This keeps your profile secure.",
      visual: "👤",
      position: { x: 20, y: 25 },
    },
    {
      id: 2,
      icon: Search,
      title: "Explore Property Listings",
      description: "Once logged in, navigate to 'Properties'. Use filters like location, price range, and property type to narrow down your search. Click on any listing for more details.",
      visual: "🏠",
      position: { x: 80, y: 25 },
    },
    {
      id: 3,
      icon: Wallet,
      title: "Connect Your Crypto Wallet",
      description: "For transactions, you'll need a compatible crypto wallet (e.g., MetaMask). Go to your profile settings and find the 'Connect Wallet' option. Follow the prompts to link it securely.",
      visual: "💳",
      position: { x: 80, y: 75 },
    },
    {
      id: 4,
      icon: Shield,
      title: "Transact with Confidence",
      description: "When ready to buy or invest, click 'Purchase' on a property. Your connected wallet will prompt you to confirm the transaction. All transactions are transparently recorded on the blockchain.",
      visual: "🔒",
      position: { x: 20, y: 75 },
    }
  ];

  const connections = [
    { from: 0, to: 1, path: "M 25 25 Q 50 15 75 25" }, 
    { from: 1, to: 2, path: "M 75 25 Q 85 50 75 75" },
    { from: 2, to: 3, path: "M 75 75 Q 50 85 25 75" },
    { from: 3, to: 0, path: "M 25 75 Q 15 50 25 25" }
  ];

  // Generate deterministic values for animations
  const floatingElements = useMemo(() => {
    return Array(20).fill(null).map((_, i) => ({
      left: `${(seededRandom(i * 1) * 90 + 5).toFixed(2)}%`,
      top: `${(seededRandom(i * 2) * 90 + 5).toFixed(2)}%`,
      width: `${(seededRandom(i * 3) * 8 + 5).toFixed(2)}px`,
      height: `${(seededRandom(i * 4) * 8 + 5).toFixed(2)}px`,
      animationDelay: `${(seededRandom(i * 5) * 4).toFixed(2)}s`,
      background: "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))",
      borderRadius: "50%",
      filter: "blur(1px)"
    }));
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((style, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={style}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-5xl font-bold text-white mb-6 relative inline-block">
            
            <span className="bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent"> Platform Guide</span>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-lg -z-10"></div>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Follow these simple steps to begin your real estate journey with us.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Enhanced Progress Bar */}
          <div className="mb-16 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-full h-3 overflow-hidden max-w-3xl mx-auto backdrop-blur-sm border border-slate-700/50">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-1000 ease-out relative"
              style={{ width: `${flowProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Split Layout with enhanced animations */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Side - Step Details with hover effects */}
            <div className="space-y-8">
              <div className="flex items-center mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-1 h-10 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500 rounded-full mr-4"></div>
                <h3 className="text-3xl font-bold text-white">Step-by-Step Guide</h3>
              </div>
              
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = activeStep === index;
                const isCompleted = completedSteps.includes(index);
                const isHovered = hoveredStep === index;
                
                return (
                  <div
                    key={`step-detail-${index}`}
                    className={`relative p-8 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] cursor-pointer ${
                      isActive 
                        ? 'bg-slate-800/80 border-cyan-500/80 shadow-xl shadow-cyan-500/20' 
                        : isCompleted
                        ? 'bg-slate-800/50 border-green-500/50'
                        : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/40'
                    } backdrop-blur-md border-2`}
                    onMouseEnter={() => setHoveredStep(index)}
                    onMouseLeave={() => setHoveredStep(null)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isActive ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30' :
                        isCompleted ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' :
                        'bg-slate-700'
                      }`}>
                        <IconComponent className={`w-8 h-8 text-white transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={`text-2xl font-semibold transition-colors duration-300 ${
                            isActive ? 'text-cyan-300' : isCompleted ? 'text-green-300' : 'text-gray-100'
                          }`}>
                            {step.title}
                          </h4>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-bold text-white bg-slate-700/70 px-4 py-2 rounded-full shadow-inner">
                              Step {step.id}
                            </span>
                            {isCompleted && (
                              <CheckCircle className="w-6 h-6 text-green-400 animate-bounce" />
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {(isActive || isHovered) && (
                      <div className="absolute -inset-px bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-lg -z-10 animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Side - Enhanced Animation Visualization */}
            <div className="relative">
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-3xl p-10 border-2 border-slate-700/50 sticky top-8 overflow-hidden">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">
                    Process Flow
                  </h3>
                  <p className="text-lg text-gray-300">
                    Watch the interactive workflow visualization
                  </p>
                </div>
                
                <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-700/30 relative overflow-hidden">
                  {/* Add subtle animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-shift"></div>
                  
                  <svg viewBox="0 0 100 100" className="w-full h-96 transform hover:scale-105 transition-transform duration-500">
                    {connections.map((conn, index) => (
                      <g key={`conn-${index}`}>
                        <path
                          d={conn.path}
                          fill="none"
                          stroke="rgba(148, 163, 184, 0.3)"
                          strokeWidth="0.5"
                          strokeDasharray="2,2"
                        />
                        <path
                          d={conn.path}
                          fill="none"
                          stroke="url(#flowGradientHowToUse)"
                          strokeWidth="0.8"
                          strokeDasharray="100"
                          strokeDashoffset={completedSteps.includes(index) ? 0 : 100}
                          className="transition-all duration-1000 ease-out"
                        />
                        {completedSteps.includes(index) && (
                          <circle r={0.5} fill="#06b6d4" className="animate-pulse">
                            <animateTransform
                              attributeName="transform"
                              type="translate"
                              values="0,0;0,0"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    ))}

                    <defs>
                      <linearGradient id="flowGradientHowToUse" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>

                    {steps.map((step, index) => {
                      const isActive = activeStep === index;
                      const isCompleted = completedSteps.includes(index);
                      
                      return (
                        <g key={`step-node-${index}`} className="cursor-pointer">
                          {isActive && (
                            <>
                              <circle
                                cx={step.position.x}
                                cy={step.position.y}
                                r={10}
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth={0.5}
                                className="animate-ping opacity-75"
                              />
                              <circle
                                cx={step.position.x}
                                cy={step.position.y}
                                r={8}
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth={0.3}
                                className="animate-pulse opacity-50"
                              />
                            </>
                          )}
                          <circle
                            cx={step.position.x}
                            cy={step.position.y}
                            r={6}
                            fill={isActive ? "url(#activeGradHowToUse)" : isCompleted ? "url(#completedGradHowToUse)" : "url(#inactiveGradHowToUse)"}
                            stroke={isActive ? "#06b6d4" : isCompleted ? "#10b981" : "#64748b"}
                            strokeWidth={2}
                            className={`transition-all duration-500 ${isActive ? 'drop-shadow-lg' : ''}`}
                          />
                          <text
                            x={step.position.x}
                            y={step.position.y + 1}
                            textAnchor="middle"
                            className="text-[0.8rem] font-bold fill-white select-none"
                          >
                            {step.id}
                          </text>
                          <text
                            x={step.position.x}
                            y={step.position.y - 12}
                            textAnchor="middle"
                            className="text-[1.2rem] select-none"
                          >
                            {step.visual}
                          </text>
                          <text
                            x={step.position.x}
                            y={step.position.y + 15}
                            textAnchor="middle"
                            className={`text-[0.5rem] font-medium select-none transition-colors duration-300 ${
                              isActive ? 'fill-cyan-300' : isCompleted ? 'fill-green-300' : 'fill-gray-400'
                            }`}
                          >
                            {step.title.split(' ')[0]}
                          </text>
                          {isCompleted && (
                            <g transform={`translate(${step.position.x + 4}, ${step.position.y - 4}) scale(0.8)`}>
                              <circle r={3} fill="#10b981" />
                              <path d="M-1,0.5 L0,1.5 L2,-1" stroke="white" strokeWidth="0.6" fill="none" />
                            </g>
                          )}
                        </g>
                      );
                    })}
                    <defs>
                      <radialGradient id="activeGradHowToUse">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0891b2" />
                      </radialGradient>
                      <radialGradient id="completedGradHowToUse">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </radialGradient>
                      <radialGradient id="inactiveGradHowToUse">
                        <stop offset="0%" stopColor="#64748b" />
                        <stop offset="100%" stopColor="#475569" />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToUsePlatform;