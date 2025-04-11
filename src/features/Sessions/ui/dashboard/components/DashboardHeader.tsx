'use client';

import React from 'react';
import Link from 'next/link';

type DashboardHeaderProps = {
  totalActive: number;
  oneToOneCount: number;
  groupCount: number;
  sortOrder: 'asc' | 'desc';
  onToggleSort: () => void;
  onEndAllOneToOne: () => void;
  onEndAllGroup: () => void;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalActive,
  oneToOneCount,
  groupCount,
  sortOrder,
  onToggleSort,
  onEndAllOneToOne,
  onEndAllGroup,
}) => (
  <div className="flex flex-col md:flex-row justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Active Sessions</h1>
    <div className="flex flex-wrap items-center space-x-4 mt-4 md:mt-0">
      <div className="badge badge-lg bg-teal-500 text-white">Total Active: {totalActive}</div>
      <button
        className="btn btn-outline hover:bg-teal-500 hover:text-white"
        onClick={onToggleSort}
      >
        {sortOrder === 'asc' ? 'Earliest First' : 'Latest First'}
      </button>
      <button
        onClick={onEndAllOneToOne}
        className={`btn bg-red-500 hover:bg-red-600 text-white ${oneToOneCount === 0 ? 'btn-disabled' : ''}`}
        disabled={oneToOneCount === 0}
      >
        End All One-to-One ({oneToOneCount})
      </button>
      <button
        onClick={onEndAllGroup}
        className={`btn bg-red-600 hover:bg-red-700 text-white ${groupCount === 0 ? 'btn-disabled' : ''}`}
        disabled={groupCount === 0}
      >
        End All Group ({groupCount})
      </button>
      <Link href="/sessions/declined" className="btn bg-yellow-500 hover:bg-yellow-600 text-white">
        View Declined
      </Link>
      {totalActive > 6 && (
        <Link href="/sessions/active" className="btn bg-teal-500 hover:bg-teal-600 text-white">
          View All
        </Link>
      )}
    </div>
  </div>
);

export default DashboardHeader;