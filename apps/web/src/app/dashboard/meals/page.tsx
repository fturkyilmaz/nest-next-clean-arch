/**
 * Meals Dashboard Page
 *
 * Display and manage user's meals with real-time updates.
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import {
  useWebSocketInvalidation,
  WebSocketEventType,
} from '@diet/shared';
import { PaginationControls } from '@/components/Pagination';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function MealsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [dietPlanFilter, setDietPlanFilter] = useState<string>('');

  // Fetch meals with pagination
  const { data: mealsData, isLoading } = useQuery({
    queryKey: ['meals', user?.id, page, limit, search, dietPlanFilter],
    queryFn: async () => {
      const res = await apiClient.get('/api/meals', {
        params: {
          page,
          limit,
          search: search || undefined,
          dietPlanId: dietPlanFilter || undefined,
        },
      });
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Fetch diet plans for filter
  const { data: dietPlans } = useQuery({
    queryKey: ['diet-plans', user?.id],
    queryFn: async () => {
      const res = await apiClient.get('/api/diet-plans', { params: { limit: 100 } });
      return res.data.data || [];
    },
    enabled: !!user?.id,
  });

  // Real-time updates
  useWebSocketInvalidation(WebSocketEventType.MEAL_CREATED, ['meals']);
  useWebSocketInvalidation(WebSocketEventType.MEAL_UPDATED, ['meals']);
  useWebSocketInvalidation(WebSocketEventType.MEAL_DELETED, ['meals']);

  // Delete mutation
  const { mutate: deleteMeal } = useMutation({
    mutationFn: (mealId: string) => apiClient.delete(`/api/meals/${mealId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });

  const meals = mealsData?.data || [];
  const total = mealsData?.total || 0;
  const totalPages = mealsData?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meals</h1>
          <p className="text-gray-600 mt-1">Manage your meal plans and nutrition logs</p>
        </div>
        <Link href="/dashboard/meals/new">
          <Button>New Meal</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Search</label>
            <Input
              placeholder="Search meals..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Diet Plan</label>
            <select
              value={dietPlanFilter}
              onChange={(e) => {
                setDietPlanFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Plans</option>
              {dietPlans?.map((plan: any) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Items per page</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Meals List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-8 text-center text-gray-500">Loading meals...</Card>
        ) : meals.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No meals found. Create your first meal to get started.
          </Card>
        ) : (
          meals.map((meal: any) => (
            <Card key={meal.id} className="p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link href={`/dashboard/meals/${meal.id}`}>
                    <h3 className="text-lg font-semibold text-blue-600 hover:underline">
                      {meal.name}
                    </h3>
                  </Link>

                  <p className="text-gray-600 mt-1">{meal.description}</p>

                  <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Calories:</span>
                      <p className="font-semibold">{meal.nutritionInfo?.calories || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Protein:</span>
                      <p className="font-semibold">{meal.nutritionInfo?.protein || 0}g</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Carbs:</span>
                      <p className="font-semibold">{meal.nutritionInfo?.carbs || 0}g</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fats:</span>
                      <p className="font-semibold">{meal.nutritionInfo?.fats || 0}g</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      Scheduled: {new Date(meal.scheduledTime).toLocaleDateString()}
                    </span>
                    <span>
                      Status:{' '}
                      <span
                        className={`font-semibold ${
                          meal.status === 'COMPLETED'
                            ? 'text-green-600'
                            : meal.status === 'LOGGED'
                              ? 'text-blue-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {meal.status}
                      </span>
                    </span>
                    <span>
                      Updated {formatDistanceToNow(new Date(meal.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link href={`/dashboard/meals/${meal.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMeal(meal.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && meals.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
