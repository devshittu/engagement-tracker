'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MdLogout } from 'react-icons/md';

const LogoutButton: React.FC = () => {
  const { logout, isLoggingOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="p-2 rounded-full hover:bg-base-200 transition-colors duration-200"
      aria-label="Log out"
      title="Log out"
    >
      <MdLogout className="w-5 h-5 text-base-content" />
    </button>
  );
};

export default LogoutButton;
// src/features/auth/components/LogoutButton.tsx
