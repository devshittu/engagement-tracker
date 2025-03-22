'use client';

import React, { useCallback } from 'react';

type Period = 'day' | 'week' | 'month' | 'year';

type PeriodSelectorProps = {
  value: Period;
  onChange: (period: Period) => void;
  allowedPeriods?: Period[];
};

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  value,
  onChange,
  allowedPeriods = ['day', 'week', 'month', 'year'],
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value as Period);
    },
    [onChange],
  );

  return (
    <select
      value={value}
      onChange={handleChange}
      className="select select-bordered text-base-content"
    >
      {allowedPeriods.map((period) => (
        <option key={period} value={period}>
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </option>
      ))}
    </select>
  );
};
