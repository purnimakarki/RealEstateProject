'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

// Testimonial type definition
type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
};

export default function TestimonialsSection() {
  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      name: "Christina Morillo",
      role: "Homebuyer",
      quote: "Working with this team made finding my dream home so easy. Their expertise and dedication are unmatched!",
      image: "/person3.jpg",
      rating: 5
    },
    {
      name: "Michael Brown",
      role: "Property Investor",
      quote: "As a long-time investor, I've worked with many agents, but this team consistently delivers outstanding results.",
      image: "/person2.jpg",
      rating: 5
    }
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
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute w-96 h-96 bg-blue-400 rounded-full blur-3xl -top-48 -left-48" />
        <div className="absolute w-96 h-96 bg-purple-400 rounded-full blur-3xl -bottom-48 -right-48" />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from our satisfied clients about their experiences with our platform
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-8 rounded-full" />
        </motion.div>
        
        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 relative">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-500
                hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
                {/* Decorative quote icon */}
                <div className="absolute -right-4 -top-4 text-gray-100 opacity-30 transform rotate-12">
                  <Quote size={80} />
                </div>
                
                {/* Content wrapper */}
                <div className="relative z-10">
                  {/* Profile section */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg
                        transform transition-transform duration-500 group-hover:scale-105">
                        <Image 
                          src={testimonial.image}
                          alt={testimonial.name} 
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          priority
                        />
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
                        from-gray-800 to-gray-600">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600 font-medium">{testimonial.role}</p>
                      
                      {/* Rating stars */}
                      <div className="flex items-center mt-2 space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star 
                            key={i}
                            size={16}
                            className="fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="mt-6">
                    <p className="text-gray-700 text-lg leading-relaxed italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                  </blockquote>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Decorative dots */}
        <div className="absolute top-10 right-10 grid grid-cols-3 gap-2 opacity-20">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-400" />
          ))}
        </div>
      </motion.div>
    </section>
  );
}