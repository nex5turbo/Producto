'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/lib/supabase';

type OnboardingData = {
  hasShop: boolean;
  shopName: string;
  shopCategory: string;
  role: string;
  comePath: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUserData } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    hasShop: false,
    shopName: '',
    shopCategory: '',
    role: '',
    comePath: '',
  });

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // 1. Save user data to users table
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          session_ids: [],
          email: user.email,
          display_name: user.user_metadata?.name || user.email?.split('@')[0],
          photo_url: user.user_metadata?.picture,
          shop_name: formData.hasShop ? formData.shopName : null,
          shop_category: formData.hasShop ? formData.shopCategory : null,
          role: formData.role,
          come_path: formData.comePath,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      // 2. Add 1 credit to user_credits table
      const currentDate = new Date().toISOString();
      const { error: creditsError } = await supabase
        .from('user_credits')
        .insert({
          user_id: user.id,
          balance: 1,
          created_at: currentDate,
        });
        
      if (creditsError) throw creditsError;
      
      setUserData(data);
      
      // Next.js Router로 이동이 작동하지 않는 경우 window.location 사용
      try {
        router.refresh(); // 상태 업데이트
        router.push('/'); // 메인 페이지로 이동
        
        // 200ms 후에도 이동이 안 되었다면 window.location 사용
        setTimeout(() => {
          window.location.href = '/';
        }, 200);
      } catch (navError) {
        console.error('Navigation error:', navError);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Producto
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please tell us a bit about yourself
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Do you currently operate an online store?
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="hasShop"
                          checked={formData.hasShop}
                          onChange={() => setFormData({ ...formData, hasShop: true })}
                        />
                        <span className="ml-2">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          name="hasShop"
                          checked={!formData.hasShop}
                          onChange={() => setFormData({ ...formData, hasShop: false })}
                        />
                        <span className="ml-2">No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.hasShop && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Shop Name
                      </label>
                      <input
                        type="text"
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Shop Category
                      </label>
                      <select
                        value={formData.shopCategory}
                        onChange={(e) => setFormData({ ...formData, shopCategory: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                      >
                        <option value="">Please select</option>
                        <option value="fashion">Fashion</option>
                        <option value="accessories">Fashion Accessories</option>
                        <option value="beauty">Beauty</option>
                        <option value="living">Living/Lifestyle</option>
                        <option value="food">Food</option>
                        <option value="etc">Other</option>
                      </select>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    What is your role?
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="">Please select</option>
                    <option value="ceo">CEO/Representative</option>
                    <option value="manager">Manager</option>
                    <option value="marketer">Marketer</option>
                    <option value="designer">Designer</option>
                    <option value="developer">Developer</option>
                    <option value="etc">Other</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    How did you know about our service?
                  </label>
                  <select
                    value={formData.comePath}
                    onChange={(e) => setFormData({ ...formData, comePath: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  >
                    <option value="">Please select</option>
                    <option value="search">Search</option>
                    <option value="sns">Social Media</option>
                    <option value="blog">Blog</option>
                    <option value="recommendation">Friend Recommendation</option>
                    <option value="advertisement">Advertisement</option>
                    <option value="etc">Other</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={nextStep}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : step === 3 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 