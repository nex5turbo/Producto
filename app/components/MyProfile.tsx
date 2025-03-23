'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabase';
import CreditHistory from './CreditHistory';
import ActivityHistory from './ActivityHistory';
import { motion } from 'framer-motion';
import { Settings, CreditCard, Clock, User, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyProfile() {
  const router = useRouter();
  const { user, userData, setUserData, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    shop_name: '',
    shop_category: '',
  });
  const [loading, setLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error occurred during logout:', error);
    }
  };

  const handleEditStart = () => {
    setEditForm({
      display_name: userData.display_name || '',
      shop_name: userData.shop_name || '',
      shop_category: userData.shop_category || '',
    });
    setIsEditing(true);
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: editForm.display_name,
          shop_name: editForm.shop_name,
          shop_category: editForm.shop_category,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setUserData({
        ...userData,
        ...editForm
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error occurred while updating profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('balance')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching credit balance:', error);
          return;
        }
        
        setCreditBalance(data?.balance || 0);
      } catch (error) {
        console.error('Error fetching credit balance:', error);
      }
    };
    
    fetchCreditBalance();
  }, [user]);

  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, onClick: () => router.push('/') },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Settings', icon: Settings },
    { id: 'history', label: 'Credits', icon: CreditCard },
    { id: 'activity', label: 'Activity', icon: Clock },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary border-4 border-white shadow-xl"
            >
              {userData.photo_url ? (
                <Image
                  src={userData.photo_url}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-white/10 backdrop-blur-sm text-white">
                  <span className="text-2xl font-medium">{userData.display_name?.charAt(0)}</span>
                </div>
              )}
            </motion.div>
            <div>
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-gray-900"
              >
                {userData.display_name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-500"
              >
                {userData.email}
              </motion.p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="ml-auto"
            >
              <div className="bg-white shadow-lg rounded-2xl px-6 py-4 flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Available Credits</p>
                  <p className="text-2xl font-bold text-primary">{creditBalance}</p>
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <motion.button
                  onClick={() => router.push('/#pricing')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Buy Credits
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-12 md:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <nav className="p-2">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => tab.onClick ? tab.onClick() : setActiveTab(tab.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary/5 text-primary'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        activeTab === tab.id ? 'text-primary' : 'text-gray-400'
                      }`} />
                      {tab.label}
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="col-span-12 md:col-span-9"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {activeTab === 'profile' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <p className="mt-1 text-sm text-gray-500">Update your account profile information.</p>
                  </div>
                  
                  <div className="space-y-6">
                    {isEditing ? (
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Display Name</label>
                          <input
                            type="text"
                            value={editForm.display_name}
                            onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Shop Name</label>
                          <input
                            type="text"
                            value={editForm.shop_name}
                            onChange={(e) => setEditForm({ ...editForm, shop_name: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Shop Category</label>
                          <input
                            type="text"
                            value={editForm.shop_category}
                            onChange={(e) => setEditForm({ ...editForm, shop_category: e.target.value })}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary transition-colors"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleProfileUpdate}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-secondary transition-colors disabled:opacity-50"
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsEditing(false)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Display Name</label>
                          <p className="mt-2 text-gray-900">{userData.display_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Email</label>
                          <p className="mt-2 text-gray-900">{userData.email}</p>
                        </div>
                        {userData.shop_name && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Shop Name</label>
                            <p className="mt-2 text-gray-900">{userData.shop_name}</p>
                          </div>
                        )}
                        {userData.shop_category && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500">Shop Category</label>
                            <p className="mt-2 text-gray-900">{userData.shop_category}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Member Since</label>
                          <p className="mt-2 text-gray-900">
                            {new Date(userData.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Profile Information</h3>
                          <p className="text-sm text-gray-500">Update your basic profile information</p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleEditStart}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Edit Profile
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-red-900">Account Access</h3>
                          <p className="text-sm text-red-700">Sign out from your account</p>
                        </div>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleLogout}
                          className="px-4 py-2 bg-white border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                        >
                          Sign Out
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Credit History</h2>
                  <CreditHistory userId={user.id} />
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Activity History</h2>
                  <ActivityHistory userId={user.id} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}