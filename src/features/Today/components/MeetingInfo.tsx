'use client';

import React from 'react';

type MeetingInfoProps = {
  title: string;
  time: string;
};

export const MeetingInfo: React.FC<MeetingInfoProps> = ({ title, time }) => {
  return (
    <div className="border-l pl-6">
      <p className="text-stone-800">{title}</p>
      <time>{time}</time>
    </div>
  );
};
