'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

type AuthGuardProps = {
  children: React.ReactNode;
};

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      const redirectUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const encodedRedirect = encodeURIComponent(redirectUrl);
      console.log('Redirecting to login with next:', redirectUrl);
      router.push(`/login?next=${encodedRedirect}`);
    }
  }, [isMounted, isLoading, user, router, pathname, searchParams]);

  if (!isMounted || isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return null; // Middleware should handle this, but this is a fallback
  }

  return <>{children}</>;
};

// src/features/auth/components/AuthGuard.tsx
