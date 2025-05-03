// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PUBLIC_ROUTES } from '@/config/routes';
import { logger } from '@/lib/logger';

// export async function middleware(req: NextRequest) {
//   const pathname = req.nextUrl.pathname;
//   const isPublicRoute = PUBLIC_ROUTES.some((route) =>
//     pathname.startsWith(route),
//   );

//   logger.debug('Middleware: Path:', pathname);
//   logger.debug('Middleware: Is public route:', isPublicRoute);
//   logger.debug('Middleware: Processing request', {
//     pathname,
//     isPublicRoute,
//   });
//   const token = req.cookies.get('sb-access-token')?.value;
//   if (
//     !token &&
//     !isPublicRoute &&
//     !pathname.startsWith('/login') &&
//     !pathname.startsWith('/api/auth')
//   ) {
//     logger.warn('Middleware: No token found, redirecting to login');
//     const redirectUrl = encodeURIComponent(
//       pathname + req.nextUrl.search || '/dashboard',
//     );
//     return NextResponse.redirect(
//       new URL(`/login?next=${redirectUrl}`, req.url),
//     );
//   }

//   let userProfile = null;
//   if (token && supabaseAdmin) {
//     logger.debug('Middleware: Verifying token');
//     const {
//       data: { user },
//       error,
//     } = await supabaseAdmin.auth.getUser(token);
//     if (error || !user) {
//       logger.error('Middleware: Invalid token', { error: error?.message });
//       if (!isPublicRoute) {
//         const redirectUrl = encodeURIComponent(
//           pathname + req.nextUrl.search || '/dashboard',
//         );
//         return NextResponse.redirect(
//           new URL(`/login?next=${redirectUrl}`, req.url),
//         );
//       }
//     } else {
//       logger.debug('Middleware: Fetching user profile', { userId: user.id });
//       const { data, error: profileError } = await supabaseAdmin
//         .from('users')
//         .select('id, email, departmentId, roles (id, name, level)')
//         .eq('id', user.id)
//         .single();

//       if (profileError || !data) {
//         logger.error('Middleware: Failed to fetch profile', {
//           error: profileError?.message,
//         });
//       } else {
//         userProfile = data;
//         logger.info('Middleware: User authenticated', {
//           userId: user.id,
//           roles: data.roles,
//         });
//       }
//     }
//   } else {
//     logger.warn(
//       'Supabase admin client not initialized or no token, skipping auth',
//     );
//     // Proceed or redirect as needed
//   }

//   const response = NextResponse.next();
//   if (userProfile) {
//     response.headers.set('x-supabase-user', JSON.stringify(userProfile));
//   }

//   return response;
// }

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  logger.debug('Middleware: Path:', pathname);
  logger.debug('Middleware: Is public route:', isPublicRoute);
  logger.debug('Middleware: Processing request', { pathname, isPublicRoute });

  const token = req.cookies.get('sb-access-token')?.value;
  if (
    !token &&
    !isPublicRoute &&
    !pathname.startsWith('/login') &&
    !pathname.startsWith('/api/auth')
  ) {
    logger.warn('Middleware: No token found, redirecting to login');
    const redirectUrl = encodeURIComponent(
      pathname + req.nextUrl.search || '/dashboard',
    );
    return NextResponse.redirect(
      new URL(`/login?next=${redirectUrl}`, req.url),
    );
  }

  let userProfile = null;
  if (token && supabaseAdmin) {
    logger.debug('Middleware: Verifying token');
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      logger.error('Middleware: Invalid token', { error: error?.message });
      if (!isPublicRoute) {
        const redirectUrl = encodeURIComponent(
          pathname + req.nextUrl.search || '/dashboard',
        );
        return NextResponse.redirect(
          new URL(`/login?next=${redirectUrl}`, req.url),
        );
      }
    } else {
      logger.debug('Middleware: Fetching user profile', { userId: user.id });
      const { data, error: profileError } = await supabaseAdmin
        .from('users')
        .select('id, email, departmentId, roles (id, name, level)')
        .eq('id', user.id)
        .single();

      logger.debug('Middleware: Supabase user profile response', {
        data,
        error: profileError?.message,
      });

      if (profileError || !data) {
        logger.error('Middleware: Failed to fetch profile', {
          error: profileError?.message,
        });
      } else {
        userProfile = data;
        logger.info('Middleware: User authenticated', {
          userId: user.id,
          roles: data.roles,
        });
      }
    }
  } else {
    logger.warn(
      'Supabase admin client not initialized or no token, skipping auth',
    );
  }

  const response = NextResponse.next();
  if (userProfile) {
    response.headers.set('x-supabase-user', JSON.stringify(userProfile));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
// src/middleware.ts
