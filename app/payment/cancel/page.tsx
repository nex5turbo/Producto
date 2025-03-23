'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // 3초 후 자동으로 메인 페이지로 이동
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gray-100 text-gray-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">결제 취소됨</h2>
          <p className="text-gray-600 mb-6">
            PayPal 결제가 취소되었습니다.
            잠시 후 메인 페이지로 이동합니다...
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => router.push('/')}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90"
            >
              지금 메인 페이지로 이동
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 