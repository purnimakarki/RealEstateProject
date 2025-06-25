'use client';
import React from 'react';
import { Zap, ShieldCheck, Users, Repeat } from 'lucide-react';
import { motion } from 'framer-motion';

const HowPlatformWorks = () => {
  const steps = [
    {
      icon: <Zap size={48} className="" />,
      title: 'Step 1: Secure Sign-Up & Verification',
      description: 'Create your account with our secure system. We ensure all users are verified for a trustworthy environment.',
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      hoverBgColor: 'group-hover:from-blue-500/20 group-hover:to-cyan-500/20',
    },
    {
      icon: <ShieldCheck size={48} className="" />,
      title: 'Step 2: Blockchain-Powered Transactions',
      description: 'All property listings and transactions are recorded on the blockchain, ensuring transparency and immutability.',
      bgColor: 'from-purple-500/10 to-pink-500/10',
      hoverBgColor: 'group-hover:from-purple-500/20 group-hover:to-pink-500/20',
      iconBg: 'bg-purple-500/20',
    },
    {
      icon: <Users size={48} className="" />,
      title: 'Step 3: Connect Buyers & Sellers Directly',
      description: 'Our platform facilitates direct interaction between buyers and sellers, streamlining the process and reducing fees.',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      hoverBgColor: 'group-hover:from-green-500/20 group-hover:to-emerald-500/20',
      iconBg: 'bg-green-500/20',
    },
    {
      icon: <Repeat size={48} className="" />,
      title: 'Step 4: Fractional Ownership & Tokenization',
      description: 'Invest in real estate through tokenized fractional ownership, making property investment more accessible.',
      bgColor: 'from-orange-500/10 to-yellow-500/10',
      hoverBgColor: 'group-hover:from-orange-500/20 group-hover:to-yellow-500/20',
      iconBg: 'bg-orange-500/20',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 md:py-24 bg-[color:var(--pastel-surface)] overflow-hidden">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="text-center mb-12 md:mb-16 relative">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
              How Our Platform Works
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto mt-6 rounded-full"></div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 relative">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div 
                className={`
                  bg-white p-8 rounded-2xl shadow-lg transition-all duration-500
                  border border-[color:var(--pastel-border)] text-center
                  hover:shadow-2xl hover:-translate-y-1
                  bg-gradient-to-br ${step.bgColor} ${step.hoverBgColor}
                  relative z-10
                `}
              >
                <div className={`
                  ${step.iconBg} w-20 h-20 mx-auto rounded-2xl flex items-center justify-center
                  transform transition-transform duration-500 ease-out
                  group-hover:scale-110 group-hover:rotate-3
                `}>
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-[color:var(--pastel-text-primary)] mb-3 
                  transition-colors duration-300 group-hover:text-[color:var(--pastel-primary)]">
                  {step.title}
                </h3>
                <p className="text-[color:var(--pastel-text-secondary)] text-sm leading-relaxed
                  transition-colors duration-300">
                  {step.description}
                </p>

                <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"/>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-5 w-10 h-0.5 
                  bg-gradient-to-r from-[color:var(--pastel-primary)] to-transparent
                  transform -translate-y-1/2 z-0"/>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HowPlatformWorks;