// src/features/Reports/charts/ServiceUserEngagementLineChart.tsx
'use client';

import React from 'react';
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
import { ServiceUserEngagementResponse } from '../types/serviceUserEngagement';

type ServiceUserEngagementLineChartProps = {
  data: ServiceUserEngagementResponse;
};

export const ServiceUserEngagementLineChart: React.FC<
  ServiceUserEngagementLineChartProps
> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
        <Line
          type="monotone"
          dataKey="sessionCount"
          stroke="#3B82F6"
          name="Sessions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
