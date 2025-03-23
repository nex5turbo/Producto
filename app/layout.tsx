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
  description: 'Generate and manage professional product images with AI technology. Upload product info and sample images to create high-quality product photography instantly.',
  keywords: 'artificial intelligence, AI, product images, e-commerce, product photography, image generation, OpenAI, Gemini, AI images',
  authors: [{ name: 'Producto Team', url: 'https://producto-puce.vercel.app' }],
  creator: 'Producto Team',
  publisher: 'Producto',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://producto-puce.vercel.app',
    siteName: 'Producto',
    title: 'Producto - Generate Product Images Quickly and Easily with AI',
    description: 'Streamline your e-commerce operations with AI-generated product images. Create professional product photography from just a few sample images.',
    images: [
      {
        url: 'https://producto-puce.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Producto - AI Product Image Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producto - AI Product Image Generator',
    description: 'Streamline your e-commerce operations with AI-generated product images.',
    images: ['https://producto-puce.vercel.app/og-image.jpg'],
    creator: '@producto',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://producto-puce.vercel.app',
  },
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