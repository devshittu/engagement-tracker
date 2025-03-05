'use client';

import React, { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ChartShimmerLoader from './ChartShimmerLoader';
import TrendSummaryCard from './TrendSummaryCard';

interface ReportDataPoint {
  label: string;
  current: number;
  previous: number;
}

interface TrendReportResponse {
  period: string;
  groupBy: string;
  currentData: { label: string; count: number }[];
  previousData: { label: string; count: number }[];
  currentTotal: number;
  previousTotal: number;
  percentageChange: number;
}

const SessionTrendReport: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'day' | 'year'>(
    'week',
  );
  const [weekday, setWeekday] = useState<string>(''); // optional, for specific weekday comparisons

  const { data, isLoading, isError, error, refetch } = useQuery<
    TrendReportResponse,
    Error
  >({
    queryKey: ['sessionTrendReport', period, weekday],
    queryFn: async () => {
      // Build query string based on period and weekday if provided
      const params = new URLSearchParams();
      params.set('period', period);
      if (weekday) {
        params.set('weekday', weekday);
      }
      const { data } = await axios.get<TrendReportResponse>(
        `/api/reports/sessions/trend?${params.toString()}`,
      );
      return data;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Merge currentData and previousData into chartData (assume same labels order)
  const chartData: ReportDataPoint[] = data
    ? data.currentData.map((point, idx) => ({
        label: point.label,
        current: point.count,
        previous: data.previousData[idx]?.count || 0,
      }))
    : [];

  // Handler for period change

  const handlePeriodChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newPeriod = e.target.value as 'day' | 'week' | 'month' | 'year';
      setPeriod(newPeriod);
      // If the new period is not weekly, clear any weekday filter.
      if (newPeriod !== 'week') {
        setWeekday('');
      }
    },
    [],
  );

  // Handler for weekday change (if period is 'week' and you want specific day comparisons)
  const handleWeekdayChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setWeekday(e.target.value);
    },
    [],
  );

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">
          Session Trend Report
        </h2>
        <div className="flex space-x-4 items-center">
          <select
            value={period}
            onChange={handlePeriodChange}
            className="select select-bordered text-base-content"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          {period === 'week' && (
            <select
              value={weekday}
              onChange={handleWeekdayChange}
              className="select select-bordered text-base-content"
            >
              <option value="">Overall</option>
              <option value="Mon">Monday</option>
              <option value="Tue">Tuesday</option>
              <option value="Wed">Wednesday</option>
              <option value="Thu">Thursday</option>
              <option value="Fri">Friday</option>
              <option value="Sat">Saturday</option>
              <option value="Sun">Sunday</option>
            </select>
          )}
        </div>
      </div>

      {isLoading && (
        <>
          <ChartShimmerLoader />
          <p className="text-center">Loading trend data...</p>
        </>
      )}
      {isError && (
        <p className="text-center text-error">Error: {error?.message}</p>
      )}

      {data && (
        <>
          <TrendSummaryCard
            title="Trend"
            description="Sessions Comparison"
            currentTotal={data.currentTotal}
            previousTotal={data.previousTotal}
            percentageChange={data.percentageChange}
          />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#3B82F6"
                name="Current"
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#10B981"
                name="Previous"
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default SessionTrendReport;
