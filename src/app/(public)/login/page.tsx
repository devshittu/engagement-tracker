'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoginForm } from '@/components/Auth/LoginForm';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [redirectTimestamp, setRedirectTimestamp] = useState(0);

  const nextUrl = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    setIsMounted(true);
    // Check for redirect loop using a cookie
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    );
    const timestamp = parseInt(cookies['redirect-timestamp'] || '0', 10);
    setRedirectTimestamp(timestamp);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && user) {
      console.log('LoginPage: User authenticated:', user.id);
      console.log('LoginPage: Redirect timestamp:', redirectTimestamp);
      console.log('LoginPage: Next URL:', nextUrl);

      const now = Date.now();
      const timeSinceLastRedirect = now - redirectTimestamp;

      // Break the loop if redirect occurred recently
      if (redirectTimestamp && timeSinceLastRedirect < 5000) {
        console.log(
          'LoginPage: Detected redirect loop, redirecting to /dashboard',
        );
        router.push('/dashboard');
        return;
      }

      // Avoid redirecting if already on the login page with a nested 'next' parameter
      if (nextUrl.includes('/login')) {
        console.log(
          'LoginPage: Detected nested login redirect, redirecting to /dashboard',
        );
        router.push('/dashboard');
        return;
      }

      console.log('LoginPage: Redirecting to:', nextUrl);
      router.push(nextUrl);
    }
  }, [isMounted, isLoading, user, router, nextUrl, redirectTimestamp]);

  if (!isMounted || isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="flex items-center justify-center min-h-screen-x bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl p-6">
        <LoginForm nextUrl={nextUrl} />
      </div>
    </div>
  );
}
// src/app/(public)/login/page.tsx
