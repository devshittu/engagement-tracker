'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import AppNav from '@/components/Blocks/AppNav';
import { motion } from 'framer-motion';

const AuthNavWrapper: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Don't render anything while loading
  }

  if (!user) {
    return null; // Hide the nav when not authenticated
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <AppNav />
    </motion.div>
  );
};

export default AuthNavWrapper;
// src/features/auth/components/AuthNavWrapper.tsx
