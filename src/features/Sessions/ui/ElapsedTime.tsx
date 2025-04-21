'use client';

import { useEffect, useState } from 'react';

type ElapsedTimeProps = {
  timeIn: string;
  timeOut?: string | null;
  big?: boolean;
};

const ElapsedTime: React.FC<ElapsedTimeProps> = ({ timeIn, timeOut, big }) => {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    // If session is ended, update once and stop
    if (timeOut) {
      const diff = new Date(timeOut).getTime() - new Date(timeIn).getTime();
      setElapsed(diff);
      return;
    }
    // Otherwise, update every second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(timeIn).getTime();
      setElapsed(now - start);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeIn, timeOut]);

  const formatElapsed = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={big ? 'text-4xl font-bold' : 'text-base'}>
      {formatElapsed(elapsed)}
    </div>
  );
};

export default ElapsedTime;
// src/features/Sessions/ui/ElapsedTime.tsx
