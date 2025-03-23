'use client';

import { useAuth } from '@/app/context/AuthContext';
import OnboardingPage from '@/app/components/OnboardingPage';
import Hero from './components/Hero';
import ProductPage from './components/FittingRoom';
import About from './components/About';
import Pricing from './components/Pricing';

export default function Home() {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in but userData doesn't exist, show onboarding
  if (user && !userData) {
    return <OnboardingPage />;
  }

  // Normal main page content
  return (
    <>
      <Hero />
      <ProductPage />
      <About />
      <Pricing />
    </>
  );
} 