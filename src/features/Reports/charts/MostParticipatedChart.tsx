// src/features/Reports/charts/MostParticipatedChart.tsx
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
import { MostParticipatedResponse } from '../types/mostParticipated';

type MostParticipatedChartProps = {
  data: MostParticipatedResponse;
};

export const MostParticipatedChart: React.FC<MostParticipatedChartProps> = ({
  data,
}) => {
  const chartData = useMemo(() => data.data, [data.data]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="activityName" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#3B82F6" name="Session Count" />
      </BarChart>
    </ResponsiveContainer>
  );
};
