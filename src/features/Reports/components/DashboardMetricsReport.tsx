// // src/features/Reports/components/DashboardMetricsReport.tsx
// 'use client';

// import React, { useState, useCallback } from 'react';
// import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
// import { DashboardMetricsBarChart } from '../charts/DashboardMetricsBarChart';
// import { DashboardMetricsPieChart } from '../charts/DashboardMetricsPieChart';
// import { ChartContainer } from './ChartContainer';
// import MetricCard from '../MetricCard';
// import { DashboardMetricsResponse } from '../types/dashboardMetrics';

// export const DashboardMetricsReport: React.FC = () => {
//   const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
//   const { data, isLoading, error } = useDashboardMetrics();

//   const handleChartTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
//     setChartType(e.target.value as 'bar' | 'pie');
//   }, []);

//   const controls = (
//     <select
//       value={chartType}
//       onChange={handleChartTypeChange}
//       className="select select-bordered text-base-content"
//     >
//       <option value="bar">Bar Chart</option>
//       <option value="pie">Pie Chart</option>
//     </select>
//   );

//   const summary = data?.metrics && (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//       {data.metrics.map((metric, idx) => (
//         <MetricCard
//           key={idx}
//           title={metric.title}
//           value={metric.value}
//           change={metric.change}
//           positive={metric.positive}
//         />
//       ))}
//     </div>
//   );

//   const chartComponent = data?.metrics && (
//     chartType === 'bar' ? (
//       <DashboardMetricsBarChart data={data} />
//     ) : (
//       <DashboardMetricsPieChart data={data} />
//     )
//   );

//   return (
//     <ChartContainer
//       title="Dashboard Metrics (Weekly)"
//       isLoading={isLoading}
//       error={error}
//       controls={controls}
//       summary={summary}
//     >
//       {chartComponent}
//     </ChartContainer>
//   );
// };
// src/features/Reports/components/DashboardMetricsReport.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { DashboardMetricsBarChart } from '../charts/DashboardMetricsBarChart';
import { DashboardMetricsPieChart } from '../charts/DashboardMetricsPieChart';
import { ChartContainer } from './ChartContainer';
import MetricCard from '../MetricCard';

export const DashboardMetricsReport: React.FC = () => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const { data, isLoading, error } = useDashboardMetrics();

  const handleChartTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setChartType(e.target.value as 'bar' | 'pie');
    },
    [],
  );

  const controls = (
    <select
      value={chartType}
      onChange={handleChartTypeChange}
      className="select select-bordered text-base-content"
    >
      <option value="bar">Bar Chart</option>
      <option value="pie">Pie Chart</option>
    </select>
  );

  const summary = data?.metrics && (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {data.metrics.map((metric, idx) => (
        <MetricCard
          key={idx}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          positive={metric.positive}
        />
      ))}
    </div>
  );

  const chartComponent =
    data?.metrics &&
    (chartType === 'bar' ? (
      <DashboardMetricsBarChart data={data} />
    ) : (
      <DashboardMetricsPieChart data={data} />
    ));

  return (
    <ChartContainer
      title="Dashboard Metrics (Weekly)"
      isLoading={isLoading}
      error={error}
      controls={controls}
      summary={summary}
    >
      {chartComponent}
    </ChartContainer>
  );
};
