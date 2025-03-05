'use client';

import React from 'react';

const ChartShimmerLoader: React.FC = () => {
  return (
    <div className="relative overflow-hidden w-full h-72 rounded-lg bg-gray-200 dark:bg-gray-600">
      {/* Shimmer overlay using CSS variables for theme-aware colors */}
      <div
        className="absolute top-0 left-0 w-full h-full animate-shimmer"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, var(--shimmer-stop2) 50%, transparent 100%)',
        }}
      ></div>
      {/* SVG Placeholder for Chart */}
      <svg
        fill="none"
        viewBox="0 0 1435 452"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-0 left-0 w-full h-full"
      >
        <defs>
          <linearGradient
            id="y-chart-shimmer"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              style={{ stopColor: 'var(--shimmer-stop1)', stopOpacity: 1 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: 'var(--shimmer-stop2)', stopOpacity: 1 }}
            >
              <animate
                attributeName="offset"
                values="-2; -2; 1"
                keyTimes="0; 0.25; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop
              offset="100%"
              style={{ stopColor: 'var(--shimmer-stop1)', stopOpacity: 1 }}
            />
          </linearGradient>
          <linearGradient
            id="x-chart-shimmer"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop
              offset="0.6"
              style={{ stopColor: 'var(--shimmer-stop1)', stopOpacity: 1 }}
            >
              <animate
                attributeName="offset"
                values="-2; -2; 1"
                keyTimes="0; 0.25; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop
              offset="1.6"
              style={{ stopColor: 'var(--shimmer-stop2)', stopOpacity: 1 }}
            >
              <animate
                attributeName="offset"
                values="-1; -1; 2"
                keyTimes="0; 0.25; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop
              offset="2.6"
              style={{ stopColor: 'var(--shimmer-stop1)', stopOpacity: 1 }}
            >
              <animate
                attributeName="offset"
                values="0; 0; 3"
                keyTimes="0; 0.25; 1"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
        <path d="M3.5 146h19v111h-19z" fill="url(#y-chart-shimmer)" />
        <g stroke="var(--shimmer-stop2)">
          <path d="M53 19h1378v365H53z" />
          <path d="M52.5 139.039h1379" />
          <path d="M52.5 79.8652h1379" />
          <path d="M52.5 198.213h1379" />
          <path d="M52.5 257.387h1379" />
          <path d="M52.5 316.561h1379" />
          <path d="M284.412 18.5v366" />
          <path d="M512.765 18.5v366" />
          <path d="M739.322 18.5v366" />
          <path d="M967.669 18.5v366" />
          <path d="M1196.01 18.5v366" />
        </g>
        <path d="M635 413.5h165v19h-165z" fill="url(#x-chart-shimmer)" />
      </svg>
    </div>
  );
};

export default ChartShimmerLoader;
