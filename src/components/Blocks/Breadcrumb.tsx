'use client';

import React from 'react';
import Link from 'next/link';
import { FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { MdArrowBackIosNew } from 'react-icons/md';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface BreadcrumbProps {
  /** An array of breadcrumb items (each with a label and a URL) */
  items?: BreadcrumbItem[];
  /** When true, renders a "Back" button that calls router.back() */
  showBack?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, showBack = false }) => {
  const router = useRouter();

  return (
    <nav
      className="flex items-center text-sm text-gray-600 dark:text-gray-300"
      aria-label="Breadcrumb"
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex items-center mr-2 text-blue-600 hover:underline focus:outline-none"
        >
          <MdArrowBackIosNew className="mr-1" />
          Back
        </button>
      )}
      {items?.map((item, index) => (
        <React.Fragment key={index}>
          <Link
            href={item.href}
            className="hover:underline text-blue-600 dark:text-blue-400"
          >
            {item.label}
          </Link>
          {index < items.length - 1 && (
            <FiChevronRight className="mx-2" aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
