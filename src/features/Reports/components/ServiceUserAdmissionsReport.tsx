// @ts-nocheck
// TODO: Temporary suppression of TypeScript errors for demo purposes.
//       Re-enable type checking after resolving the issues.
// src/features/Reports/components/ServiceUserAdmissionsReport.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  ServiceUserAdmissionsResponse,
  AdmissionStatus,
} from '../types/serviceUserAdmissions';
import { ChartContainer } from './ChartContainer';
import { AdmissionLoader } from './AdmissionLoader';
import { AdmissionFilter } from './AdmissionFilter';
import { AdmissionCard } from './AdmissionCard';
import Link from 'next/link';

type ServiceUserAdmissionsReportProps = {
  serviceUserId: string;
};

export const ServiceUserAdmissionsReport: React.FC<
  ServiceUserAdmissionsReportProps
> = ({ serviceUserId }) => {
  const [filter, setFilter] = useState<AdmissionStatus>('all');

  const { data, isLoading, error } = useQuery<
    ServiceUserAdmissionsResponse,
    Error
  >({
    queryKey: ['serviceUserAdmissions', serviceUserId],
    queryFn: async () =>
      await apiClient.get(`/api/service-users/${serviceUserId}/admissions`),
    enabled: !!serviceUserId,
  });

  const filteredAdmissions = data?.admissions.filter((admission) =>
    filter === 'all' ? true : admission.status === filter,
  );

  const handleFilterChange = useCallback((status: AdmissionStatus) => {
    setFilter(status);
  }, []);

  const controls = (
    <AdmissionFilter value={filter} onChange={handleFilterChange} />
  );

  const summary = data && (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-lg font-semibold">
        Total Admissions: {data.admissions.length}
      </p>
      <Link
        href={`/reports/service-users/${serviceUserId}/engagement`}
        className="btn btn-primary mt-2"
      >
        View Overall Engagement
      </Link>
    </div>
  );

  return (
    <ChartContainer
      title="Care Journey Explorer"
      description="Step into a snapshot of care! This report weaves the tale of a service user’s hospital stays—each admission a chapter, each session a footnote. Filter through their journey and dive deeper into their engagement story."
      isLoading={isLoading}
      error={error}
      controls={controls}
      summary={summary}
    >
      {isLoading ? (
        <AdmissionLoader />
      ) : filteredAdmissions && filteredAdmissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAdmissions.map((admission) => (
            <AdmissionCard
              key={admission.id}
              admission={admission}
              serviceUserId={serviceUserId}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No admissions found.
        </p>
      )}
    </ChartContainer>
  );
};
