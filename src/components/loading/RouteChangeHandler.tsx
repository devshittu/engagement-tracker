'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoaderStore } from '@/stores/ui/hooks/useLoaderStore';

export const RouteChangeHandler = () => {
  const stopLoading = useLoaderStore((state) => state.stopLoading); // Zustand's stopLoading function

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When the path or search params change, stop the loader
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  return null; // This component doesn't render anything
};

export default RouteChangeHandler;

// src/components/loading/RouteChangeHandler.tsx
