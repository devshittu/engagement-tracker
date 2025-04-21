// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Reports/components/SessionCountReport.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useSessionCount } from '../hooks/useSessionCount';
import { SessionCountChart } from '../charts/SessionCountChart';
import { ChartContainer } from './ChartContainer';
import { PeriodSelector } from './PeriodSelector';
import { TrendSummary } from './TrendSummary';

export const SessionCountReport: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>(
    'week',
  );
  const [groupBy, setGroupBy] = useState<
    'admissionId' | 'activityLogId' | undefined
  >(undefined);

  const { data, isLoading, error } = useSessionCount({
    period,
    compareTo: 'last',
    groupBy,
  });

  const handlePeriodChange = useCallback(
    (newPeriod: 'day' | 'week' | 'month' | 'year') => {
      setPeriod(newPeriod);
    },
    [],
  );

  const handleGroupByChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as 'admissionId' | 'activityLogId' | '';
      setGroupBy(value === '' ? undefined : value);
    },
    [],
  );

  const controls = (
    <>
      <PeriodSelector value={period} onChange={handlePeriodChange} />
      <select
        value={groupBy || ''}
        onChange={handleGroupByChange}
        className="select select-bordered text-base-content"
      >
        <option value="">No Grouping</option>
        <option value="admissionId">By Admission</option>
        <option value="activityLogId">By Activity</option>
      </select>
    </>
  );

  const summary = data && !('groupBy' in data) && (
    <TrendSummary
      currentTotal={data.current._count.id}
      previousTotal={data.previous._count.id}
      percentageChange={data.trend.percentageChange}
      description={`Sessions (${period})`}
    />
  );

  return (
    <ChartContainer
      title="Session Count Report"
      isLoading={isLoading}
      error={error}
      controls={controls}
      summary={summary}
    >
      {data && <SessionCountChart data={data} />}
    </ChartContainer>
  );
};
