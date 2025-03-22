// src/features/Reports/charts/DashboardMetricsPieChart.tsx
'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DashboardMetricsResponse } from '../types/dashboardMetrics';

type DashboardMetricsPieChartProps = {
  data: DashboardMetricsResponse;
};

const COLORS = ['#3B82F6', '#F97316', '#10B981']; // Tailwind-inspired colors

export const DashboardMetricsPieChart: React.FC<
  DashboardMetricsPieChartProps
> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.metrics.map((metric) => ({
        name: metric.title,
        value: metric.value,
      })),
    [data.metrics],
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
