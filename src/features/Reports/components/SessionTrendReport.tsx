// // src/features/Reports/components/SessionTrendReport.tsx
// 'use client';

// import React, { useState, useCallback } from 'react';
// import { useSessionTrend } from '../hooks/useSessionTrend';
// import { SessionTrendChart } from '../charts/SessionTrendChart';
// import { ChartContainer } from './ChartContainer';
// import { PeriodSelector } from './PeriodSelector';
// import { TrendSummary } from './TrendSummary';

// export const SessionTrendReport: React.FC = () => {
//   const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

//   const { data, isLoading, error } = useSessionTrend({
//     period,
//     compareTo: 'last',
//   });

//   const handlePeriodChange = useCallback((newPeriod: 'day' | 'week' | 'month' | 'year') => {
//     setPeriod(newPeriod);
//   }, []);

//   const controls = (
//     <PeriodSelector value={period} onChange={handlePeriodChange} />
//   );

//   const summary = data && (
//     <div className="space-y-4">
//       <TrendSummary
//         currentTotal={data.currentTotal}
//         previousTotal={data.previousTotal}
//         percentageChange={data.percentageChange}
//         description={`Sessions (${data.groupBy})`}
//       />
//       {data.hasDecline && (
//         <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
//           <p className="font-semibold">Engagement Decline Detected</p>
//           <p>Session counts have decreased significantly compared to the previous period.</p>
//         </div>
//       )}
//     </div>
//   );

//   return (
//     <ChartContainer
//       title="Session Trend Report"
//       isLoading={isLoading}
//       error={error}
//       controls={controls}
//       summary={summary}
//     >
//       {data && <SessionTrendChart data={data} />}
//     </ChartContainer>
//   );
// };

// src/features/Reports/components/SessionTrendReport.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useSessionTrend } from '../hooks/useSessionTrend';
import { SessionTrendChart } from '../charts/SessionTrendChart';
import { ChartContainer } from './ChartContainer';
import { PeriodSelector } from './PeriodSelector';
import { TrendSummary } from './TrendSummary';

export const SessionTrendReport: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>(
    'week',
  );

  const { data, isLoading, error } = useSessionTrend({
    period,
    compareTo: 'last',
  });

  const handlePeriodChange = useCallback(
    (newPeriod: 'day' | 'week' | 'month' | 'year') => {
      setPeriod(newPeriod);
    },
    [],
  );

  const controls = (
    <PeriodSelector value={period} onChange={handlePeriodChange} />
  );

  const summary = data ? (
    <div className="space-y-4">
      <TrendSummary
        currentTotal={data.currentTotal ?? 0} // Fallback to 0 if undefined
        previousTotal={data.previousTotal ?? 0} // Fallback to 0 if undefined
        percentageChange={data.percentageChange ?? 0} // Fallback to 0 if undefined
        description={`Sessions (${data.groupBy})`}
      />
      {data.hasDecline && (
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
          <p className="font-semibold">Engagement Decline Detected</p>
          <p>
            Session counts have decreased significantly compared to the previous
            period.
          </p>
        </div>
      )}
    </div>
  ) : null;

  return (
    <ChartContainer
      title="Session Trend Report"
      isLoading={isLoading}
      error={error}
      controls={controls}
      summary={summary}
    >
      {data && <SessionTrendChart data={data} />}
    </ChartContainer>
  );
};
