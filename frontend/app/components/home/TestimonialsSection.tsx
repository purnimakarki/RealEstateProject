'use client';
import React from 'react';
import Image from 'next/image';

// Testimonial type definition
type Testimonial = {
  name: string;
  role: string;
  quote: string;
  image: string;
};

export default function TestimonialsSection() {
  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      name: "Christina Morillo",
      role: "Homebuyer",
      quote: "Working with this team made finding my dream home so easy. Their expertise and dedication are unmatched!",
      image: "/person3.jpg"  
    },
    {
      name: "Michael Brown",
      role: "Property Investor",
      quote: "As a long-time investor, I've worked with many agents, but this team consistently delivers outstanding results.",
      image: "/person2.jpg"  
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-8xl mx-auto px-5 sm:px-7S lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
          <p className="mt-4 text-lg text-gray-600">
            Hear from our satisfied clients about their experiences
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden relative">
                  <Image 
                    src={testimonial.image}
                    alt={testimonial.name} 
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="mt-4 text-gray-700 italic">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}