'use client';
import Breadcrumb from '@/components/Blocks/Breadcrumb';

import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Breadcrumb showBack={true} />
      {children}
    </>
  );
};

export default Layout;
// src/app/reports/layout.tsx
