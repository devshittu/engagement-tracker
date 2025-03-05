'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import MetricCard, { MetricCardShimmer } from './MetricCard';

export interface Metric {
  title: string;
  value: number;
  change: number; // percentage change
  positive: boolean;
}

const fetchMetrics = async (): Promise<Metric[]> => {
  const { data } = await axios.get<Metric[]>(
    '/api/reports/sessions/metrics/dashboard',
  );
  return data;
};

const DashboardMetrics: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery<Metric[], Error>({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchMetrics,
    refetchInterval: 30000, // refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl">
        <div className="-mx-2 md:flex">
          <MetricCardShimmer />
          <MetricCardShimmer />
          <MetricCardShimmer />
        </div>
      </div>
    );
  }
  if (isError) return <p className="text-error">Error: {error?.message}</p>;

  return (
    <div className="w-full max-w-3xl">
      <div className="-mx-2 md:flex">
        {data?.map((metric, idx) => (
          <MetricCard
            key={idx}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            positive={metric.positive}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardMetrics;
