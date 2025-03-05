'use client';

import React, { useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMostParticipatedSessions } from './hooks/useMostParticipatedSessions';
import ChartShimmerLoader from './ChartShimmerLoader';

const MostParticipatedSessionChart: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);

  const { data, isLoading, isError, error, refetch } =
    useMostParticipatedSessions({
      year,
      month,
    });

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setYear(parseInt(e.target.value));
    },
    [],
  );

  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMonth(parseInt(e.target.value));
    },
    [],
  );

  if (isLoading)
    return (
      <>
        <ChartShimmerLoader />
        <p className="text-center">Loading data...</p>
      </>
    );
  if (isError) return <p>Error: {error?.message}</p>;

  // Chart data is simply the array returned in data.data.
  const chartData = data?.data || [];

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-center space-x-4 mb-4">
        <label className="flex items-center">
          <span className="mr-2">Year:</span>
          <select
            value={year}
            onChange={handleYearChange}
            className="select select-bordered text-base-content"
          >
            {[...Array(5)].map((_, idx) => {
              const y = currentYear - idx;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </label>
        <label className="flex items-center">
          <span className="mr-2">Month:</span>
          <select
            value={month}
            onChange={handleMonthChange}
            className="select select-bordered text-base-content"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-outline" onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      <div className="mb-4 p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
        {data?.top ? (
          <p className="text-lg font-bold">
            Most Participated Activity: {data.top.activityName} (
            {data.top.count} sessions)
          </p>
        ) : (
          <p className="text-lg">No data available</p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="activityName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#3B82F6" name="Sessions Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MostParticipatedSessionChart;
