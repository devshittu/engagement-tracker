// src/features/Reports/components/AdmissionFilter.tsx
'use client';

import React from 'react';
import { AdmissionStatus } from '../types/serviceUserAdmissions';

type AdmissionFilterProps = {
  value: AdmissionStatus;
  onChange: (status: AdmissionStatus) => void;
};

export const AdmissionFilter: React.FC<AdmissionFilterProps> = ({
  value,
  onChange,
}) => {
  const statuses: AdmissionStatus[] = ['all', 'admitted', 'discharged'];

  return (
    <div className="flex space-x-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={`btn btn-sm ${value === status ? 'btn-primary' : 'btn-outline'} transition-all duration-300 hover:scale-105`}
        >
          {status === 'all'
            ? 'All'
            : status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  );
};
