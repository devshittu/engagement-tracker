'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import Link from 'next/link';
import { MdAccountCircle, MdLogin } from 'react-icons/md';
import LogoutButton from './LogoutButton';
import ThemeToggle from '@/components/Blocks/ThemeToggle';

const AuthHeader: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {user ? (
        // Authenticated State
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 group">
            <MdAccountCircle className="w-8 h-8 text-gray-500 dark:text-gray-400 group-hover:text-teal-500 transition-colors duration-200" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-500 transition-colors duration-200">
              Welcome, {user.email.split('@')[0]}
            </span>
          </div>
          <LogoutButton />
        </div>
      ) : (
        // Unauthenticated State
        <div className="flex items-center space-x-2">
          <Link
            href="/login"
            className="btn bg-gradient-to-r from-teal-500 to-blue-500 text-white border-none hover:from-teal-600 hover:to-blue-600 transition-all duration-300"
          >
            <MdLogin className="w-5 h-5 mr-1" />
            Log In
          </Link>
          <Link
            href="/register"
            className="btn btn-ghost text-gray-700 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-200"
          >
            Register
          </Link>
        </div>
      )}
      <ThemeToggle />
    </div>
  );
};

export default AuthHeader;
