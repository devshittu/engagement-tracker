'use client';

import React from 'react';
import { TaskCard } from './TaskCard';

type PinnedTask = {
  subheading: string;
  heading: string;
  due: string;
  status: React.ReactNode;
};

type PinnedTaskListProps = {
  tasks: PinnedTask[];
};

export const PinnedTaskList: React.FC<PinnedTaskListProps> = ({ tasks }) => {
  return (
    <ul className="grid gap-4">
      {tasks.map((task, index) => (
        <li key={index}>
          <TaskCard
            subheading={task.subheading}
            heading={task.heading}
            due={task.due}
            status={task.status}
          />
        </li>
      ))}
    </ul>
  );
};
