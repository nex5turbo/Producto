'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { motion } from 'framer-motion';
import { Plus, Minus, CreditCard, ShoppingCart } from 'lucide-react';

type CreditHistory = {
  id: string;
  user_id: string;
  amount: number;
  type: 'charge' | 'use';
  description: string;
  created_at: string;
};

type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'purchase' | 'usage' | 'refund' | 'adjustment';
  description: string;
  created_at: string;
  related_payment_id?: string;
};

type UserCredit = {
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
  last_purchase_date: string;
};

export default function CreditHistory({ userId }: { userId: string }) {
  const [history, setHistory] = useState<CreditHistory[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'usage' | 'purchases'>('usage');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. 기존 크레딧 사용 내역 가져오기
        // 1. Get existing credit usage history
        const { data: usageData, error: usageError } = await supabase
          .from('credit_usages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (usageError) throw usageError;
        
        // 2. 크레딧 구매 내역 가져오기
        // 2. Get credit purchase history
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (purchaseError) throw purchaseError;
        
        // 3. 현재 크레딧 잔액 가져오기
        // 3. Get current credit balance
        const { data: creditData, error: creditError } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (creditError && creditError.code !== 'PGRST116') throw creditError;
        
        setHistory(usageData || []);
        setTransactions(purchaseData || []);
        setCreditBalance(creditData?.balance || 0);
      } catch (error) {
        console.error('Error loading credit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Credit Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Available Credits</p>
            <h3 className="text-3xl font-bold mt-1">{creditBalance}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-full">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('usage')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'usage'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Usage History
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'purchases'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Purchase History
        </button>
      </div>
      
      {/* Usage History */}
      {activeTab === 'usage' && (
        <>
          {history.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-xl p-8 text-center"
            >
              <p className="text-gray-500">No credit usage history available.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.amount < 0
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {item.amount < 0 ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${
                      item.amount < 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {Math.abs(item.amount)} Credit
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Purchase History */}
      {activeTab === 'purchases' && (
        <>
          {transactions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 rounded-xl p-8 text-center"
            >
              <p className="text-gray-500">No credit purchase history available.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {transactions.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.transaction_type === 'purchase' 
                          ? 'bg-green-100 text-green-600'
                          : item.transaction_type === 'refund'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.transaction_type === 'purchase' ? (
                          <ShoppingCart className="w-5 h-5" />
                        ) : item.transaction_type === 'refund' ? (
                          <CreditCard className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${
                      item.transaction_type === 'purchase' || item.transaction_type === 'adjustment'
                        ? 'text-green-600'
                        : item.transaction_type === 'refund'
                          ? 'text-blue-600'
                          : 'text-red-600'
                    }`}>
                      {item.transaction_type === 'purchase' || item.transaction_type === 'adjustment' 
                        ? '+' 
                        : '-'}{item.amount}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
} 