import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // 기본 URL 설정
  const baseUrl = 'https://producto.vercel.app';
  
  // 현재 날짜를 변경 날짜로 사용
  const currentDate = new Date().toISOString();
  
  // 정적 페이지 목록
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mypage`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];
  
  return staticPages;
} 