'use client';

import { useEffect, useState } from 'react';
import { useMetrics } from '@/lib/api-hooks';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  LineChartComponent,
  generateNutritionChartData,
} from '@/components/charts/ChartComponents';

// Metric tipini tanımla
interface Metric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  recordedAt: string;
}

export default function MetricsPage() {
  const { data: metrics = [], isLoading } = useMetrics<Metric[]>();
  const [nutritionData, setNutritionData] = useState<any[]>([]);

  // Chart data sadece client tarafında üretiliyor
  useEffect(() => {
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    setNutritionData(generateNutritionChartData(startDate, 30));
  }, []);

  // Tarih formatlamayı sabit locale ile yapıyoruz
  const formatDate = (dateString?: string) =>
    dateString
      ? new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date(dateString))
      : '';

  const getTrendValue = (metric?: Metric) => {
    if (!metric?.value) return 0;
    const num = Number(metric.value);
    return isNaN(num) ? 0 : num - 100;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  // Metricleri unit bazında grupla
  const groupedMetrics = metrics.reduce<Record<string, Metric[]>>((acc, metric) => {
    if (!acc[metric.unit]) acc[metric.unit] = [];
    acc[metric.unit].push(metric);
    return acc;
  }, {});

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
      ) : metrics.length === 0 ? (
        <>
          {/* Charts with sample data */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Monthly Nutrition Trends</h2>
              <LineChartComponent data={nutritionData} className="h-auto" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard title="Average Calories" value="2,150" unit="kcal/day" icon={<TrendingUp className="w-8 h-8 text-green-600" />} />
              <SummaryCard title="Protein Intake" value="70" unit="g/day" icon={<TrendingUp className="w-8 h-8 text-blue-600" />} />
              <SummaryCard title="Fiber Content" value="28" unit="g/day" icon={<TrendingUp className="w-8 h-8 text-purple-600" />} />
              <SummaryCard title="Water Intake" value="2.5" unit="L/day" icon={<Minus className="w-8 h-8 text-gray-600" />} />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.slice(0, 4).map((metric) => (
              <div key={metric.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-600">{metric.id}</h4>
                  {getTrendIcon(getTrendValue(metric?.bmi))}
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-indigo-600">
                    BMI
                    <span className="text-lg font-normal text-gray-600 ml-2">{metric.bmi ?? ''}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{formatDate(metric.recordedAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Metrics Table */}
          {Object.entries(groupedMetrics).map(([unit, metricsByUnit]) => (
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
                  {metricsByUnit.map((metric) => (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.notes}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl font-bold text-indigo-600">
                          {metric.bodyFat ?? '--'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(metric.recordedAt)}</td>
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

// Küçük summary card component
function SummaryCard({ title, value, unit, icon }: { title: string; value: string; unit: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{unit}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
