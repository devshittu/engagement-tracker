// src/features/Reports/charts/ServiceUserEngagementBarChart.tsx
'use client';

import React from 'react';
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
import { ServiceUserEngagementResponse } from '../types/serviceUserEngagement';

type ServiceUserEngagementBarChartProps = {
  data: ServiceUserEngagementResponse;
};

export const ServiceUserEngagementBarChart: React.FC<
  ServiceUserEngagementBarChartProps
> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
        <Bar dataKey="sessionCount" fill="#10B981" name="Sessions" />
      </BarChart>
    </ResponsiveContainer>
  );
};
