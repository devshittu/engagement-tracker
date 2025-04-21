// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
'use client';

import React, { useState } from 'react';
import { useFacilitatorSnapshot } from '../hooks/useFacilitatorSnapshot';
import { FacilitatorCard } from './FacilitatorCard';
import { FacilitatorSummaryChart } from './FacilitatorSummaryChart';
import { PeriodChooser } from './PeriodChooser';
import { ChartContainer } from './ChartContainer';
import { format, parseISO } from 'date-fns';

type FacilitatorEngagementReportProps = {
  earliestDate: string;
};

export const FacilitatorEngagementReport: React.FC<
  FacilitatorEngagementReportProps
> = ({ earliestDate }) => {
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().slice(0, 7) + '-01',
  );
  const [viewType, setViewType] = useState<'circular' | 'linear'>('linear');
  const period = 'month';

  const { data, isLoading, error } = useFacilitatorSnapshot({
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
        Total Facilitators: {data.snapshot.length}
      </p>
      <p className="text-sm">
        Groups Offered: {data.totals.groups.offered} | Completed:{' '}
        {data.totals.groups.completed} (
        {data.totals.groups.percentCompleted.toFixed(1)}%)
      </p>
      <p className="text-sm">
        1:1s Offered: {data.totals.oneToOnes.offered} | Completed:{' '}
        {data.totals.oneToOnes.completed} (
        {data.totals.oneToOnes.percentCompleted.toFixed(1)}%)
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Period: {format(parseISO(data.startDate), 'MMMM yyyy')}
      </p>
    </div>
  );

  return (
    <ChartContainer
      title="Facilitator Focus"
      description="Shine a spotlight on facilitator engagement! This report highlights the sessions offered, completed, and declined by each facilitator, with a comprehensive summary of their impact across groups and 1:1s."
      isLoading={isLoading}
      error={error}
      controls={controls}
      summary={summary}
    >
      {data?.snapshot.length ? (
        <>
          <FacilitatorSummaryChart facilitators={data.snapshot} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {data.snapshot.map((user) => (
              <FacilitatorCard
                key={user.userId}
                user={user}
                viewType={viewType}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">
          No data available for this period.
        </p>
      )}
    </ChartContainer>
  );
};
