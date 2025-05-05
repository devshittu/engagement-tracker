// src/components/Frame/DashboardPageFrame.tsx
'use client';

import React, { FC, useRef, useEffect } from 'react';
import { DashboardPageFrameProps, StatusItem } from './types';

const DashboardPageFrame: FC<DashboardPageFrameProps> = (props) => {
  const { title = 'Untitled', date, pageActions, children } = props;

  // Compute the displayed date or default to today's date if none provided
  const displayDate = date
    ? date
    : new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });

  // If we want a container that might need height fix logic:
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsRef.current?.children[0]) {
      const firstChild = tabsRef.current.children[0] as HTMLElement;
      // Example of dynamic height fix if needed
      // tabsRef.current.style.height = `${firstChild.offsetHeight}px`;
    }
  }, []);

  return (
    <div className="bg-base-50 dark:bg-base-950 rounded-[32px] p-2 md:p-2 flex flex-col h-full">
      {/* Top header */}
      <div className="sticky top-0 z-10 py-4 bg-base-50 dark:bg-base-950 rounded-t-[32px]">
        <div className="flex justify-between items-center mb-6 sm:mb-4 px-2">
          <h1 className="h1 font-bold text-base-content">{title}</h1>
          <span className="text-base-content text-lg">{displayDate}</span>
        </div>
      </div>

      {/* Middle row: either status or description, plus pageActions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-2">
        {/* Left side: status array or single description */}
        {/* {props.kind === 'status' ? (
          <div className="flex flex-wrap gap-4 mb-4 md:mb-0">
            {props.status.map((item: StatusItem, idx: number) => (
              <div key={idx} className="flex flex-col items-start">
                <span className="text-2xl font-bold text-base-content">
                  {item.value}
                </span>
                <span className="text-lg text-base-content">{item.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-4 md:mb-0 text-sm text-base-content">
            {props.description}
          </div>
        )} */}

        {/* Right side: pageActions (buttons, toggles, etc.) */}
        {pageActions && (
          <div className="view-actions flex items-center gap-2">
            {pageActions}
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto px-2" ref={tabsRef}>
        {children}
      </div>
    </div>
  );
};

export default DashboardPageFrame;
// src/components/Frame/DashboardPageFrame.tsx
