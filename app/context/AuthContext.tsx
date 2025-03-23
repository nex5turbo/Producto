'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

type UserData = {
  auth_uid: string;
  email: string;
  display_name: string;
  photo_url?: string;
  shop_name?: string;
  shop_category?: string;
  role?: string;
  come_path?: string;
  credits: number;
  created_at: string;
  session_id: string[];
};

type AuthContextType = {
  user: User | null;
  userData: any | null;
  loading: boolean;
  setUserData: (data: any) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  setUserData: () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthContextProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user data
  const loadUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log("data", data);
      
      if (data) {
        setUserData(data as UserData);
      }
      if (error) throw error;
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserData(null);
    } catch (error) {
      console.error('Error signing out', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userData,
        loading, 
        setUserData,
        signInWithGoogle, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 