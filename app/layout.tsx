import type { Metadata } from 'next';
import { Inter, Open_Sans } from 'next/font/google';
import './globals.css';
import { AuthContextProvider } from './context/AuthContext';
import { Providers } from './providers';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter', 
});

const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap', 
  variable: '--font-open-sans'
});

export const metadata: Metadata = {
  title: 'Producto - AI Product Image Generator',
  description: 'Generate professional product images from your photos with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${openSans.variable} smooth-scroll`}>
      <body className="flex flex-col min-h-screen">
        <AuthContextProvider>
          <Providers>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </Providers>
        </AuthContextProvider>
      </body>
    </html>
  );
} 