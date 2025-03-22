'use client';

import React from 'react';
import { FacilitatorSnapshotUser } from '../types/facilitatorSnapshot';
import { ProgressIndicator } from './ProgressIndicator';
import { motion } from 'framer-motion';
import { getWardColor } from '../utils/wardColors';

type FacilitatorCardProps = {
  user: FacilitatorSnapshotUser;
  viewType: 'circular' | 'linear';
};

export const FacilitatorCard: React.FC<FacilitatorCardProps> = ({
  user,
  viewType,
}) => {
  const wardGradient = getWardColor(user.primaryWard);

  const totalOffered = user.groups.offered + user.oneToOnes.offered;
  const totalCompleted = user.groups.completed + user.oneToOnes.completed;
  const totalDeclined = user.groups.declined + user.oneToOnes.declined;
  const combinedPercentCompleted = totalOffered
    ? (totalCompleted / totalOffered) * 100
    : 0;
  const combinedPercentDeclined = totalOffered
    ? (totalDeclined / totalOffered) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${wardGradient} text-white p-6 rounded-lg shadow-xl`}
    >
      <h2 className="text-xl font-bold mb-4">{user.email}</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm">
            Primary Ward:{' '}
            <span className="font-semibold">{user.primaryWard}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold mb-2">Groups</p>
            <p>Offered: {user.groups.offered}</p>
            <p>Completed: {user.groups.completed}</p>
            <p>Declined: {user.groups.declined}</p>
            <ProgressIndicator
              percentAttended={user.groups.percentCompleted}
              percentDeclined={user.groups.percentDeclined}
              wardName={user.primaryWard}
              type={viewType}
              title="Group Facilitation"
            />
          </div>
          <div>
            <p className="font-semibold mb-2">1:1s</p>
            <p>Offered: {user.oneToOnes.offered}</p>
            <p>Completed: {user.oneToOnes.completed}</p>
            <p>Declined: {user.oneToOnes.declined}</p>
            <ProgressIndicator
              percentAttended={user.oneToOnes.percentCompleted}
              percentDeclined={user.oneToOnes.percentDeclined}
              wardName={user.primaryWard}
              type={viewType}
              title="1:1 Facilitation"
            />
          </div>
        </div>
        <div className="border-t border-white/30 pt-4">
          <p className="font-semibold mb-2">Combined Facilitation</p>
          <p>Total Offered: {totalOffered}</p>
          <p>Total Completed: {totalCompleted}</p>
          <p>Total Declined: {totalDeclined}</p>
          <ProgressIndicator
            percentAttended={combinedPercentCompleted}
            percentDeclined={combinedPercentDeclined}
            wardName={user.primaryWard}
            type={viewType}
            title="Overall Facilitation"
          />
        </div>
      </div>
    </motion.div>
  );
};
