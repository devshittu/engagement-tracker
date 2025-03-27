
// src/middleware.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
// import { PUBLIC_ROUTES, API_ROUTES } from '@/config/routes';

// export async function middleware(req: NextRequest) {
//   const pathname = req.nextUrl.pathname;
//   const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
//   const isApiRoute = API_ROUTES.some((route) => pathname.startsWith(route));

//   console.log('Middleware: Path:', pathname);
//   console.log('Middleware: Is public route:', isPublicRoute);
//   console.log('Middleware: Is API route:', isApiRoute);

//   if (isPublicRoute && !isApiRoute) {
//     return NextResponse.next();
//   }

//   if (isApiRoute) {
//     return NextResponse.next();
//   }

//   const authHeader = req.headers.get('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.log('Middleware: No Authorization header found');
//     const redirectUrl = pathname + req.nextUrl.search;
//     const encodedRedirect = encodeURIComponent(redirectUrl);
//     console.log('Middleware: Redirecting to login with next:', redirectUrl);
//     const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
//     const response = NextResponse.redirect(loginUrl);

//     const redirectTimestamp = parseInt(
//       req.cookies.get('redirect-timestamp')?.value || '0',
//       10
//     );
//     const now = Date.now();
//     const timeSinceLastRedirect = now - redirectTimestamp;

//     if (redirectTimestamp && timeSinceLastRedirect < 5000) {
//       console.log('Middleware: Detected redirect loop, redirecting to /login without next');
//       const response = NextResponse.redirect(new URL('/login', req.url));
//       response.cookies.set('redirect-timestamp', '', {
//         path: '/',
//         expires: new Date(0),
//       });
//       return response;
//     }

//     response.cookies.set('redirect-timestamp', now.toString(), {
//       path: '/',
//       maxAge: 60,
//     });
//     return response;
//   }

//   const token = authHeader.split(' ')[1];
//   const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//   if (userError || !user) {
//     console.log('Middleware: Failed to authenticate user:', userError?.message);
//     const redirectUrl = pathname + req.nextUrl.search;
//     const encodedRedirect = encodeURIComponent(redirectUrl);
//     console.log('Middleware: Redirecting to login with next:', redirectUrl);
//     const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Fetch the user profile from the users table
//   const { data: userProfile, error: profileError } = await supabase
//     .from('users')
//     .select('id, email, departmentId, roles (id, name, level)')
//     .eq('id', user.id)
//     .single();

//   if (profileError || !userProfile) {
//     console.log('Middleware: Failed to fetch user profile:', profileError?.message);
//     const redirectUrl = pathname + req.nextUrl.search;
//     const encodedRedirect = encodeURIComponent(redirectUrl);
//     const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   console.log('Middleware: Authenticated user:', userProfile.id, { path: pathname });

//   const requestHeaders = new Headers(req.headers);
//   requestHeaders.set('x-supabase-user', JSON.stringify(userProfile));

//   return NextResponse.next({
//     request: {
//       headers: requestHeaders,
//     },
//   });
// }

// export const config = {
//   matcher: ['/(protected)/:path*', '/api/:path*'],
// };


// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
// import { PUBLIC_ROUTES, API_ROUTES } from '@/config/routes';

// export async function middleware(req: NextRequest) {
//   const pathname = req.nextUrl.pathname;
//   const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
//   const isApiRoute = API_ROUTES.some((route) => pathname.startsWith(route));

//   console.log('Middleware: Path:', pathname);
//   console.log('Middleware: Is public route:', isPublicRoute);
//   console.log('Middleware: Is API route:', isApiRoute);

//   // Skip auth checks for public and API routes
//   if (isPublicRoute || isApiRoute) {
//     return NextResponse.next();
//   }

//   const authHeader = req.headers.get('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     console.log('Middleware: No Authorization header found');
//     const redirectUrl = pathname + req.nextUrl.search;
//     const encodedRedirect = encodeURIComponent(redirectUrl);
//     console.log('Middleware: Redirecting to login with next:', redirectUrl);
//     const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   const token = authHeader.split(' ')[1];
//   const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//   if (userError || !user) {
//     console.log('Middleware: Failed to authenticate user:', userError?.message);
//     const redirectUrl = pathname + req.nextUrl.search;
//     const encodedRedirect = encodeURIComponent(redirectUrl);
//     console.log('Middleware: Redirecting to login with next:', redirectUrl);
//     const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Fetch user profile to pass to the request
//   const { data: userProfile, error: profileError } = await supabase
//     .from('users')
//     .select('id, email, departmentId, roles (id, name, level)')
//     .eq('id', user.id)
//     .single();

//   if (profileError || !userProfile) {
//     console.log('Middleware: Failed to fetch user profile:', profileError?.message);
//     const redirectUrl = pathname + req.nextUrl.search;
//     const encodedRedirect = encodeURIComponent(redirectUrl);
//     const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   console.log('Middleware: Authenticated user:', userProfile.id, { path: pathname });

//   const requestHeaders = new Headers(req.headers);
//   requestHeaders.set('x-supabase-user', JSON.stringify(userProfile));

//   return NextResponse.next({
//     request: { headers: requestHeaders },
//   });
// }

// export const config = {
//   matcher: ['/(protected)/:path*', '/api/:path*'],
// };


import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_ROUTES, API_ROUTES } from '@/config/routes';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
  const isApiRoute = API_ROUTES.some((route) => pathname.startsWith(route));

  console.log('Middleware: Path:', pathname);
  console.log('Middleware: Is public route:', isPublicRoute);
  console.log('Middleware: Is API route:', isApiRoute);

  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.log('Middleware: Failed to authenticate user:', userError?.message);
    if (isApiRoute) {
      // Skip redirect for API routes; let authMiddleware.ts handle it
      return supabaseResponse;
    }
    if (!isPublicRoute && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
      const redirectUrl = pathname + req.nextUrl.search;
      const encodedRedirect = encodeURIComponent(redirectUrl || '/dashboard');
      console.log('Middleware: Redirecting to login with next:', redirectUrl);
      const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, email, department_id, role_id, roles (id, name, level)')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    console.log('Middleware: Failed to fetch user profile:', profileError?.message);
    if (isApiRoute) {
      return supabaseResponse;
    }
    if (!isPublicRoute && !pathname.startsWith('/login')) {
      const redirectUrl = pathname + req.nextUrl.search;
      const encodedRedirect = encodeURIComponent(redirectUrl || '/dashboard');
      const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse;
  }

  console.log('Middleware: Authenticated user:', userProfile.id, { path: pathname });
  supabaseResponse.headers.set('x-supabase-user', JSON.stringify(userProfile));

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
// src/middleware.ts
