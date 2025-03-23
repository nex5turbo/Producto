'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/app/lib/supabase';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 사용자가 로그인한 경우 자동으로 이름과 이메일 필드를 채웁니다
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.question.trim()) {
      setErrorMessage('Please fill out all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      setErrorMessage('');

      // Supabase qna 테이블에 질문 저장
      const { error } = await supabase
        .from('qna')
        .insert([
          {
            user_id: user?.id || null,
            name: formData.name,
            email: formData.email,
            question: formData.question,
            status: 'pending' // 관리자 답변 대기 상태
          }
        ]);

      if (error) {
        throw error;
      }
 
      // 제출 성공
      setSubmitStatus('success');
      
      // 3초 후 모달 닫기
      setTimeout(() => {
        onClose();
        // 폼 초기화
        setFormData({
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          question: ''
        });
        setSubmitStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Question submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('An error occurred while submitting the question. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-primary to-secondary p-4 text-white">
              <h2 className="text-xl font-bold">Contact us</h2>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {submitStatus === 'success' ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Question submitted successfully!</h3>
                  <p className="text-gray-600">We will respond to you as soon as possible. Thank you.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    <textarea
                      id="question"
                      name="question"
                      value={formData.question}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                      placeholder="Enter your question..."
                    />
                  </div>

                  {submitStatus === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit question</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 