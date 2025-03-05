// src/components/ProgressCard.tsx
import React from 'react';

type ProgressCardProps = {
  title: string;
  progress: string;
  icon: React.ReactNode;
  color: 1 | 2 | 3 | 4;
};

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  progress,
  icon,
  color,
}) => {
  const colors = [
    'text-indigo-900 bg-indigo-100',
    'text-amber-800 bg-amber-100',
    'text-rose-800 bg-rose-100',
    'text-teal-800 bg-teal-100',
  ];

  return (
    <div className="flex items-start gap-4">
      <div className={`p-3 ${colors[color - 1]}`}>{icon}</div>
      <div>
        <h3 className="font-bold text-stone-800 text-xl">{title}</h3>
        <p>{progress} progress</p>
      </div>
    </div>
  );
};
