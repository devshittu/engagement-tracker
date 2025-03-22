'use client';

import React, { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ChartShimmerLoader from '../ChartShimmerLoader';

type ChartContainerProps = {
  title: string;
  isLoading: boolean;
  error: Error | null;
  children: React.ReactNode;
  controls?: React.ReactNode;
  summary?: React.ReactNode;
};

const ChartFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="p-4 text-center text-red-500">
    Failed to render chart: {error.message}
  </div>
);

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  isLoading,
  error,
  children,
  controls,
  summary,
}) => {
  const content = useMemo(
    () =>
      isLoading ? (
        <ChartShimmerLoader />
      ) : error ? (
        <p className="text-center text-error">Error: {error.message}</p>
      ) : (
        children
      ),
    [isLoading, error, children],
  );

  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">{title}</h2>
        {controls && <div className="flex space-x-4">{controls}</div>}
      </div>
      {summary && <div className="mb-4">{summary}</div>}
      <ErrorBoundary FallbackComponent={ChartFallback}>
        <Suspense fallback={<ChartShimmerLoader />}>{content}</Suspense>
      </ErrorBoundary>
    </div>
  );
};
