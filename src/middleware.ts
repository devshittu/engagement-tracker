// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_ROUTES, API_ROUTES } from '@/config/routes';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
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
    if (!isPublicRoute && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
      const redirectUrl = pathname + req.nextUrl.search;
      const encodedRedirect = encodeURIComponent(redirectUrl || '/dashboard');
      console.log('Middleware: Redirecting to login with next:', redirectUrl);
      const loginUrl = new URL(`/login?next=${encodedRedirect}`, req.url);
      return NextResponse.redirect(loginUrl);
    }
    return supabaseResponse; // Allow public routes or API routes to proceed to authMiddleware
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, email, departmentId, roles (id, name, level)')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    console.log('Middleware: Failed to fetch user profile:', profileError?.message);
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