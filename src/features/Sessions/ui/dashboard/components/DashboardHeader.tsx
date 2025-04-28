// src/features/Sessions/ui/dashboard/components/DashboardHeader.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { HiDotsVertical, HiXCircle, HiEye } from 'react-icons/hi';

type DashboardHeaderProps = {
  totalActive: number;
  oneToOneCount: number;
  groupCount: number;
  sortOrder: 'asc' | 'desc';
  onToggleSort: () => void;
  onEndAllOneToOne: () => void;
  onEndAllGroup: () => void;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalActive,
  oneToOneCount,
  groupCount,
  sortOrder,
  onToggleSort,
  onEndAllOneToOne,
  onEndAllGroup,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleActions, setVisibleActions] = useState<string[]>([
    'total',
    'sort',
    'endOneToOne',
    'endGroup',
    'viewDeclined',
    'viewAll',
  ]);
  const [hiddenActions, setHiddenActions] = useState<string[]>([]);

  // Dynamic collapse logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      const containerWidth = container.offsetWidth;
      const buttons = container.querySelectorAll('[data-action]');
      let totalButtonWidth = 0;
      const buttonWidths: { [key: string]: number } = {};

      buttons.forEach((button) => {
        const action = button.getAttribute('data-action')!;
        buttonWidths[action] = button.getBoundingClientRect().width;
        totalButtonWidth += buttonWidths[action];
      });

      // Add padding/margins (approx 8px per gap, assuming 2px per side)
      totalButtonWidth += (buttons.length - 1) * 8;

      const newVisible: string[] = ['total'];
      const newHidden: string[] = [];
      const priorityActions = ['endOneToOne', 'endGroup'];
      const secondaryActions = ['viewAll', 'viewDeclined', 'sort'];

      // Add priority actions first
      let currentWidth = buttonWidths['total'];
      priorityActions.forEach((action) => {
        if (currentWidth + buttonWidths[action] <= containerWidth - 40) {
          // Reserve space for More button
          newVisible.push(action);
          currentWidth += buttonWidths[action] + 8;
        } else {
          newHidden.push(action);
        }
      });

      // Add secondary actions
      secondaryActions.forEach((action) => {
        if (currentWidth + buttonWidths[action] <= containerWidth - 40) {
          newVisible.push(action);
          currentWidth += buttonWidths[action] + 8;
        } else {
          newHidden.push(action);
        }
      });

      setVisibleActions(newVisible);
      setHiddenActions(newHidden);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-between gap-4 mb-6"
    >
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Active Sessions
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Render Visible Actions */}
        {visibleActions.includes('total') && (
          <div
            data-action="total"
            className="flex items-center bg-teal-600 text-white rounded-full px-3 py-1 text-sm font-medium"
          >
            Total Active: {totalActive}
          </div>
        )}
        {visibleActions.includes('sort') && (
          <button
            data-action="sort"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
            onClick={onToggleSort}
            title="Sort sessions by date"
          >
            <HiEye className="w-5 h-5" />
            {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
          </button>
        )}
        {visibleActions.includes('endOneToOne') && (
          <button
            data-action="endOneToOne"
            className={`flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${oneToOneCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onEndAllOneToOne}
            disabled={oneToOneCount === 0}
            title="End all one-to-one sessions"
          >
            <HiXCircle className="w-5 h-5" />
            End One-to-One ({oneToOneCount})
          </button>
        )}
        {visibleActions.includes('endGroup') && (
          <button
            data-action="endGroup"
            className={`flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${groupCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onEndAllGroup}
            disabled={groupCount === 0}
            title="End all group sessions"
          >
            <HiXCircle className="w-5 h-5" />
            End Group ({groupCount})
          </button>
        )}
        {visibleActions.includes('viewDeclined') && (
          <Link
            data-action="viewDeclined"
            href="/sessions/declined"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
            title="View declined sessions"
          >
            <HiEye className="w-5 h-5" />
            View Declined
          </Link>
        )}
        {visibleActions.includes('viewAll') && totalActive > 6 && (
          <Link
            data-action="viewAll"
            href="/sessions/active"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
            title="View all active sessions"
          >
            <HiEye className="w-5 h-5" />
            View All
          </Link>
        )}

        {/* More Menu */}
        {hiddenActions.length > 0 && (
          <Menu as="div" className="relative">
            <Menu.Button
              className="flex items-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg p-2 transition-all duration-200"
              title="More actions"
            >
              <HiDotsVertical className="w-5 h-5" />
            </Menu.Button>
            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 z-10">
                {hiddenActions.includes('sort') && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-teal-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}
                        onClick={onToggleSort}
                      >
                        <HiEye className="w-5 h-5" />
                        {sortOrder === 'asc'
                          ? 'Earliest First'
                          : 'Latest First'}
                      </button>
                    )}
                  </Menu.Item>
                )}
                {hiddenActions.includes('endOneToOne') && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-teal-600 text-white' : 'text-gray-700 dark:text-gray-300'} ${oneToOneCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={onEndAllOneToOne}
                        disabled={oneToOneCount === 0}
                      >
                        <HiXCircle className="w-5 h-5" />
                        End One-to-One ({oneToOneCount})
                      </button>
                    )}
                  </Menu.Item>
                )}
                {hiddenActions.includes('endGroup') && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-teal-600 text-white' : 'text-gray-700 dark:text-gray-300'} ${groupCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={onEndAllGroup}
                        disabled={groupCount === 0}
                      >
                        <HiXCircle className="w-5 h-5" />
                        End Group ({groupCount})
                      </button>
                    )}
                  </Menu.Item>
                )}
                {hiddenActions.includes('viewDeclined') && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/sessions/declined"
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-teal-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        <HiEye className="w-5 h-5" />
                        View Declined
                      </Link>
                    )}
                  </Menu.Item>
                )}
                {hiddenActions.includes('viewAll') && totalActive > 6 && (
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href="/sessions/active"
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium rounded-md ${active ? 'bg-teal-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        <HiEye className="w-5 h-5" />
                        View All
                      </Link>
                    )}
                  </Menu.Item>
                )}
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
// src/features/Sessions/ui/dashboard/components/DashboardHeader.tsx
