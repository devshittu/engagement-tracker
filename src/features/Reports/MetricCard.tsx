'use client';

import React from 'react';

export interface MetricCardProps {
  title: string;
  value: number;
  change: number; // percentage change (can be negative)
  positive: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  positive,
}) => {
  return (
    <div className="w-full md:w-1/3 px-2">
      <div className="rounded-lg shadow-sm mb-4">
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg md:shadow-xl relative overflow-hidden">
          <div className="px-3 pt-8 pb-10 text-center relative z-10">
            <h4 className="text-sm uppercase text-gray-500 dark:text-gray-400 leading-tight">
              {title}
            </h4>
            <h3 className="text-3xl font-semibold leading-tight my-3 text-gray-700 dark:text-gray-100">
              {value.toLocaleString()}
            </h3>
            <p
              className={`text-xs leading-tight ${positive ? 'text-green-500' : 'text-red-500'}`}
            >
              {positive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
            </p>
          </div>
          {/* Optionally, you can include a canvas for a small chart here */}
          {/* <div className="absolute bottom-0 inset-x-0">
            <canvas id={`chart-${title}`} height="70"></canvas>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;

export const MetricCardShimmer: React.FC = () => {
  return (
    <div className="w-full md:w-1/3 px-2">
      <div className="rounded-lg shadow-sm mb-4">
        <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 shadow-lg md:shadow-xl">
          <div className="px-3 pt-8 pb-10 text-center">
            {/* Title placeholder */}
            <div className="h-4 w-1/2 mx-auto bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse" />
            {/* Value placeholder */}
            <div className="h-8 w-2/3 mx-auto bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse" />
            {/* Change placeholder */}
            <div className="h-3 w-1/3 mx-auto bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          </div>
          <div
            className="absolute top-0 left-0 w-full h-full animate-shimmer"
            style={{
              background:
                'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};
