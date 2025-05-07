'use client';

import React from 'react';

interface DurationSliderProps {
  value: number; // Duration in minutes
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const DurationSlider: React.FC<DurationSliderProps> = ({
  value,
  onChange,
  min = 15,
  max = 300,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Duration: {value} minutes
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={15}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>{min} min</span>
        <span>{max} min</span>
      </div>
    </div>
  );
};
