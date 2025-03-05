'use client';

import React from 'react';

export interface StatusItemProps {
  value: number | string;
  label: string;
  // Optionally, you can accept custom classes
  valueClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const StatusItem: React.FC<StatusItemProps> = ({
  value,
  label,
  valueClassName = 'text-2xl font-bold text-base-content',
  labelClassName = 'text-lg text-base-content',
  containerClassName = 'flex flex-col items-start',
}) => {
  return (
    <div className={`item-status ${containerClassName}`}>
      <span className={`status-number ${valueClassName}`}>{value}</span>
      <span className={`status-type ${labelClassName}`}>{label}</span>
    </div>
  );
};

export default StatusItem;
// src/components/Blocks/StatusItem.tsx
