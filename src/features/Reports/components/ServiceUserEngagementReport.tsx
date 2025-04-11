// src/features/Reports/components/ServiceUserEngagementReport.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useServiceUserEngagement } from '../hooks/useServiceUserEngagement';
import { ServiceUserEngagementLineChart } from '../charts/ServiceUserEngagementLineChart';
import { ChartContainer } from './ChartContainer';
import { PeriodSelector } from './PeriodSelector';

type Props = { serviceUserId: string; admissionId?: string };

export const ServiceUserEngagementReport: React.FC<Props> = ({
  serviceUserId,
  admissionId,
}) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' >('week');
  const { data, isLoading, error } = useServiceUserEngagement({
    serviceUserId,
    period,
    admissionId,
  });

  const handlePeriodChange = useCallback(
    (newPeriod: 'day' | 'week' | 'month') => {
      setPeriod(newPeriod);
    },
    [],
  );

  const controls = (
    <PeriodSelector value={period} onChange={handlePeriodChange} />
  );

  const summary = data && (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
      <p className="text-lg font-semibold">
        {data.serviceUser.name} (NHS: {data.serviceUser.nhsNumber})
      </p>
      {data.wardDetails && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Ward: {data.wardDetails.name} | Admitted:{' '}
          {new Date(data.wardDetails.admissionDate).toLocaleDateString()} |
          {data.wardDetails.dischargeDate
            ? `Discharged: ${new Date(data.wardDetails.dischargeDate).toLocaleDateString()}`
            : 'Still Admitted'}
        </p>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Activities: {data.activities.join(', ') || 'None'}
      </p>
      <p className="text-lg font-semibold">
        Total Sessions: {data.totalSessions.toLocaleString()}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Average per {period}: {data.averageSessionsPerPeriod.toFixed(1)}
      </p>
    </div>
  );

  const chartComponent = data?.data.length ? (
    <ServiceUserEngagementLineChart data={data} />
  ) : (
    <p className="text-center text-gray-500">No engagement data available.</p>
  );

  return (
    <ChartContainer
      title={
        admissionId
          ? 'Admission Engagement Snapshot'
          : 'Service User Engagement'
      }
      description={
        admissionId
          ? `Engagement for ${data?.serviceUser.name} during their stay in ${data?.wardDetails?.name}.`
          : `Overview of ${data?.serviceUser.name}'s engagement across their care journey.`
      }
      isLoading={isLoading}
      error={error}
      controls={controls}
      summary={summary}
    >
      {chartComponent}
    </ChartContainer>
  );
};
