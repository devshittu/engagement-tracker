// src/features/Reports/charts/SessionTrendChart.tsx
'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendReportResponse } from '../types/sessionTrend';

type SessionTrendChartProps = {
  data: TrendReportResponse;
};

export const SessionTrendChart: React.FC<SessionTrendChartProps> = ({
  data,
}) => {
  const chartData = useMemo(() => {
    return data.currentData.map((current, idx) => ({
      label: current.label,
      current: current.count,
      previous: data.previousData[idx]?.count ?? 0,
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="current"
          stroke="#3B82F6"
          name="Current Period"
        />
        <Line
          type="monotone"
          dataKey="previous"
          stroke="#10B981"
          name="Previous Period"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
