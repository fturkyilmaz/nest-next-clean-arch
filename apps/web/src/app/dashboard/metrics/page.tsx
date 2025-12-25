/**
 * Metrics Dashboard Page
 *
 * Display user metrics, progress charts, and health analytics.
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketEvent, WebSocketEventType } from '@diet/shared';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface MetricPoint {
  date: string;
  value: number;
  unit: string;
}

export default function MetricsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch metrics data
  const { data: metricsData } = useQuery({
    queryKey: ['metrics', user?.id, timeRange],
    queryFn: async () => {
      const res = await apiClient.get('/api/metrics', {
        params: { range: timeRange },
      });
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Fetch summary stats
  const { data: summary } = useQuery({
    queryKey: ['metrics-summary', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/api/metrics/summary');
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Real-time metric updates
  const [latestMetric, setLatestMetric] = useState<any>(null);
  useWebSocketEvent(WebSocketEventType.METRIC_CREATED, (data) => {
    setLatestMetric(data);
  });
  useWebSocketEvent(WebSocketEventType.METRIC_UPDATED, (data) => {
    setLatestMetric(data);
  });

  const chartData = metricsData?.timeline || [];
  const stats = summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Metrics & Progress</h1>
          <p className="text-gray-600 mt-1">Track your health metrics and progress</p>
        </div>
        <Link href="/dashboard/metrics/new">
          <Button>Log Metric</Button>
        </Link>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            onClick={() => setTimeRange(range)}
          >
            {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </Button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Weight Card */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Current Weight</h3>
          <div className="mt-2">
            <div className="text-3xl font-bold">{stats.currentWeight || '-'}</div>
            <div className="text-sm text-gray-500">kg</div>
            {stats.weightChange && (
              <div className={`text-sm font-semibold mt-2 ${
                stats.weightChange < 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)} kg this month
              </div>
            )}
          </div>
        </Card>

        {/* BMI Card */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">BMI</h3>
          <div className="mt-2">
            <div className="text-3xl font-bold">{stats.bmi?.toFixed(1) || '-'}</div>
            <div className="text-sm text-gray-500">
              {stats.bmiCategory || 'N/A'}
            </div>
          </div>
        </Card>

        {/* Average Calories Card */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Daily Avg Calories</h3>
          <div className="mt-2">
            <div className="text-3xl font-bold">{stats.avgCalories || '-'}</div>
            <div className="text-sm text-gray-500">kcal/day</div>
          </div>
        </Card>

        {/* Streak Card */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Logging Streak</h3>
          <div className="mt-2">
            <div className="text-3xl font-bold">{stats.streak || 0}</div>
            <div className="text-sm text-gray-500">consecutive days</div>
            {stats.longestStreak && (
              <div className="text-xs text-gray-400 mt-1">
                Best: {stats.longestStreak} days
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Weight Trend</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                dot={{ r: 4 }}
                name="Weight (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No metric data available for selected range
          </div>
        )}
      </Card>

      {/* Latest Metric */}
      {latestMetric && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <h3 className="font-semibold text-blue-900">Latest Update</h3>
          <p className="text-sm text-blue-700 mt-2">
            {latestMetric.type}: {latestMetric.value} {latestMetric.unit}
          </p>
        </Card>
      )}

      {/* Metrics List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Metrics</h2>
        <Link href="/dashboard/metrics/history">
          <Button variant="outline">View All Metrics</Button>
        </Link>
      </Card>
    </div>
  );
}
