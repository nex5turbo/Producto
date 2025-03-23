'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Product Images", href: "#fitting-room" },
    { label: "About", href: "#about" },
    { label: "Pricing", href: "#pricing" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center flex-shrink-0"
          >
            <Link href="/">
              <span className="text-xl font-bold text-primary">Producto</span>
            </Link>
          </motion.div>

          {/* Desktop navigation links */}
          <div className="hidden md:flex md:items-center">
            {menuItems.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium"
              >
                {link.label}
              </motion.a>
            ))}
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: menuItems.length * 0.1 }}
              className="ml-4"
            >
              {user ? (
                <>
                  <Link href="/mypage">
                    <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary transition-colors">
                      My Page
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary transition-colors ml-3"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login">
                  <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-secondary transition-colors ml-3">
                    Login
                  </span>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
            >
              <svg 
                className="h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {openMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {openMenu && (
        <motion.div 
          className="md:hidden bg-white shadow-lg rounded-b-lg mx-4 mt-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-gray-700 hover:text-primary block px-3 py-2 text-base font-medium"
                onClick={() => setOpenMenu(false)}
              >
                {link.label}
              </a>
            ))}
            
            {user ? (
              <>
                <Link href="/mypage">
                  <span 
                    className="block px-3 py-2 text-base font-medium text-primary hover:bg-gray-100 rounded-md"
                    onClick={() => setOpenMenu(false)}
                  >
                    My Page
                  </span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setOpenMenu(false);
                  }}
                  className="w-full text-left block px-3 py-2 text-base font-medium text-primary hover:bg-gray-100 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">
                <span 
                  className="block px-3 py-2 text-base font-medium text-primary hover:bg-gray-100 rounded-md"
                  onClick={() => setOpenMenu(false)}
                >
                  Login
                </span>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
} 