// src/features/Reports/components/AdmissionCard.tsx
'use client';

import React from 'react';
import { Admission } from '../types/serviceUserAdmissions';
import Link from 'next/link';

type AdmissionCardProps = {
  admission: Admission;
  serviceUserId: string;
};

export const AdmissionCard: React.FC<AdmissionCardProps> = ({
  admission,
  serviceUserId,
}) => {
  return (
    <div className="card bg-base-100 shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-lg font-semibold text-primary">
        {admission.status === 'admitted' ? 'Active Stay' : 'Past Stay'} - Ward:{' '}
        {admission.ward}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Admitted: {new Date(admission.admissionDate).toLocaleDateString()} by{' '}
        {admission.admittedBy}
      </p>
      {admission.dischargeDate && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Discharged: {new Date(admission.dischargeDate).toLocaleDateString()}{' '}
          by {admission.dischargedBy || 'N/A'}
        </p>
      )}
      <div className="mt-2">
        <Link
          href={`/reports/service-users/${serviceUserId}/engagement?admissionId=${admission.id}`}
          className="btn btn-sm btn-primary"
        >
          View Engagement
        </Link>
      </div>
    </div>
  );
};
