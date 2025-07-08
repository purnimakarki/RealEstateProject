'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Quote, ArrowLeft, ArrowRight } from 'lucide-react';

// Testimonial type definition
type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
  detail: string;
};

export default function TestimonialsSection() {
  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      name: "Christina Morillo",
      role: "Homebuyer",
      quote: "Working with this team made finding my dream home so easy. Their expertise and dedication are unmatched!",
      image: "/person3.jpg",
      rating: 5,
      detail: "Bought a home in 2025"
    },
    {
      name: "Michael Brown",
      role: "Property Investor",
      quote: "As a long-time investor, I've worked with many agents, but this team consistently delivers outstanding results.",
      image: "/person2.jpg",
      rating: 5,
      detail: "Invested in 5 properties"
    },
    {
      name: "Priya Kaur",
      role: "First-Time Buyer",
      quote: "I never thought buying property could be this simple and transparent. The blockchain process gave me total confidence.",
      image: "/person4.jpg",
      rating: 5,
      detail: "Bought her first home in 2024"
    },
    {
      name: "Alexei Ivanov",
      role: "International Investor",
      quote: "Investing from abroad was seamless. I love being able to track my assets on-chain and receive instant updates.",
      image: "/person1.jpg",
      rating: 5,
      detail: "Invested from Russia"
    },
    {
      name: "Sara Lee",
      role: "Rental Property Owner",
      quote: "The automated rental income distribution is a game changer. I get paid on time, every time, with zero hassle!",
      image: "/person5.jpg",
      rating: 5,
      detail: "Owns 3 rental units"
    },
    {
      name: "Omar Farouk",
      role: "Tech Entrepreneur",
      quote: "This platform is the future of real estate. The analytics and transparency are unlike anything I've seen before.",
      image: "/person6.jpg",
      rating: 5,
      detail: "Early adopter, invested in 2025  "
    }
  ];

  const [page, setPage] = useState(0);
  const testimonialsPerPage = 2;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  const paginatedTestimonials = testimonials.slice(
    page * testimonialsPerPage,
    page * testimonialsPerPage + testimonialsPerPage
  );

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
    <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
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
          {paginatedTestimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className={`relative group bg-white rounded-2xl p-8 shadow-xl border-2 transition-all duration-500 overflow-hidden ${page * testimonialsPerPage + index === 0 ? 'border-blue-400 shadow-2xl' : 'border-blue-100 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1'}`}
            >
              {/* Animated quote icon */}
              <div className="absolute -right-8 -top-8 text-blue-100 opacity-20 group-hover:opacity-40 transition animate-pulse">
                <Quote size={100} />
              </div>
              {/* Profile and details */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={80}
                    height={80}
                    className="object-cover w-20 h-20 rounded-2xl border-4 border-blue-200 shadow-lg"
                    priority
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
                </div>
                <div>
                  <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 font-medium">{testimonial.role}</p>
                  {testimonial.detail && (
                    <p className="text-xs text-blue-400 font-semibold mt-1">{testimonial.detail}</p>
                  )}
                  {/* Star rating bar */}
                  <div className="flex items-center mt-2 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Quote */}
              <blockquote className="mt-4">
                <p className="text-gray-700 text-lg leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </blockquote>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls with Side Arrows */}
        <div className="flex items-center justify-center mt-10 gap-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-full p-3 bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
            aria-label="Previous"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-gray-600 font-medium">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="rounded-full p-3 bg-blue-100 text-blue-700 hover:bg-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
            aria-label="Next"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
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