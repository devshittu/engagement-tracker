// src/features/Reports/components/WardEngagementCard.tsx

'use client';

import React, { useState } from 'react';
import { EngagementSnapshotWard } from '../types/engagementSnapshot';
import { ProgressIndicator } from './ProgressIndicator';
import { motion } from 'framer-motion';
import { getWardColor } from '../utils/wardColors';

type WardEngagementCardProps = {
  ward: EngagementSnapshotWard;
  viewType?: 'circular' | 'linear'; // Optional prop for parent-controlled view type
};

export const WardEngagementCard: React.FC<WardEngagementCardProps> = ({
  ward,
  viewType: parentViewType,
}) => {
  const [localViewType, setLocalViewType] = useState<'circular' | 'linear'>(
    'circular',
  );
  const viewType = parentViewType || localViewType; // Use parent viewType if provided, else local
  const showToggle = parentViewType === undefined; // Show toggle only if parent doesn't control viewType

  const wardGradient = getWardColor(ward.wardName);

  const totalOffered = ward.groups.offered + ward.oneToOnes.offered;
  const totalAttended = ward.groups.attended + ward.oneToOnes.attended;
  const totalDeclined = ward.groups.declined + ward.oneToOnes.declined;
  const combinedPercentAttended = totalOffered
    ? (totalAttended / totalOffered) * 100
    : 0;
  const combinedPercentDeclined = totalOffered
    ? (totalDeclined / totalOffered) * 100
    : 0;

  const handleViewTypeChange = () => {
    setLocalViewType(viewType === 'circular' ? 'linear' : 'circular');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${wardGradient} text-white p-6 rounded-lg shadow-xl`}
    >
      <h2 className="text-xl font-bold mb-4">{ward.wardName}</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm">
            Service Users:{' '}
            <span className="font-semibold">{ward.serviceUsers}</span>
          </p>
        </div>
        {showToggle && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleViewTypeChange}
              className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm hover:bg-gray-100"
            >
              {viewType === 'circular'
                ? 'Switch to Linear'
                : 'Switch to Circular'}
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold mb-2">Groups</p>
            <p>Offered: {ward.groups.offered}</p>
            <p>Attended: {ward.groups.attended}</p>
            <p>Declined: {ward.groups.declined}</p>
            <ProgressIndicator
              percentAttended={ward.groups.percentAttended}
              percentDeclined={ward.groups.percentDeclined}
              wardName={ward.wardName}
              type={viewType}
              title="Group Engagement"
            />
          </div>
          <div>
            <p className="font-semibold mb-2">1:1s</p>
            <p>Offered: {ward.oneToOnes.offered}</p>
            <p>Attended: {ward.oneToOnes.attended}</p>
            <p>Declined: {ward.oneToOnes.declined}</p>
            <ProgressIndicator
              percentAttended={ward.oneToOnes.percentAttended}
              percentDeclined={ward.oneToOnes.percentDeclined}
              wardName={ward.wardName}
              type={viewType}
              title="1:1 Engagement"
            />
          </div>
        </div>
        <div className="border-t border-white/30 pt-4">
          <p className="font-semibold mb-2">Combined Engagement</p>
          <p>Total Offered: {totalOffered}</p>
          <p>Total Attended: {totalAttended}</p>
          <p>Total Declined: {totalDeclined}</p>
          <ProgressIndicator
            percentAttended={combinedPercentAttended}
            percentDeclined={combinedPercentDeclined}
            wardName={ward.wardName}
            type={viewType}
            title="Overall Engagement"
          />
        </div>
      </div>
    </motion.div>
  );
};
