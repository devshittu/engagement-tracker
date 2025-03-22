import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PUBLIC_ROUTES, API_ROUTES } from '@/config/routes';

// Custom headers to pass user data
const USER_HEADER = 'x-supabase-user';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('supabase-auth-token')?.value;

  // Check if the current path is a public route or an API route
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );
  const isApiRoute = API_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(route),
  );

  console.log('Middleware: Path:', req.nextUrl.pathname);
  console.log('Middleware: Is public route:', isPublicRoute);
  console.log('Middleware: Is API route:', isApiRoute);

  if (isPublicRoute && !isApiRoute) {
    return NextResponse.next();
  }

  if (!token) {
    console.log('Middleware: No token found in cookies', {
      path: req.nextUrl.pathname,
    });
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect to login with the 'next' query parameter
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search;
    const encodedRedirect = encodeURIComponent(redirectUrl);
    console.log('Middleware: Redirecting to login with next:', redirectUrl);
    const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
    const response = NextResponse.redirect(loginUrl);
    const redirectTimestamp = parseInt(
      req.cookies.get('redirect-timestamp')?.value || '0',
      10,
    );
    const now = Date.now();
    const timeSinceLastRedirect = now - redirectTimestamp;

    if (redirectTimestamp && timeSinceLastRedirect < 5000) {
      console.log(
        'Middleware: Detected redirect loop, redirecting to /login without next',
      );
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.set('supabase-auth-token', '', {
        path: '/',
        expires: new Date(0),
      });
      response.cookies.set('supabase-refresh-token', '', {
        path: '/',
        expires: new Date(0),
      });
      response.cookies.set('redirect-timestamp', '', {
        path: '/',
        expires: new Date(0),
      });
      return response;
    }

    response.cookies.set('redirect-timestamp', now.toString(), {
      path: '/',
      maxAge: 60,
    });
    return response;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) {
    console.log('Middleware: Auth failed:', error?.message, {
      path: req.nextUrl.pathname,
    });
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Redirect to login with the 'next' query parameter
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search;
    const encodedRedirect = encodeURIComponent(redirectUrl);
    console.log('Middleware: Redirecting to login with next:', redirectUrl);
    const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
    const response = NextResponse.redirect(loginUrl);
    const redirectTimestamp = parseInt(
      req.cookies.get('redirect-timestamp')?.value || '0',
      10,
    );
    const now = Date.now();
    const timeSinceLastRedirect = now - redirectTimestamp;

    if (redirectTimestamp && timeSinceLastRedirect < 5000) {
      console.log(
        'Middleware: Detected redirect loop, redirecting to /login without next',
      );
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.set('supabase-auth-token', '', {
        path: '/',
        expires: new Date(0),
      });
      response.cookies.set('supabase-refresh-token', '', {
        path: '/',
        expires: new Date(0),
      });
      response.cookies.set('redirect-timestamp', '', {
        path: '/',
        expires: new Date(0),
      });
      return response;
    }

    response.cookies.set('redirect-timestamp', now.toString(), {
      path: '/',
      maxAge: 60,
    });
    return response;
  }

  console.log('Middleware: Authenticated user:', user.id, {
    path: req.nextUrl.pathname,
  });

  // Attach user to request headers for API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(USER_HEADER, JSON.stringify(user));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/(protected)/:path*', '/api/:path*'],
};
// src/middleware.ts
