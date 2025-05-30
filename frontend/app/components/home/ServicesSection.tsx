'use client'
import React from 'react';
import { Home as HomeIcon, Award, Phone, Shield, Coins, Clock } from 'lucide-react';

// Service type definition
type Service = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function ServicesSection() {
  // Services data
  const services: Service[] = [
    {
      title: "Blockchain-Secured Properties",
      description: "Every property transaction is secured with blockchain technology for maximum transparency and security.",
      icon: <Shield className="w-10 h-10 text-white" />,
    },
    {
      title: "Premium Property Selection",
      description: "Find your dream home with our expert guidance through our curated selection of premium properties.",
      icon: <HomeIcon className="w-10 h-10 text-white" />,
    },
    {
      title: "Smart Contract Selling",
      description: "Get the best value for your property with our market analysis and blockchain-powered smart contracts.",
      icon: <Award className="w-10 h-10 text-white" />,
    },
    {
      title: "Expert Consultation",
      description: "Receive personalized advice from our real estate and blockchain experts to make informed decisions.",
      icon: <Phone className="w-10 h-10 text-white" />,
    },
    {
      title: "Transparent Pricing",
      description: "All fees and costs are clearly displayed and secured in smart contracts with no hidden charges.",
      icon: <Coins className="w-10 h-10 text-white" />,
    },
    {
      title: "Quick Transactions",
      description: "Complete property transactions in a fraction of the time compared to traditional methods.",
      icon: <Clock className="w-10 h-10 text-white" />,
    }
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 bg-blue-600/30 text-blue-300 text-sm font-medium rounded-full backdrop-blur-sm">Our Services</span>
          <h2 className="mt-3 text-4xl font-bold text-white">Why Choose Our Platform</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto my-6"></div>
          <p className="mt-4 text-xl text-gray-300">
            Comprehensive blockchain-powered real estate solutions tailored to your needs
          </p>
        </div>
        
        <div className="mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-500 border border-gray-700 group hover:border-blue-500 hover:translate-y-[-5px]"
            >
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl inline-flex mb-6 group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-500 shadow-lg">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                {service.title}
              </h3>
              <p className="mt-4 text-gray-400 leading-relaxed">
                {service.description}
              </p>
              <div className="mt-6 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}