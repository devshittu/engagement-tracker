// src/features/Reports/charts/SessionCountChart.tsx
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
import { SessionCountResponse } from '../types/sessionCount';

type SessionCountChartProps = {
  data: SessionCountResponse;
};

export const SessionCountChart: React.FC<SessionCountChartProps> = ({
  data,
}) => {
  const chartData = useMemo(() => {
    if ('groupBy' in data && data.groupBy) {
      // Grouped data
      return data.current.map((currentItem, idx) => ({
        label: currentItem[data.groupBy as string] ?? 'Unknown',
        current: currentItem._count.id,
        previous: data.previous[idx]?._count.id ?? 0,
      }));
    } else {
      // Aggregate data
      return [
        {
          label: `${data.period} (Current)`,
          count: data.current._count.id,
        },
        {
          label: `${data.period} (Previous)`,
          count: data.previous._count.id,
        },
      ];
    }
  }, [data]);

  const isGrouped = 'groupBy' in data && data.groupBy;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />
        {isGrouped ? (
          <>
            <Bar dataKey="current" fill="#3B82F6" name="Current Period" />
            <Bar dataKey="previous" fill="#10B981" name="Previous Period" />
          </>
        ) : (
          <Bar dataKey="count" fill="#3B82F6" name="Session Count" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};
