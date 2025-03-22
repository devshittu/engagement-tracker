// src/features/Reports/components/PeriodChooser.tsx
'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';

type PeriodChooserProps = {
  period: string;
  startDate: string;
  onChange: (startDate: string) => void;
  earliestDate: string;
  latestDate: string;
};

export const PeriodChooser: React.FC<PeriodChooserProps> = ({
  period,
  startDate,
  onChange,
  earliestDate,
  latestDate,
}) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    onChange(newDate);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="datePicker" className="font-medium">
        Select Month:
      </label>
      <input
        type="month"
        id="datePicker"
        value={format(parseISO(startDate), 'yyyy-MM')}
        onChange={handleDateChange}
        min={earliestDate}
        max={latestDate}
        className="input input-bordered"
      />
    </div>
  );
};
