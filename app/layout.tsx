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
  title: 'Producto - AI 제품 이미지 생성 서비스',
  description: 'AI 기술을 활용하여 전문적인 제품 이미지를 생성하고 관리할 수 있는 웹 서비스. 제품 정보와 샘플 이미지만 업로드하면 AI가 고품질 제품 이미지를 생성해 드립니다.',
  keywords: '인공지능, AI, 제품 이미지, 이커머스, 상품 사진, 제품 사진, 이미지 생성, OpenAI, Gemini, AI 이미지',
  authors: [{ name: 'Producto Team', url: 'https://producto.vercel.app' }],
  creator: 'Producto Team',
  publisher: 'Producto',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://producto.vercel.app',
    siteName: 'Producto',
    title: 'Producto - AI로 제품 이미지를 쉽고 빠르게 생성',
    description: 'AI 기술로 제품 이미지를 자동 생성하여 이커머스 운영을 효율화하세요. 몇 장의 제품 사진으로 다양한 각도와 스타일의 전문적인 제품 이미지를 생성합니다.',
    images: [
      {
        url: 'https://producto.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Producto - AI 제품 이미지 생성 서비스',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Producto - AI 제품 이미지 생성 서비스',
    description: 'AI 기술로 제품 이미지를 자동 생성하여 이커머스 운영을 효율화하세요.',
    images: ['https://producto.vercel.app/og-image.jpg'],
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
    canonical: 'https://producto.vercel.app',
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