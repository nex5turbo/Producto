'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { isUserLoggedIn, getUserId } from '@/app/lib/auth';
import { supabase } from '@/app/lib/supabase';

export default function Pricing() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packageData, setPackageData] = useState<any[]>([]);

  const getPayPalClientId = () => {
    return process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
      : process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID;
  };

  useEffect(() => {
    async function checkLoginStatus() {
      const loggedIn = await isUserLoggedIn();
      setIsLoggedIn(loggedIn);
    }
    
    async function fetchPackageData() {
      try {
        const { data, error } = await supabase
          .from('credit_packages')
          .select('*')
          .order('price', { ascending: true });
          
        console.log('packageData', data);
        if (error) {
          throw error;
        }
        
        if (data) {
          setPackageData(data);
        }
      } catch (error) {
        console.error('Error fetching package data:', error);
      }
    }
    
    checkLoginStatus();
    fetchPackageData();
  }, []);

  // Temporary credit packages (replaced with data fetched from database)
  const creditPackages = [
    {
      id: '88ae030e-7c11-4f00-a1ef-aa6f1c12fd21',
      name: "Starter",
      price: 1,
      credits: 3,
      features: [
        "No expiration date",
        "Get credits for image generation"
      ],
      cta: "Buy 1 Credit",
      popular: false,
      discount_percentage: 0
    },
    {
      id: 'cce778bb-cda8-4f68-9550-947b85f33c2f',
      name: "Basic",
      price: 5,
      credits: 21,
      features: [
        "No expiration date",
        "Get credits for image generation",
        "28% discounted compare to Starter"
      ],
      cta: "Buy 7 Credits",
      popular: true,
      discount_percentage: 28
    },
    {
      id: '179061ea-ac93-4464-872f-e7d9b63f9704',
      name: "Pro",
      price: 20,
      credits: 105,
      features: [
        "No expiration date",
        "Get credits for image generation",
        "43% discounted compare to Starter"
      ],
      cta: "Buy 35 Credits",
      popular: false,
      discount_percentage: 43
    },
    {
      id: '75b6273f-a348-46fb-b929-d1e43a120bb2',
      name: "Premium",
      price: 50,
      credits: 300,
      features: [
        "No expiration date",
        "Get credits for image generation",
        "50% discounted compare to Starter"
      ],
      cta: "Buy 100 Credits",
      popular: false,
      discount_percentage: 50
    }
  ];

  // Navigate to login page
  const handleLoginRedirect = () => {
    router.push('/login');
  };
  
  // Handle package selection
  const handleSelectPackage = async (pack: any) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    
    setSelectedPackage(pack);
  };
  
  // Process PayPal payment
  const handlePayPalPayment = async (data: any, actions: any) => {
    try {
      setLoading(true);
      const userId = await getUserId();
      
      console.log('userId', userId);
      console.log('selectedPackage', selectedPackage);

      const response = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          userId: userId,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error occurred while creating the payment.');
      }
      
      // Return order ID
      return responseData.orderId;
    } catch (error: any) {
      console.error('PayPal payment creation error:', error);
      alert(error.message || 'Error occurred while creating the payment.');
      setLoading(false);
      throw error;
    }
  };
  
  // Handle PayPal payment approval
  const handlePayPalApprove = async (data: any, actions: any) => {
    try {
      // Request payment capture
      const response = await fetch('/api/payments/paypal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
        }),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error occurred while processing the payment.');
      }
      
      // Show success message
      alert(`Payment completed! ${responseData.credits} credits have been added.`);
      
      // Close modal
      setSelectedPackage(null);
      setLoading(false);
      
      // Refresh to update balance
      window.location.reload();
    } catch (error: any) {
      console.error('PayPal payment approval error:', error);
      alert(error.message || 'Error occurred while approving the payment.');
      setLoading(false);
      throw error;
    }
  };
  
  // Close modal
  const closeModal = () => {
    setShowLoginModal(false);
    setSelectedPackage(null);
  };

  return (
    <section id="pricing" className="section bg-gray-50">
      <div className="container">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Purchase Credits</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Buy credits to use our AI services. The more credits you purchase, the bigger the discount!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {creditPackages.map((pack, index) => (
            <motion.div
              key={pack.id || pack.name}
              className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                pack.popular ? 'ring-2 ring-primary' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              {pack.popular && (
                <div className="bg-primary text-white text-center py-1 text-sm font-medium">
                  Best Value
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{pack.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold">${pack.price}</span>
                </div>
                <div className="mb-4 flex items-center">
                  <span className="text-xl font-semibold text-primary">{pack.credits} credits</span>
                  {pack.discount_percentage > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Save {pack.discount_percentage}%
                    </span>
                  )}
                </div>
                <hr className="my-4" />
                <ul className="space-y-3 mb-6">
                  {pack.features?.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handleSelectPackage(pack)}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-medium ${
                    pack.popular 
                      ? 'bg-primary text-white hover:bg-primary/90' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Loading...' : pack.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-6">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-lg p-6 text-left"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h4 className="font-medium mb-2">What can I do with credits?</h4>
              <p className="text-gray-600">
                Each time you use our AI to process an image or generate content, it costs one credit. Credits do not expire, so you can use them whenever you need.
              </p>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg p-6 text-left"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h4 className="font-medium mb-2">Do credits expire?</h4>
              <p className="text-gray-600">
                No, your credits will never expire. You can purchase credits now and use them whenever you need them.
              </p>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg p-6 text-left"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">
                We accept PayPal and all major credit cards through our secure payment system.
              </p>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg p-6 text-left"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h4 className="font-medium mb-2">Can I get a refund for unused credits?</h4>
              <p className="text-gray-600">
                We do not offer refunds for unused credits. However, credits never expire, so you can use them at any time in the future.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-3">Login Required</h3>
            <p className="mb-4 text-gray-600">
              You need to be logged in to purchase credits. Would you like to go to the login page?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLoginRedirect}
                className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg"
              >
                Login
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* PayPal Payment Modal */}
      {selectedPackage && isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Payment</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span>Package:</span>
                <span className="font-medium">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Credits:</span>
                <span className="font-medium">{selectedPackage.credits} credits</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Price:</span>
                <span className="font-medium">${selectedPackage.price}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>${selectedPackage.price}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <PayPalScriptProvider options={{ 
                clientId: getPayPalClientId() || '',
                currency: "USD"
              }}>
                <PayPalButtons
                  style={{ layout: "horizontal" }}
                  disabled={loading}
                  onClick={(data, actions) => {
                    try {
                      if (loading) {
                        return actions.reject();
                      }
                      return actions.resolve();
                    } catch (error) {
                      console.error('PayPal button click error:', error);
                      return actions.reject();
                    }
                  }}
                  createOrder={handlePayPalPayment}
                  onApprove={handlePayPalApprove}
                  onCancel={() => {
                    setLoading(false);
                    closeModal();
                  }}
                  onError={(err) => {
                    console.error('PayPal error:', err);
                    alert('An error occurred while processing your payment. Please try again.');
                    setLoading(false);
                    closeModal();
                  }}
                />
              </PayPalScriptProvider>
              
              <button
                onClick={closeModal}
                className="w-full py-2 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
} 