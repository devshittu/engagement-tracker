'use client';

import React from 'react';
import { PinnedTaskList } from './components/PinnedTaskList';
import {
  LearningProgress,
  PinnedLearnings,
} from './components/PinnedLearnings';
import { NumberIcon } from '@/components/Icons/NumberIcon';
import { AlertIcon } from '@/components/Icons/AlertIcon';
import { CheckIcon } from '@/components/Icons/CheckIcon';
import { VirusIcon } from '@/components/Icons/VirusIcon';
import { BacteriaIcon } from '@/components/Icons/BacteriaIcon';
import { MicroscopeIcon } from '@/components/Icons/MicroscopeIcon';
import { DNAIcon } from '@/components/Icons/DNAIcon';

type PinnedProps = {};

export const Pinned: React.FC<PinnedProps> = () => {
  const tasks = [
    {
      subheading: 'Next-gen immuno',
      heading: 'Multispecfic liquids analysis',
      due: '5d',
      status: (
        <>
          <NumberIcon number={1} /> New feedback
        </>
      ),
    },
    {
      subheading: 'Harmony',
      heading: 'Protein characterization during childhood and pregnancy',
      due: '1h',
      status: (
        <>
          <AlertIcon /> Deadline is today
        </>
      ),
    },
    {
      subheading: 'Pharmaceutical',
      heading: 'Quick element dissolution testing',
      due: '7h',
      status: (
        <>
          <CheckIcon /> Accepted
        </>
      ),
    },
  ];

  const learnings: LearningProgress[] = [
    {
      title: 'Viruses',
      progress: '96%',
      icon: <VirusIcon />,
      color: 1,
    },
    {
      title: 'Bacterial cells',
      progress: '33%',
      icon: <BacteriaIcon />,
      color: 2,
    },
    {
      title: 'Med science',
      progress: '7%',
      icon: <MicroscopeIcon />,
      color: 3,
    },
    {
      title: 'Human genes',
      progress: '58%',
      icon: <DNAIcon />,
      color: 4,
    },
  ];

  return (
    <section className="grid gap-8 p-8 lg:p-10">
      <div className="flex items-center justify-between">
        <h2 className="font-regular text-stone-800 text-xl">Monthly pinned</h2>
        <a href="#view-all">View all</a>
      </div>
      <PinnedTaskList tasks={tasks} />
      <PinnedLearnings learnings={learnings} />
    </section>
  );
};
