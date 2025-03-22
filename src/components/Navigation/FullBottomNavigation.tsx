'use client';

import React from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';

export interface FullBottomNavItem {
  /** The text label (e.g. "Home") */
  label: string;
  /** The Next.js route or external URL */
  href: string;
  /** Tooltip text or short descriptor */
  tooltip: string;
  /** Icon from react-icons */
  icon: IconType;
}

export interface FullBottomNavProps {
  /** Array of items to be displayed in the bottom nav */
  navItems: FullBottomNavItem[];
}

/**
 * A responsive, highly customizable bottom navigation bar
 * that stays fixed at the bottom of the viewport.
 */
const FullBottomNav: React.FC<FullBottomNavProps> = ({ navItems }) => {
  return (
    <div
      className="
      fixed
      bottom-0 left-0
      z-50
      w-full
      h-16
      bg-white
      border-t border-gray-200
      dark:bg-gray-700
      dark:border-gray-600
    "
    >
      <div
        className="
        grid
        h-full
        max-w-lg
        mx-auto
        font-medium
        grid-cols-5
        md:grid-cols-5
      "
      >
        {navItems.map((item, idx) => (
          <NavButton key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};

/**
 * Each item in the bottom nav.
 */
const NavButton: React.FC<{ item: FullBottomNavItem }> = ({ item }) => {
  const { label, href, tooltip, icon: Icon } = item;
  return (
    <Link
      href={href}
      className="
        inline-flex
        flex-col
        items-center
        justify-center
        px-5
        hover:bg-gray-50
        dark:hover:bg-gray-800
        group
      "
      title={tooltip}
    >
      <Icon
        className="
          w-5 h-5
          md:w-6 md:h-6
          mb-1
          text-gray-500
          dark:text-gray-400
          group-hover:text-blue-600
          dark:group-hover:text-blue-500
        "
        aria-hidden="true"
      />
      <span
        className="
          text-sm
          text-gray-500
          dark:text-gray-400
          group-hover:text-blue-600
          dark:group-hover:text-blue-500
        "
      >
        {label}
      </span>
    </Link>
  );
};

export default FullBottomNav;
