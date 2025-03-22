// File: src/features/Reports/components/ProgressIndicator.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getWardColor } from '../utils/wardColors';

type ProgressIndicatorProps = {
  percentAttended: number;
  percentDeclined: number;
  wardName: string;
  type: 'circular' | 'linear';
  title: string;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  percentAttended,
  percentDeclined,
  wardName,
  type,
  title,
}) => {
  const wardGradient = getWardColor(wardName);

  if (type === 'circular') {
    const circumference = 2 * Math.PI * 60; // Radius = 60
    const attendedOffset =
      circumference - (percentAttended / 100) * circumference;
    const declinedOffset =
      circumference - (percentDeclined / 100) * circumference;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg relative flex flex-col items-center"
      >
        <h3 className="text-center font-semibold text-gray-900 dark:text-gray-200 mb-2">
          {title}
        </h3>
        <div className="relative">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={attendedOffset}
              className={`text-teal-500 ${wardGradient} bg-gradient-to-r`}
            />
            <circle
              cx="80"
              cy="80"
              r="60"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={declinedOffset}
              className="text-red-500 opacity-50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-200">
              {percentAttended.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="flex space-x-4 mt-2">
          <div className="flex items-center">
            <span
              className={`w-4 h-4 rounded-full bg-teal-500 ${wardGradient} bg-gradient-to-r mr-2`}
            ></span>
            <span className="text-sm text-gray-900 dark:text-gray-200">
              Attended
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 rounded-full bg-red-500 opacity-50 mr-2"></span>
            <span className="text-sm text-gray-900 dark:text-gray-200">
              Declined
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Linear Progress Bar
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
    >
      <h3 className="text-center font-semibold text-gray-900 dark:text-gray-200 mb-2">
        {title}
      </h3>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-900 dark:text-gray-200">
              Attended
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {percentAttended.toFixed(1)}%
            </span>
          </div>
          <div className="overflow-hidden bg-gray-200 h-2 rounded-full w-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentAttended}%` }}
              transition={{ duration: 1 }}
              className={`h-full ${wardGradient} bg-gradient-to-r rounded-full`}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-900 dark:text-gray-200">
              Declined
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
              {percentDeclined.toFixed(1)}%
            </span>
          </div>
          <div className="overflow-hidden bg-gray-200 h-2 rounded-full w-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentDeclined}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-red-500 opacity-50 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
