// src/features/Reports/charts/DashboardMetricsBarChart.tsx
'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DashboardMetricsResponse } from '../types/dashboardMetrics';

type DashboardMetricsBarChartProps = {
  data: DashboardMetricsResponse;
};

export const DashboardMetricsBarChart: React.FC<
  DashboardMetricsBarChartProps
> = ({ data }) => {
  const chartData = useMemo(
    () =>
      data.metrics.map((metric) => ({
        title: metric.title,
        value: metric.value,
      })),
    [data.metrics],
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
        <Bar dataKey="value" fill="#3B82F6" name="Value" />
      </BarChart>
    </ResponsiveContainer>
  );
};
