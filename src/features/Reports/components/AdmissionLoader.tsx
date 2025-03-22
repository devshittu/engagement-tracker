// src/features/Reports/components/AdmissionLoader.tsx
'use client';

import React from 'react';

export const AdmissionLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-6">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    <p className="mt-2 text-gray-600 dark:text-gray-300">
      Unpacking the Care Journey...
    </p>
  </div>
);
