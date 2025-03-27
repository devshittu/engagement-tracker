
// import { headers } from 'next/headers';
// import ClientAuthGuard from './ClientAuthGuard';

// export default async function ProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   console.log('Server ProtectedLayout: Starting session check');

//   // Ensure headers() is used correctly
//   const headersList = headers();
//   const userProfileJson = headersList.get('x-supabase-user');

//   if (!userProfileJson) {
//     console.log('Server ProtectedLayout: No user profile found in headers, relying on middleware');
//     return <ClientAuthGuard>{children}</ClientAuthGuard>;
//   }

//   let userProfile = null;
//   try {
//     userProfile = JSON.parse(userProfileJson);
//     console.log('Server ProtectedLayout: User authenticated from middleware:', userProfile.id);
//   } catch (error) {
//     console.error('Server ProtectedLayout: Failed to parse user profile:', error);
//     return <ClientAuthGuard>{children}</ClientAuthGuard>;
//   }

//   return <ClientAuthGuard>{children}</ClientAuthGuard>;
// }

// // src/app/(protected)/layout.tsx
// import { headers } from 'next/headers';
// import ClientAuthGuard from './ClientAuthGuard';
// import { supabase } from '@/lib/supabase';

// export default async function ProtectedLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   console.log('Server ProtectedLayout: Starting session check');

//   // Await headers() to access dynamic headers
//   const headersList = await headers();
  
//   // Check if the middleware has set the x-supabase-user header
//   const userProfileJson = headersList.get('x-supabase-user');
//   let userProfile = null;

//   if (userProfileJson) {
//     try {
//       userProfile = JSON.parse(userProfileJson);
//       console.log('Server ProtectedLayout: User authenticated from middleware:', userProfile.id);
//     } catch (error) {
//       console.error('Server ProtectedLayout: Failed to parse user profile:', error);
//     }
//   }

//   // If the middleware didn't provide a user profile, attempt to get the session
//   if (!userProfile) {
//     console.log('Server ProtectedLayout: No user profile from middleware, checking session');

//     const cookieHeader = headersList.get('cookie') || '';
//     const tokenMatch = cookieHeader.match(/supabase-auth-token=([^;]+)/);
//     const refreshTokenMatch = cookieHeader.match(/supabase-refresh-token=([^;]+)/);
//     const token: string | null = tokenMatch && tokenMatch[1] ? tokenMatch[1] : null;
//     const refreshToken: string | null = refreshTokenMatch && refreshTokenMatch[1] ? refreshTokenMatch[1] : null;

//     console.log('ProtectedLayout: Token from cookie:', token);
//     console.log('ProtectedLayout: Refresh token from cookie:', refreshToken);

//     let user = null;
//     if (token) {
//       const { data, error: authError } = await supabase.auth.getUser(token);
//       user = data.user;
//       console.log('ProtectedLayout: getUser result:', {
//         user: user?.id,
//         error: authError?.message,
//       });
//     }

//     if (!user) {
//       const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
//       console.log('ProtectedLayout: getSession result:', {
//         session: sessionData.session?.user?.id,
//         error: sessionError?.message,
//       });

//       if (sessionError || !sessionData.session) {
//         if (refreshToken) {
//           const { data: refreshData, error: refreshError } = await supabase.auth.setSession({
//             access_token: token || '',
//             refresh_token: refreshToken,
//           });
//           console.log('ProtectedLayout: setSession result:', {
//             user: refreshData?.user?.id,
//             error: refreshError?.message,
//           });

//           if (refreshError || !refreshData?.user) {
//             console.log('Server ProtectedLayout: Session refresh failed, relying on middleware for redirect');
//             return <ClientAuthGuard>{children}</ClientAuthGuard>;
//           } else {
//             user = refreshData.user;
//           }
//         } else {
//           console.log('Server ProtectedLayout: No refresh token, relying on middleware for redirect');
//           return <ClientAuthGuard>{children}</ClientAuthGuard>;
//         }
//       } else {
//         user = sessionData.session.user;
//       }
//     }

//     // Fetch the user profile if we have a user
//     if (user) {
//       const { data: profile, error: profileError } = await supabase
//         .from('users')
//         .select('id, email, departmentId')
//         .eq('id', user.id)
//         .single();

//       if (profileError || !profile) {
//         console.log('Server ProtectedLayout: Failed to fetch user profile:', profileError?.message);
//         return <ClientAuthGuard>{children}</ClientAuthGuard>;
//       }

//       userProfile = profile;
//       console.log('Server ProtectedLayout: User authenticated via session:', userProfile.id);
//     }
//   }

//   if (!userProfile) {
//     console.log('Server ProtectedLayout: No user profile after all attempts, relying on middleware');
//     return <ClientAuthGuard>{children}</ClientAuthGuard>;
//   }

//   return <ClientAuthGuard>{children}</ClientAuthGuard>;
// }


import { headers } from 'next/headers';
import ClientAuthGuard from './ClientAuthGuard';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  console.log('Server ProtectedLayout: Starting session check');

  const headersList = await headers();
  const userProfileJson = headersList.get('x-supabase-user');
  let userProfile = null;

  if (userProfileJson) {
    try {
      userProfile = JSON.parse(userProfileJson);
      console.log('Server ProtectedLayout: User authenticated from middleware:', userProfile.id);
    } catch (error) {
      console.error('Server ProtectedLayout: Failed to parse user profile:', error);
    }
  }

  if (!userProfile) {
    console.log('Server ProtectedLayout: No user profile, relying on client-side guard');
    return <ClientAuthGuard>{children}</ClientAuthGuard>;
  }

  return <ClientAuthGuard>{children}</ClientAuthGuard>;
}
// src/app/(protected)/layout.tsx
