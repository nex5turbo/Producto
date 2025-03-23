'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Script from 'next/script';

// Tech Stack Logos
const techLogos = [
  { 
    name: 'OpenAI', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
    alt: 'OpenAI Logo',
  },
  { 
    name: 'Google', 
    icon: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
    alt: 'Google Logo',
  },
  { 
    name: 'Gemini', 
    icon: '/gemini-logo.png',
    alt: 'Gemini AI Logo',
  },
  { 
    name: 'Claude', 
    icon: '/claude-logo.png',
    alt: 'Claude AI Logo',
  },
  { 
    name: 'Vercel', 
    icon: 'https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png',
    alt: 'Vercel Logo',
  },
  { 
    name: 'TensorFlow', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Tensorflow_logo.svg/1000px-Tensorflow_logo.svg.png',
    alt: 'TensorFlow Logo',
  }
];

// Features 
const features = [
  {
    title: 'Advanced AI Technology',
    description: 'Our AI systems analyze your product images and generate detailed descriptions that highlight the key features and benefits.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    title: 'Custom Design',
    description: 'We provide professionally styled product images with designs tailored to your shop\'s brand identity.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
  {
    title: 'Easy to Use',
    description: 'Simply upload your images and get professional product images in minutes, saving you time and money.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

export default function About() {
  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'Producto AI Product Image Generator',
    'description': 'Generate and manage professional product images with AI technology',
    'provider': {
      '@type': 'Organization',
      'name': 'Producto',
      'url': 'https://producto-puce.vercel.app'
    },
    'serviceType': 'AI Image Generation',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'areaServed': {
      '@type': 'Country',
      'name': 'Worldwide'
    }
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  // Infinite scroll reference and effect
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    // Clone logos for infinite scroll
    const logoContainer = scrollContainer.querySelector('.logo-container') as HTMLElement;
    if (!logoContainer) return;
    
    // Calculate width of original logos
    const logoWidth = logoContainer.scrollWidth;
    
    // Adjust scroll speed - decrease speed
    const scrollSpeed = 0.3;
    let scrollPosition = 0;
    let animationFrame: number;
    
    const scroll = () => {
      if (!scrollContainer || !logoContainer) return;
      
      // Update scroll position (right to left)
      scrollPosition -= scrollSpeed;
      
      // Restart when element is completely scrolled
      if (scrollPosition <= -logoWidth / 2) {
        scrollPosition = 0;
      }
      
      // Apply scroll
      logoContainer.style.transform = `translateX(${scrollPosition}px)`;
      
      animationFrame = requestAnimationFrame(scroll);
    };
    
    // Start scrolling
    animationFrame = requestAnimationFrame(scroll);
    
    // Cancel animation on component unmount
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <>
      <Script
        id="about-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      
      <section id="about" className="section bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Why Producto?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Efficient product image creation is crucial for e-commerce success. Producto automates this process,
              saving time and helping you present your products in the best possible way.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="bg-gray-50 rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your product images and information to create enhanced product images with professional quality.
              </p>
            </motion.div>

            <motion.div
              className="bg-gray-50 rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Time-Saving</h3>
              <p className="text-gray-600">
                Create professional product images in minutes instead of hours. Focus on growing your business while we handle the image enhancement.
              </p>
            </motion.div>

            <motion.div
              className="bg-gray-50 rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Design</h3>
              <p className="text-gray-600">
                We generate professional, conversion-optimized product images that highlight your products' best features to increase sales.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
} 