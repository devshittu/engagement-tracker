'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

type DoughnutChartProps = {
  percentAttended: number;
  percentDeclined: number;
  title: string;
};

const COLORS = ['#34D399', '#F87171'];

export const DoughnutChart: React.FC<DoughnutChartProps> = ({
  percentAttended,
  percentDeclined,
  title,
}) => {
  const data = [
    { name: 'Attended', value: percentAttended },
    { name: 'Declined', value: percentDeclined },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
    >
      <h3 className="text-center font-semibold text-gray-700 dark:text-gray-300">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
