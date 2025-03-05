// src/components/Icons/NumberIcon.tsx
import React from 'react';

type NumberIconProps = {
  number: number;
};

export const NumberIcon: React.FC<NumberIconProps> = ({ number }) => (
  <span className="grid place-items-center w-6 h-6 bg-orange-200 text-stone-800 rounded-full">
    {number}
  </span>
);
