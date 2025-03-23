'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ContactModal from './ContactModal';

export default function Footer() {
  const pathname = usePathname();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  // Privacy Policy 및 Terms of Service 페이지에서는 푸터를 간소화
  const isLegalPage = pathname === '/privacy-policy' || pathname === '/terms-of-service';

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto py-8 px-4">
        {!isLegalPage ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Producto</h3>
              <p className="text-sm text-gray-600 mb-4">
                Transform your product images into professional product images with AI.
              </p>
              <div className="flex items-center space-x-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="mailto:nex5turbo@gmail.com" className="text-gray-500 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-primary text-sm transition-colors">
                    AI Product Image Generator
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-600 hover:text-primary text-sm transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={openContactModal}
                    className="text-gray-600 hover:text-primary text-sm transition-colors text-left"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-gray-600 hover:text-primary text-sm transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-gray-600 hover:text-primary text-sm transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // 간소화된 푸터 - 법적 페이지에 표시
          <div className="flex flex-col items-center">
            <Link href="/" className="text-primary hover:text-primary/80 font-medium">
              ← Back to Producto
            </Link>
          </div>
        )}
        
        <div className="border-t border-gray-200 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Producto. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-xs text-gray-500 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-xs text-gray-500 hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
    </footer>
  );
} 