import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PUBLIC_ROUTES, API_ROUTES } from '@/config/routes';

export async function middleware(req: NextRequest) {
  // Check if the current path is a public route or an API route
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  const isApiRoute = API_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  console.log('Middleware: Path:', req.nextUrl.pathname);
  console.log('Middleware: Is public route:', isPublicRoute);
  console.log('Middleware: Is API route:', isApiRoute);

  if (isPublicRoute && !isApiRoute) {
    return NextResponse.next();
  }

  // For API routes, let the route handler validate the Authorization header
  if (isApiRoute) {
    return NextResponse.next();
  }

  // For protected routes, check the session and redirect if not authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.log('Middleware: No session found:', sessionError?.message);
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search;
    const encodedRedirect = encodeURIComponent(redirectUrl);
    console.log('Middleware: Redirecting to login with next:', redirectUrl);
    const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
    const response = NextResponse.redirect(loginUrl);
    const redirectTimestamp = parseInt(req.cookies.get('redirect-timestamp')?.value || '0', 10);
    const now = Date.now();
    const timeSinceLastRedirect = now - redirectTimestamp;

    if (redirectTimestamp && timeSinceLastRedirect < 5000) {
      console.log('Middleware: Detected redirect loop, redirecting to /login without next');
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.set('redirect-timestamp', '', { path: '/', expires: new Date(0) });
      return response;
    }

    response.cookies.set('redirect-timestamp', now.toString(), { path: '/', maxAge: 60 });
    return response;
  }

  // Fetch the user profile from the users table
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, email, departmentId, roles (id, name, level)')
    .eq('id', session.user.id)
    .single();

  if (profileError || !userProfile) {
    console.log('Middleware: Failed to fetch user profile:', profileError?.message);
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search;
    const encodedRedirect = encodeURIComponent(redirectUrl);
    const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
    return NextResponse.redirect(loginUrl);
  }

  console.log('Middleware: Authenticated user:', userProfile.id, { path: req.nextUrl.pathname });

  // Attach user to request headers for client-side routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-supabase-user', JSON.stringify(userProfile));

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
