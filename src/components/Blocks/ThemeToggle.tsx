'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';

const ThemeToggle: React.FC = () => {
  // State to ensure the component only renders after mounting
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // On mount, mark as mounted and get the saved theme from localStorage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Memoize the toggle function to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Whenever theme changes (after mount), update document and localStorage
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  // Until mounted, render nothing to avoid hydration mismatches
  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        onClick={toggleTheme}
        className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg p-2.5 text-center inline-flex items-center me-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500"
      >
        {theme === 'light' ? (
          <MdOutlineDarkMode size={24} className="w-5 h-5 text-current" />
        ) : (
          <MdOutlineLightMode size={24} className="w-5 h-5 text-current" />
        )}
        <span className="sr-only">Toggle Theme</span>
      </button>
    </>
  );
};

export default React.memo(ThemeToggle);
// src/components/Blocks/ThemeToggle.tsx
