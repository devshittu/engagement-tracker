// src/components/Auth/LoginForm.tsx
'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type LoginFormProps = {
  nextUrl?: string;
};

export const LoginForm = memo(({ nextUrl = '/dashboard' }: LoginFormProps) => {
  const [email, setEmail] = useState('superadmin@example.com');
  const [password, setPassword] = useState('defaultPassword123!');
  const { login, isLoggingIn } = useAuth();
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      login(
        { email, password },
        {
          onSuccess: async () => {
            const { data } = await supabase.auth.getSession();
            console.log('Session after login:', data.session);
            if (data.session) {
              // Set the access token cookie (7 days = 604800 seconds)
              document.cookie = `supabase-auth-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`;
              // Set the refresh token cookie (30 days = 2592000 seconds, matching Supabase default)
              document.cookie = `supabase-refresh-token=${data.session.refresh_token}; path=/; max-age=2592000; SameSite=Lax`;
            }
            console.log('Redirecting to:', nextUrl);
            router.push(nextUrl);
          },
          onError: (error) => {
            console.error('Login failed:', error);
          },
        },
      );
    },
    [email, password, login, nextUrl, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Login</h2>
      <div className="form-control">
        <label className="label" htmlFor="email">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div className="form-control">
        <label className="label" htmlFor="password">
          <span className="label-text">Password</span>
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
});

LoginForm.displayName = 'LoginForm';
// src/components/Auth/LoginForm.tsx
