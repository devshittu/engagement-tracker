'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import React from 'react';

type ClientAuthGuardProps = {
  children: React.ReactNode;
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">
            Authentication Error
          </h2>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="btn btn-primary mt-4"
          >
            Go to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ClientAuthGuard({ children }: ClientAuthGuardProps) {
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
      console.log('ClientAuthGuard: User not authenticated');
      console.log('ClientAuthGuard: Current path:', pathname);
      // Avoid redirecting if already on the login page
      if (pathname === '/login') {
        console.log('ClientAuthGuard: Already on login page, no redirect');
        return;
      }

      // Normalize the redirect URL to prevent nested 'next' parameters
      const redirectUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const encodedRedirect = encodeURIComponent(redirectUrl);
      console.log(
        'ClientAuthGuard: Redirecting to login with next:',
        redirectUrl,
      );
      router.push(`/login?next=${encodedRedirect}`);
    }
  }, [isMounted, isLoading, user, router, pathname, searchParams]);

  if (!isMounted || isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}
// src/app/(protected)/ClientAuthGuard.tsx
