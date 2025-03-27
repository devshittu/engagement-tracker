// src/app/(protected)/layout.tsx
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
  }

  return <ClientAuthGuard>{children}</ClientAuthGuard>;
}
// src/app/(protected)/layout.tsx
