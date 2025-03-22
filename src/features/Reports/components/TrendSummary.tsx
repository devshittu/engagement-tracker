'use client';

import React from 'react';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

type TrendSummaryProps = {
  currentTotal: number;
  previousTotal: number;
  percentageChange: number;
  description?: string;
};

export const TrendSummary: React.FC<TrendSummaryProps> = ({
  currentTotal,
  previousTotal,
  percentageChange,
  description = 'Period Comparison',
}) => {
  const isPositive = percentageChange >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';
  const bgColor = isPositive ? 'bg-green-100' : 'bg-red-100';

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center mr-3">
            {isPositive ? (
              <MdTrendingUp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            ) : (
              <MdTrendingDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          <div>
            <h5 className="text-xl font-bold text-gray-900 dark:text-white">
              Trend
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
        <span
          className={`${bgColor} ${changeColor} text-xs font-medium inline-flex items-center px-2.5 py-1 rounded-md`}
        >
          {isPositive ? '▲' : '▼'} {Math.abs(percentageChange).toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <dl className="flex items-center">
          <dt className="text-gray-500 dark:text-gray-400 text-sm mr-1">
            Current:
          </dt>
          <dd className="text-gray-900 dark:text-white text-sm font-semibold">
            {currentTotal.toLocaleString()}
          </dd>
        </dl>
        <dl className="flex items-center justify-end">
          <dt className="text-gray-500 dark:text-gray-400 text-sm mr-1">
            Previous:
          </dt>
          <dd className="text-gray-900 dark:text-white text-sm font-semibold">
            {previousTotal.toLocaleString()}
          </dd>
        </dl>
      </div>
    </div>
  );
};
// src/features/Reports/components/TrendSummary.tsx
