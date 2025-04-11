'use client';
import React from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons';

export interface BottomNavItem {
  label: string;
  href: string;
  icon: IconType;
  tooltip: string;
  showLabel?: boolean; // Added showLabel prop
}

export interface BottomNavCenterButton {
  icon: IconType;
  tooltip: string;
  onClick?: () => void; // or use href if needed
}

export interface BottomNavProps {
  /** Array of navigation items (except the center button) */
  items: BottomNavItem[];
  /** Optional center button (e.g. "New item") */
  centerButton?: BottomNavCenterButton;
}

const BottomNav: React.FC<BottomNavProps> = ({ items, centerButton }) => {
  // Split items into left and right halves for symmetry.
  const half = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, half);
  const rightItems = items.slice(half);

  return (
    <div
      className="fixed z-50 w-full h-16 max-w-lg -translate-x-1/2 bottom-4 left-1/2
                    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full
                    shadow-md"
    >
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {/* Left items */}
        {leftItems.map((item, idx) => (
          <NavButton
            key={idx}
            item={item}
            roundedClass={idx === 0 ? 'rounded-l-full' : ''}
          />
        ))}
        {/* Center button */}
        <div className="flex items-center justify-center">
          {centerButton && (
            <button
              data-tooltip-target={`tooltip-${centerButton.tooltip}`}
              type="button"
              onClick={centerButton.onClick}
              className="inline-flex items-center justify-center w-10 h-10 font-medium
                         bg-blue-600 rounded-full hover:bg-blue-700 group focus:ring-4 
                         focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
            >
              <centerButton.icon
                className="w-4 h-4 text-white"
                aria-hidden="true"
              />
              <span className="sr-only">{centerButton.tooltip}</span>
            </button>
          )}
        </div>
        {/* Right items */}
        {rightItems.map((item, idx) => (
          <NavButton
            key={idx}
            item={item}
            roundedClass={idx === rightItems.length - 1 ? 'rounded-r-full' : ''}
          />
        ))}
      </div>
    </div>
  );
};

interface NavButtonProps {
  item: BottomNavItem;
  roundedClass?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ item, roundedClass = '' }) => {
  const { label, href, icon: Icon, tooltip, showLabel = false } = item;

  return (
    <Link
      href={href}
      data-tooltip-target={`tooltip-${tooltip}`}
      className={`inline-flex flex-col items-center justify-center px-3 py-2
                 hover:bg-gray-50 dark:hover:bg-gray-800 group ${roundedClass}`}
    >
      <Icon
        className="w-5 h-5 md:w-6 md:h-6 mb-1 text-gray-500 dark:text-gray-400
                   group-hover:text-blue-600 dark:group-hover:text-blue-500"
      />
      {showLabel && (
        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
          {label}
        </span>
      )}
    </Link>
  );
};

export default BottomNav;
