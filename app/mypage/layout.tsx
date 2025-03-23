'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩이 완료된 후에만 체크 (인증 상태가 결정된 후)
    // Only check after loading is completed (after authentication state is determined)
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 로딩 중이거나 사용자가 없으면 로딩 UI를 표시
  // If loading or user doesn't exist, show loading UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 인증된 사용자만 children을 렌더링
  // Only render children for authenticated users
  return user ? <>{children}</> : null;
} 