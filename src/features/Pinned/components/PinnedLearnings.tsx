'use client';

import React from 'react';
import { ProgressCard } from './ProgressCard';
import { MoreIcon } from '../../../components/Icons/MoreIcon';

export type LearningProgress = {
  title: string;
  progress: string;
  icon: React.ReactNode;
  color: 1 | 2 | 3 | 4;
};

type PinnedLearningsProps = {
  learnings: LearningProgress[];
};

export const PinnedLearnings: React.FC<PinnedLearningsProps> = ({
  learnings,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-regular text-stone-800 text-xl">My learnings</h2>
        <a href="#more" title="More options">
          <MoreIcon />
        </a>
      </div>
      <p className="my-2">Your progress of medical lectures</p>
      <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-8">
        {learnings.map((learning, index) => (
          <li key={index}>
            <ProgressCard
              title={learning.title}
              progress={learning.progress}
              icon={learning.icon}
              color={learning.color}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
