// src/app/components/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../Illustration/Logo';
import GradientLogo from '../Illustration/GradientLogo';
import AuthHeader from '@/features/auth/components/AuthHeader';

const Header: React.FC = () => {
  const [top, setTop] = useState<boolean>(true);

  useEffect(() => {
    const scrollHandler = () => {
      setTop(window.pageYOffset <= 10);
    };

    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  return (
    <header
      className={`fixed w-full z-30 transition duration-300 ease-in-out ${!top ? 'bg-base-100/80 backdrop-blur shadow-lg' : 'md:bg-opacity-90'}`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Site Branding */}
          <div className="flex-shrink-0 mr-4">
            <Link href="/" aria-label="Activity Manager">
              <div className="w-24 sm:w-32 md:w-40 lg:w-40 xl:w-40 2xl:w-40 h-auto">
                <Logo className="text-base-content" />
              </div>
            </Link>
          </div>

          {/* Site Navigation */}
          <nav className="flex flex-grow">
            <ul className="flex flex-grow justify-end flex-wrap items-center">
              <li>
                <AuthHeader />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
