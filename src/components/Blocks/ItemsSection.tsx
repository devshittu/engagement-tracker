'use client';

import React, { FC, useRef, useEffect, ReactNode } from 'react';
import ViewToggle from '@/components/Blocks/ViewToggle';
import StatusItem from './StatusItem';

export type Item = any; // Adjust as needed

export interface ItemsSectionProps {
  items: Item[];
  viewMode: 'grid' | 'list';
  setViewMode?: (mode: 'grid' | 'list') => void; // Now optional
  children?: ReactNode;
  title?: string;
  date?: string;
  /** Optional custom render for the status section. */
  renderStatus?: () => ReactNode;
  /** Optional custom render for the view toggle section. */
  renderViewToggle?: () => ReactNode;
}

const ItemsSection: FC<ItemsSectionProps> = ({
  title = 'Projects',
  date = 'Dec 12',
  items,
  viewMode,
  setViewMode,
  children,
  renderStatus,
  renderViewToggle,
}) => {
  // Calculate project counts
  const inProgress = items.filter(
    (project) => project.progress?.percentage < 100,
  ).length;
  const upcoming = items.length - inProgress;
  const totalProjects = items.length;

  // Get current date for header
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  // Ref for container height adjustment if needed.
  const tabs = useRef<HTMLDivElement | null>(null);
  const heightFix = () => {
    if (tabs.current && tabs.current.children[0]) {
      tabs.current.style.height = `${
        (tabs.current.children[0] as HTMLElement).offsetHeight
      }px`;
    }
  };

  useEffect(() => {
    heightFix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="items-section bg-base-50 dark:bg-base-950 rounded-[32px] p-2 md:p-2 sm:p-1 flex flex-col h-full">
      {/* Projects Header */}
      <div className="items-section-header bg-base-50 dark:bg-base-950 sticky top-0 z-10 py-4">
        <div className="items-section-header flex justify-between items-center mb-6 sm:mb-4">
          <h1 className="h1 text-base-content">{title}</h1>
          <h4 className="h1 text-base-content">{currentDate}</h4>
        </div>
      </div>

      {/* Projects Status and View Toggle */}
      <div className="items-section-line flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="items-status flex space-x-4 mb-4 md:mb-0">
          {renderStatus ? (
            renderStatus()
          ) : (
            <>
              <StatusItem value={inProgress} label="In Progress" />
              <StatusItem value={upcoming} label="Upcoming" />
              <StatusItem value={totalProjects} label="Total Projects" />
            </>
          )}
        </div>
        <div className="view-actions">
          {renderViewToggle
            ? renderViewToggle()
            : setViewMode && (
                <ViewToggle viewMode={viewMode} onToggle={setViewMode} />
              )}
        </div>
      </div>

      {/* Project Boxes */}
      <div className="flex-1 overflow-y-auto" ref={tabs}>
        {children}
      </div>
    </div>
  );
};

export default ItemsSection;

// src/components/Blocks/ItemsSection.tsx
