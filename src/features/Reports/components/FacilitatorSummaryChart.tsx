'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FacilitatorSnapshotUser } from '../types/facilitatorSnapshot';
import { motion } from 'framer-motion';

type FacilitatorSummaryChartProps = {
  facilitators: FacilitatorSnapshotUser[];
};

export const FacilitatorSummaryChart: React.FC<
  FacilitatorSummaryChartProps
> = ({ facilitators }) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const data = facilitators.map((user) => ({
    email: user.email,
    name: user.name,
    completed: user.groups.completed + user.oneToOnes.completed,
    declined: user.groups.declined + user.oneToOnes.declined,
  }));

  const toggleChartType = () => {
    setChartType(chartType === 'bar' ? 'line' : 'bar');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-center font-semibold text-gray-900 dark:text-gray-200">
          Facilitator Session Summary
        </h3>
        <button
          onClick={toggleChartType}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          {chartType === 'bar' ? 'Switch to Line' : 'Switch to Bar'}
        </button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        {chartType === 'bar' ? (
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value} sessions`} />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="completed" fill="#34D399" name="Completed" />
            <Bar dataKey="declined" fill="#F87171" name="Declined" />
          </BarChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value} sessions`} />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#34D399"
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="declined"
              stroke="#F87171"
              name="Declined"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};
