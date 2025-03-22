// src/features/Reports/components/MostParticipatedReport.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useMostParticipated } from '../hooks/useMostParticipated';
import { MostParticipatedChart } from '../charts/MostParticipatedChart';
import { ChartContainer } from './ChartContainer';

export const MostParticipatedReport: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);

  const { data, isLoading, error } = useMostParticipated({ year, month });

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setYear(parseInt(e.target.value));
    },
    [],
  );

  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMonth(parseInt(e.target.value));
    },
    [],
  );

  const controls = (
    <div className="flex space-x-4">
      <select
        value={year}
        onChange={handleYearChange}
        className="select select-bordered text-base-content"
      >
        {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        value={month}
        onChange={handleMonthChange}
        className="select select-bordered text-base-content"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );

  const summary = data?.top && (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-lg font-bold">
        Top Activity: {data.top.activityName} ({data.top.count.toLocaleString()}{' '}
        sessions)
      </p>
    </div>
  );

  return (
    <ChartContainer
      title="Most Participated Activities"
      isLoading={isLoading}
      error={error}
      controls={controls}
      summary={summary}
    >
      {data && <MostParticipatedChart data={data} />}
    </ChartContainer>
  );
};
