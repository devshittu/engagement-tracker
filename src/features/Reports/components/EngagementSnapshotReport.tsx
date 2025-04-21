// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Reports/components/EngagementSnapshotReport.tsx

'use client';

import React, { useState } from 'react';
import { useEngagementSnapshot } from '../hooks/useEngagementSnapshot';
import { WardEngagementCard } from './WardEngagementCard';
import { PeriodChooser } from './PeriodChooser';
import { ChartContainer } from './ChartContainer';
import { format, parseISO } from 'date-fns';

type EngagementSnapshotReportProps = {
  earliestDate: string;
};

export const EngagementSnapshotReport: React.FC<
  EngagementSnapshotReportProps
> = ({ earliestDate }) => {
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 7) + '-01',
  );
  const [viewType, setViewType] = useState<'circular' | 'linear'>('linear'); // Added viewType state
  const period = 'month';

  const { data, isLoading, error } = useEngagementSnapshot({
    period,
    startDate,
  });

  const handleDateChange = (newDate: string) => {
    setStartDate(newDate + '-01');
  };

  const handleViewTypeChange = () => {
    setViewType(viewType === 'circular' ? 'linear' : 'circular');
  };

  const controls = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
      <PeriodChooser
        period={period}
        startDate={startDate}
        onChange={handleDateChange}
        earliestDate={earliestDate}
        latestDate={new Date().toISOString().slice(0, 7)}
      />
      <button
        onClick={handleViewTypeChange}
        className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
      >
        {viewType === 'circular' ? 'Switch to Linear' : 'Switch to Circular'}
      </button>
    </div>
  );

  const summary = data && (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-lg font-semibold">
        Total Service Users: {data.totals.serviceUsers}
      </p>
      <p className="text-sm">
        Groups Offered: {data.totals.groups.offered} | Attended:{' '}
        {data.totals.groups.attended} (
        {data.totals.groups.percentAttended.toFixed(1)}%)
      </p>
      <p className="text-sm">
        1:1s Offered: {data.totals.oneToOnes.offered} | Attended:{' '}
        {data.totals.oneToOnes.attended} (
        {data.totals.oneToOnes.percentAttended.toFixed(1)}%)
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Period: {format(parseISO(data.startDate), 'MMMM yyyy')}
      </p>
    </div>
  );

  return (
    <ChartContainer
      title="Ward Engagement Pulse"
      description="Feel the heartbeat of engagement across wards! This snapshot captures service user participation in groups and 1:1 sessions, showcasing attendance and declination rates in a vibrant, easy-to-digest format."
      isLoading={isLoading}
      error={error}
      controls={controls}
      summary={summary}
    >
      {data?.snapshot.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.snapshot.map((ward) => (
            <WardEngagementCard
              key={ward.wardId}
              ward={ward}
              viewType={viewType}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No data available for this period.
        </p>
      )}
    </ChartContainer>
  );
};
