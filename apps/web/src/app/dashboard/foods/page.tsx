/**
 * Food & Ingredients Dashboard Page
 *
 * Manage food items and ingredients database with real-time search.
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketInvalidation, WebSocketEventType } from '@diet/shared';
import { PaginationControls } from '@/components/Pagination';
import Link from 'next/link';

export default function FoodPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [foodType, setFoodType] = useState<'all' | 'vegetable' | 'fruit' | 'protein' | 'grain'>('all');

  // Fetch foods
  const { data: foodData, isLoading } = useQuery({
    queryKey: ['foods', user?.id, page, limit, search, foodType],
    queryFn: async () => {
      const res = await apiClient.get('/api/foods', {
        params: {
          page,
          limit,
          search: search || undefined,
          type: foodType !== 'all' ? foodType : undefined,
        },
      });
      return res.data;
    },
    enabled: !!user?.id,
  });

  // Real-time updates
  useWebSocketInvalidation(WebSocketEventType.FOOD_CREATED, ['foods']);
  useWebSocketInvalidation(WebSocketEventType.FOOD_UPDATED, ['foods']);
  useWebSocketInvalidation(WebSocketEventType.FOOD_DELETED, ['foods']);

  // Delete mutation
  const { mutate: deleteFood } = useMutation({
    mutationFn: (foodId: string) => apiClient.delete(`/api/foods/${foodId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] });
    },
  });

  const foods = foodData?.data || [];
  const total = foodData?.total || 0;
  const totalPages = foodData?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Food & Ingredients</h1>
          <p className="text-gray-600 mt-1">Manage your food database and nutrition info</p>
        </div>
        <Link href="/dashboard/foods/new">
          <Button>Add Food Item</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Search</label>
            <Input
              placeholder="Search foods..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Category</label>
            <select
              value={foodType}
              onChange={(e) => {
                setFoodType(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All Categories</option>
              <option value="vegetable">Vegetables</option>
              <option value="fruit">Fruits</option>
              <option value="protein">Proteins</option>
              <option value="grain">Grains</option>
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
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Foods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="p-8 text-center text-gray-500 col-span-full">
            Loading foods...
          </Card>
        ) : foods.length === 0 ? (
          <Card className="p-8 text-center text-gray-500 col-span-full">
            No foods found. Create your first food item to get started.
          </Card>
        ) : (
          foods.map((food: any) => (
            <Card key={food.id} className="p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link href={`/dashboard/foods/${food.id}`}>
                    <h3 className="text-lg font-semibold text-blue-600 hover:underline">
                      {food.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {food.category}
                  </p>

                  {/* Nutrition per 100g */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div>
                      <span className="text-gray-600">Cal:</span>
                      <p className="font-semibold">{food.caloriesPer100g || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Protein:</span>
                      <p className="font-semibold">{food.proteinPer100g || 0}g</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Carbs:</span>
                      <p className="font-semibold">{food.carbsPer100g || 0}g</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Fats:</span>
                      <p className="font-semibold">{food.fatsPer100g || 0}g</p>
                    </div>
                  </div>

                  {food.notes && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {food.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Link href={`/dashboard/foods/${food.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteFood(food.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && foods.length > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
