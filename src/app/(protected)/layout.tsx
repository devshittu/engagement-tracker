import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import ClientAuthGuard from './ClientAuthGuard';
import { headers } from 'next/headers';

// Server-side authentication check
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get cookies from the request headers
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/supabase-auth-token=([^;]+)/);
  const refreshTokenMatch = cookieHeader.match(
    /supabase-refresh-token=([^;]+)/,
  );
  const token: string | null =
    tokenMatch && tokenMatch[1] ? tokenMatch[1] : null;
  const refreshToken: string | null =
    refreshTokenMatch && refreshTokenMatch[1] ? refreshTokenMatch[1] : null;

  let user = null;
  let error = null;

  console.log('ProtectedLayout: Token from cookie:', token);
  console.log('ProtectedLayout: Refresh token from cookie:', refreshToken);

  if (token) {
    // Use the token to authenticate the user with Supabase
    const { data, error: authError } = await supabase.auth.getUser(token);
    user = data.user;
    error = authError;
    console.log('ProtectedLayout: getUser result:', {
      user: user?.id,
      error: authError?.message,
    });
  }

  if (!user || error) {
    // Attempt to get the session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    console.log('ProtectedLayout: getSession result:', {
      session: sessionData.session?.user?.id,
      error: sessionError?.message,
    });

    if (sessionError || !sessionData.session) {
      // If session retrieval fails, try refreshing the session with the refresh token
      if (refreshToken) {
        const { data: refreshData, error: refreshError } =
          await supabase.auth.setSession({
            access_token: token || '',
            refresh_token: refreshToken,
          });
        console.log('ProtectedLayout: setSession result:', {
          user: refreshData?.user?.id,
          error: refreshError?.message,
        });

        if (refreshError || !refreshData?.user) {
          console.log(
            'Server-side auth failed:',
            refreshError?.message || sessionError?.message,
          );
          // Check for redirect loop using a timestamp cookie
          const redirectTimestampMatch = cookieHeader.match(
            /redirect-timestamp=([^;]+)/,
          );
          const redirectTimestamp = redirectTimestampMatch
            ? parseInt(redirectTimestampMatch[1], 10)
            : 0;
          const now = Date.now();
          const timeSinceLastRedirect = now - redirectTimestamp;

          if (redirectTimestamp && timeSinceLastRedirect < 5000) {
            console.log(
              'ProtectedLayout: Detected redirect loop, redirecting to /login without next',
            );
            // Clear cookies to break the loop
            const responseHeaders = new Headers();
            responseHeaders.append(
              'Set-Cookie',
              'supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            );
            responseHeaders.append(
              'Set-Cookie',
              'supabase-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            );
            responseHeaders.append(
              'Set-Cookie',
              'redirect-timestamp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
            );
            redirect('/login');
          }

          // Get the full request URL
          const fullPath =
            headersList.get('x-invoke-path') ||
            headersList.get('x-url') ||
            '/dashboard';
          const normalizedPath = fullPath.includes('/login')
            ? '/dashboard'
            : fullPath;
          const encodedRedirect = encodeURIComponent(normalizedPath);

          // Set the redirect timestamp cookie
          const responseHeaders = new Headers();
          responseHeaders.append(
            'Set-Cookie',
            `redirect-timestamp=${now}; path=/; max-age=60`,
          );
          redirect(`/login?next=${encodedRedirect}`);
        } else {
          user = refreshData.user;
          token = refreshData.session?.access_token;
        }
      } else {
        console.log(
          'ProtectedLayout: No refresh token available, redirecting to login',
        );
        // Check for redirect loop
        const redirectTimestampMatch = cookieHeader.match(
          /redirect-timestamp=([^;]+)/,
        );
        const redirectTimestamp = redirectTimestampMatch
          ? parseInt(redirectTimestampMatch[1], 10)
          : 0;
        const now = Date.now();
        const timeSinceLastRedirect = now - redirectTimestamp;

        if (redirectTimestamp && timeSinceLastRedirect < 5000) {
          console.log(
            'ProtectedLayout: Detected redirect loop, redirecting to /login without next',
          );
          // Clear cookies to break the loop
          const responseHeaders = new Headers();
          responseHeaders.append(
            'Set-Cookie',
            'supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
          );
          responseHeaders.append(
            'Set-Cookie',
            'supabase-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
          );
          responseHeaders.append(
            'Set-Cookie',
            'redirect-timestamp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
          );
          redirect('/login');
        }

        // Get the full request URL
        const fullPath =
          headersList.get('x-invoke-path') ||
          headersList.get('x-url') ||
          '/dashboard';
        const normalizedPath = fullPath.includes('/login')
          ? '/dashboard'
          : fullPath;
        const encodedRedirect = encodeURIComponent(normalizedPath);

        // Set the redirect timestamp cookie
        const responseHeaders = new Headers();
        responseHeaders.append(
          'Set-Cookie',
          `redirect-timestamp=${now}; path=/; max-age=60`,
        );
        redirect(`/login?next=${encodedRedirect}`);
      }
    } else {
      user = sessionData.session.user;
      token = sessionData.session.access_token;
    }
  }

  if (!user) {
    console.log('ProtectedLayout: No user found after all attempts');
    const redirectTimestampMatch = cookieHeader.match(
      /redirect-timestamp=([^;]+)/,
    );
    const redirectTimestamp = redirectTimestampMatch
      ? parseInt(redirectTimestampMatch[1], 10)
      : 0;
    const now = Date.now();
    const timeSinceLastRedirect = now - redirectTimestamp;

    if (redirectTimestamp && timeSinceLastRedirect < 5000) {
      console.log(
        'ProtectedLayout: Detected redirect loop, redirecting to /login without next',
      );
      // Clear cookies to break the loop
      const responseHeaders = new Headers();
      responseHeaders.append(
        'Set-Cookie',
        'supabase-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      );
      responseHeaders.append(
        'Set-Cookie',
        'supabase-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      );
      responseHeaders.append(
        'Set-Cookie',
        'redirect-timestamp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      );
      redirect('/login');
    }

    const fullPath =
      headersList.get('x-invoke-path') ||
      headersList.get('x-url') ||
      '/dashboard';
    const normalizedPath = fullPath.includes('/login')
      ? '/dashboard'
      : fullPath;
    const encodedRedirect = encodeURIComponent(normalizedPath);

    const responseHeaders = new Headers();
    responseHeaders.append(
      'Set-Cookie',
      `redirect-timestamp=${now}; path=/; max-age=60`,
    );
    redirect(`/login?next=${encodedRedirect}`);
  }

  return <ClientAuthGuard>{children}</ClientAuthGuard>;
}
// src/app/(protected)/layout.tsx
