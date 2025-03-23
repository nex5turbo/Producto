'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-40 pb-16 lg:pt-48 lg:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Create Product Images <span className="text-secondary">Easily</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Generate professional product images with just a few photos. Make your e-commerce management more efficient with Producto.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.a
                href="#fitting-room"
                className="btn btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.a>
              <motion.a
                href="#pricing"
                className="btn btn-outline"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Plans
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-xl p-4 relative z-10">
              <div className="aspect-w-4 aspect-h-5 rounded overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Product image example" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="absolute top-4 left-0 -ml-4 -mt-4 p-3 bg-secondary text-white rounded shadow-lg">
                <span className="font-medium">Quick & Easy!</span>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/10 rounded-full filter blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/10 rounded-full filter blur-xl"></div>
          </motion.div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-secondary/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl"></div>
    </section>
  );
} 