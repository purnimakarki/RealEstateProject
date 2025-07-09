'use client'
import React, { useState, useEffect } from 'react';
import { ChevronRight,  Globe, Zap, TrendingUp, Shield, Users, DollarSign, ArrowRight, Building, Coins, Eye, PieChart, Wallet, Star, CheckCircle } from 'lucide-react';
import { useWallet } from '../components/hooks/usewallet';
import { useRouter } from 'next/navigation';

export default function HowItWorksRedesign() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { account, connectWallet, isConnecting } = useWallet();
  const router = useRouter();
  const [particles, setParticles] = useState<Array<{left:number,top:number,animationDelay:number,animationDuration:number}>>([]);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 4000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        animationDelay: Math.random() * 3,
        animationDuration: 2 + Math.random() * 3,
      }))
    );
  }, []);

  const steps = [
    {
      icon: <Building className="w-12 h-12" />,
      title: "List Your Property",
      description: "Submit your premium property for blockchain tokenization with our advanced verification system",
      color: "from-slate-600 to-gray-600",
      bgImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      details: ["Professional valuation", "Legal documentation", "Smart contract creation"]
    },
    {
      icon: <Coins className="w-12 h-12" />,
      title: "Tokenization Process",
      description: "Transform your property into secure digital tokens representing fractional ownership shares",
      color: "from-stone-600 to-slate-600",
      bgImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      details: ["Blockchain deployment", "Token generation", "Compliance verification"]
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Trade & Invest",
      description: "Seamlessly buy, sell, and trade property tokens on our secure marketplace platform",
      color: "from-gray-600 to-zinc-600",
      bgImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      details: ["Instant transactions", "Portfolio tracking", "Market analytics"]
    },
    {
      icon: <DollarSign className="w-12 h-12" />,
      title: "Earn Returns",
      description: "Receive automated rental income distributions and watch your investment grow",
      color: "from-neutral-600 to-stone-600",
      bgImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      details: ["Monthly dividends", "Capital appreciation", "Tax optimization"]
    }
  ];

  const benefits = [
    { 
      icon: <Shield className="w-8 h-8" />, 
      title: "Bank-Level Security", 
      desc: "Military-grade encryption and multi-signature wallets protect your investments", 
      color: "from-slate-500 to-gray-500",
      stat: "99.9% Uptime"
    },
    { 
      icon: <Globe className="w-8 h-8" />, 
      title: "Global Accessibility", 
      desc: "Invest in premium real estate from anywhere in the world, 24/7", 
      color: "from-stone-500 to-zinc-500",
      stat: "150+ Countries"
    },
    { 
      icon: <Users className="w-8 h-8" />, 
      title: "Fractional Ownership", 
      desc: "Own a piece of luxury properties starting from just $100", 
      color: "from-gray-500 to-slate-500",
      stat: "Min. $100"
    },
    { 
      icon: <Zap className="w-8 h-8" />, 
      title: "Instant Liquidity", 
      desc: "Trade your tokens instantly without traditional real estate delays", 
      color: "from-neutral-500 to-stone-500",
      stat: "< 1 Second"
    },
    { 
      icon: <Eye className="w-8 h-8" />, 
      title: "Full Transparency", 
      desc: "Every transaction is recorded on the blockchain for complete visibility", 
      color: "from-zinc-500 to-slate-500",
      stat: "100% Transparent"
    },
    { 
      icon: <PieChart className="w-8 h-8" />, 
      title: "Smart Analytics", 
      desc: "AI-powered insights help you make informed investment decisions", 
      color: "from-gray-500 to-neutral-500",
      stat: "AI Powered"
    }
  ];

  const features = [
    "Blockchain-secured transactions",
    "Fractional ownership from $100",
    "Global 24/7 accessibility",
    "Instant liquidity trading",
    "Automated rental distributions",
    "Professional property management"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 relative overflow-hidden font-sans">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-stone-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`
            }}
          />
        ))}
      </div>

      <main className={`relative z-10 max-w-7xl mx-auto py-16 px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Hero Section */}
        <section className="text-center mb-20 py-20">          
          <h1 className="text-2xl md:text-5xl font-bold font-sans mb-8 text-gray-100 tracking-tight">
            How It Works
          </h1>
          <p className="text-lg md:text-xl font-normal font-sans text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Experience the future of real estate investment through cutting-edge blockchain technology
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={connectWallet}
              disabled={!!account || isConnecting}
              className="bg-white text-slate-600 px-10 py-5 rounded-full font-bold text-lg font-sans hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {account ? 'Wallet Connected' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
              <ChevronRight className="w-6 h-6 inline ml-2" />
            </button>
            <button
              onClick={() => {
                if (account) {
                  router.push('/page/buy');
                } else {
                  alert('Please connect your wallet to browse properties.');
                }
              }}
              className="border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg font-sans hover:bg-white/10 transition-all duration-300"
            >
              Browse Properties
            </button>
          </div>
        </section>

        {/* Revolutionary Technology Section */}
        <section className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Revolutionary Technology</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Our platform combines blockchain security with real estate investment, creating unprecedented opportunities for global investors to participate in premium property markets.
              </p>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-3xl p-8 backdrop-blur-lg border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">$2.5B+</div>
                    <div className="text-gray-300">Assets Tokenized</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">50K+</div>
                    <div className="text-gray-300">Active Investors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">150+</div>
                    <div className="text-gray-300">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">12%</div>
                    <div className="text-gray-300">Avg. Annual Return</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Steps */}
        <section className="mb-24">
          <h2 className="text-5xl font-bold text-white text-center mb-16">The Process</h2>
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-700 hover:scale-105 cursor-pointer ${
                  activeStep === index ? 'ring-4 ring-gray-400 shadow-2xl' : 'hover:shadow-xl'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                  style={{ backgroundImage: `url('${step.bgImage}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20 group-hover:from-black/80"></div>
                <div className="relative z-10 p-8 h-80 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-lg`}>
                      {step.icon}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-200 text-sm leading-relaxed mb-4 flex-grow">{step.description}</p>
                  <div className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <span className="text-gray-300 text-xs">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-24">
          <h2 className="text-5xl font-bold text-white text-center mb-16">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {benefit.icon}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">{benefit.title}</h3>
                    <span className="text-xs font-bold text-gray-300 bg-slate-500/20 px-3 py-1 rounded-full">{benefit.stat}</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tokenization Visualization */}
        <section className="mb-24">
          <div className="bg-gradient-to-r from-slate-600/20 to-gray-600/20 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">Tokenization Process</h2>
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-slate-600 to-gray-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                    <Building className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Physical Property</h3>
                  <p className="text-gray-300 text-sm">$1,000,000</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: `${i * 200}ms`}}></div>
                  ))}
                  <ArrowRight className="w-8 h-8 text-gray-400 animate-pulse" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: `${(i + 5) * 200}ms`}}></div>
                  ))}
                </div>
                
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-stone-600 to-zinc-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl">
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-white/90 rounded"></div>
                      ))}
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-lg">10,000 Tokens</h3>
                  <p className="text-gray-300 text-sm">$100 each</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="flex justify-center items-center py-20">
          <div className="relative w-full max-w-3xl rounded-3xl bg-gradient-to-br from-slate-800/80 to-gray-700/80 shadow-2xl p-12 border border-white/10 backdrop-blur-lg overflow-hidden">
            {/* Large faded icon in background */}
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
              <Wallet className="w-48 h-48 text-white" />
            </div>
            {/* Tagline */}
            <div className="mb-4 flex justify-center">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md tracking-widest uppercase">
                Powered by Blockchain
              </span>
            </div>
            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-extrabold font-sans mb-4 text-white tracking-tight drop-shadow-lg">
              Start Your Journey Today
            </h1>
            {/* Decorative divider */}
            <div className="mx-auto w-24 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full mb-6"></div>
            {/* Subheading */}
            <p className="text-lg md:text-xl font-normal font-sans text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of investors who are already earning passive income through tokenized real estate.
            </p>
            {/* Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button
                onClick={connectWallet}
                disabled={!!account || isConnecting}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-10 py-5 rounded-full font-bold text-lg font-sans shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {account ? 'Wallet Connected' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
                <ChevronRight className="w-6 h-6 inline ml-2" />
              </button>
              <button
                onClick={() => {
                  if (account) {
                    router.push('/page/buy');
                  } else {
                    alert('Please connect your wallet to browse properties.');
                  }
                }}
                className="border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg font-sans hover:bg-white/10 hover:text-blue-300 transition-all duration-300 shadow-lg"
              >
                Browse Properties
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}