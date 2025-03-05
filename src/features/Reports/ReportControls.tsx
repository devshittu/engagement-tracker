// components/ReportControls.tsx
'use client';

import { TimeFrame } from '@/types/report';

type Props = {
  selectedTimeFrame: TimeFrame;
  onChange: (timeFrame: TimeFrame) => void;
};

const ReportControls: React.FC<Props> = ({ selectedTimeFrame, onChange }) => {
  const timeFrames: TimeFrame[] = ['daily', 'weekly', 'monthly', 'yearly'];

  return (
    <div className="flex space-x-4 mb-4">
      {timeFrames.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-4 py-2 rounded ${
            selectedTimeFrame === tf
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {tf.charAt(0).toUpperCase() + tf.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default ReportControls;
