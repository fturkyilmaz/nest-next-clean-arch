'use client';

import { useMetrics } from '@/lib/api-hooks';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  LineChartComponent,
  generateNutritionChartData,
} from '@/components/charts/ChartComponents';

export default function MetricsPage() {
  const { data: metrics, isLoading } = useMetrics();

  // Sample data for visualization
  const nutritionData = generateNutritionChartData(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 30);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  // Group metrics by unit
  const groupedMetrics = metrics?.reduce(
    (acc, metric) => {
      if (!acc[metric.unit]) acc[metric.unit] = [];
      acc[metric.unit].push(metric);
      return acc;
    },
    {} as Record<string, typeof metrics>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Metrics Dashboard</h1>
        <p className="text-gray-600">View and track performance metrics</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : !metrics || metrics.length === 0 ? (
        <>
          {/* Charts with sample data */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Monthly Nutrition Trends</h2>
              <LineChartComponent
                data={nutritionData}
                className="h-auto"
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Average Calories</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">2,150</p>
                    <p className="text-xs text-gray-500 mt-1">kcal/day</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Protein Intake</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">70g</p>
                    <p className="text-xs text-gray-500 mt-1">per day</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Fiber Content</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">28g</p>
                    <p className="text-xs text-gray-500 mt-1">per day</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Water Intake</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">2.5L</p>
                    <p className="text-xs text-gray-500 mt-1">per day</p>
                  </div>
                  <Minus className="w-8 h-8 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics?.slice(0, 4).map((metric) => (
              <div key={metric.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                  {getTrendIcon(parseInt(metric.value.toString()) - 100)}
                </div>

                <div className="mt-4">
                  <div className="text-3xl font-bold text-indigo-600">
                    {metric.value}
                    <span className="text-lg font-normal text-gray-600 ml-2">{metric.unit}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(metric.recordedAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Metrics Table */}
          {Object.entries(groupedMetrics || {}).map(([unit, metricsByUnit]) => (
            <div key={unit} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Metrics ({unit})</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metricsByUnit?.map((metric) => (
                    <tr key={metric?.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl font-bold text-indigo-600">
                          {metric?.value}{metric?.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(metric?.recordedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
