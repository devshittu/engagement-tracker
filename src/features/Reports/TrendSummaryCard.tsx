'use client';

import React from 'react';
import { MdTrendingFlat, MdTrendingUp } from 'react-icons/md';

export interface TrendSummaryCardProps {
  title: string; // e.g. "Trend"
  description: string; // e.g. "Sessions this week"
  currentTotal: number;
  previousTotal: number;
  percentageChange: number;
}

const TrendSummaryCard: React.FC<TrendSummaryCardProps> = ({
  title,
  description,
  currentTotal,
  previousTotal,
  percentageChange,
}) => {
  // Determine color and arrow based on percentageChange.
  let changeColor = 'text-amber-500'; // default if near zero
  let bgColor = 'bg-amber-100';
  let arrow = '▲'; // up arrow
  if (percentageChange > 0.5) {
    changeColor = 'text-green-500';
    bgColor = 'bg-green-100';
    arrow = '▲';
  } else if (percentageChange < -0.5) {
    changeColor = 'text-red-500';
    bgColor = 'bg-red-100';
    arrow = '▼';
  }

  return (
    <div className="w-full mx-auto p-4">
      {/* Top section with icon, title, description and percentage badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
            {/* <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 19"
            >
              <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z" />
              <path d="M5 19h10v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2ZM5 7a5.008 5.008 0 0 1 4-4.9 3.988 3.988 0 1 0-3.9 5.859A4.974 4.974 0 0 1 5 7Zm5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
            </svg> */}
            <MdTrendingUp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h5 className="leading-none text-2xl font-bold text-gray-900 dark:text-white pb-1">
              {title}
            </h5>
            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
        <div>
          <span
            className={`${bgColor} ${changeColor} text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md`}
          >
            <svg
              className="w-2.5 h-2.5 mr-1.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 10 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  arrow === '▲'
                    ? 'M5 13V1m0 0L1 5m4-4 4 4'
                    : 'M5 1v12m0 0l4-4m-4 4l-4-4'
                }
              />
            </svg>
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bottom grid with detailed metrics */}
      <div className="grid grid-cols-2">
        <dl className="flex items-center">
          <dt className="text-gray-500 dark:text-gray-400 text-sm font-normal mr-1">
            Current Period:
          </dt>
          <dd className="text-gray-900 dark:text-white text-sm font-semibold">
            {currentTotal.toLocaleString()}
          </dd>
        </dl>
        <dl className="flex items-center justify-end">
          <dt className="text-gray-500 dark:text-gray-400 text-sm font-normal mr-1">
            Previous Period:
          </dt>
          <dd className="text-gray-900 dark:text-white text-sm font-semibold">
            {previousTotal.toLocaleString()}
          </dd>
        </dl>
      </div>
    </div>
  );
};

export default TrendSummaryCard;
