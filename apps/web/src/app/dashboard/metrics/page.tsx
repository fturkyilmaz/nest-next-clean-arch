'use client';

import { useMetrics } from '@/lib/api-hooks';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function MetricsPage() {
  const { data: metrics, isLoading } = useMetrics();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
      ) : metrics?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No metrics found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics?.map((metric) => (
            <div key={metric.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{metric.name}</h3>
                  <p className="text-sm text-gray-600">{formatDate(metric.recordedAt)}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>

              <div className="mt-4">
                <div className="text-3xl font-bold text-indigo-600">
                  {metric.value}
                  <span className="text-lg font-normal text-gray-600 ml-2">{metric.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
