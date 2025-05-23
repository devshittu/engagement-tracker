// src/app/(public)/login/page.tsx
'use client';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const LoginPage = () => {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';

  return (
    <div className="h-[calc(100vh_-_8rem_-_3rem)] md:h-[calc(100vh_-_10rem_-_5rem)] flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm nextUrl={nextUrl} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
// src/app/(public)/login/page.tsx
