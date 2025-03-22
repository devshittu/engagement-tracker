// src/features/Reports/components/AdmissionEngagementReport.tsx
'use client';

import React from 'react';
import { ServiceUserEngagementReport } from './ServiceUserEngagementReport';
import DashboardPageFrame from '@/components/Frame/DashboardPageFrame';
import { useSearchParams } from 'next/navigation';
type AdmissionEngagementReportProps = {
  serviceUserId: string;
};
export const AdmissionEngagementReport: React.FC<
  AdmissionEngagementReportProps
> = ({ serviceUserId }) => {
  const searchParams = useSearchParams();
  const admissionId = searchParams.get('admissionId');

  return (
    <DashboardPageFrame
      title={`Engagement Report ${admissionId ? 'for Admission' : 'Overview'}`}
      pageActions={<></>}
    >
      <ServiceUserEngagementReport
        serviceUserId={serviceUserId}
        admissionId={admissionId || undefined}
      />
    </DashboardPageFrame>
  );
};
