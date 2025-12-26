'use client';

import { useState } from 'react';
import { useMeals } from '@/lib/api-hooks';
import Link from 'next/link';
import { Plus, Search, UtensilsCrossed } from 'lucide-react';

type MealTypeFilter = 'ALL' | 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export default function MealsPage() {
  const { data: meals, isLoading } = useMeals();
  const [filter, setFilter] = useState<MealTypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeals = meals?.filter(meal => {
    const matchesFilter = filter === 'ALL' || meal.mealType === filter;
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getMealTypeColor = (type: string) => {
    const colors = {
      BREAKFAST: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      LUNCH: 'bg-orange-100 text-orange-700 border-orange-200',
      DINNER: 'bg-purple-100 text-purple-700 border-purple-200',
      SNACK: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Meals</h1>
          <Link
            href="/dashboard/meals/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Meal
          </Link>
        </div>
        <p className="text-gray-600">Manage meal plans and nutrition</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {(['ALL', 'BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as MealTypeFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredMeals?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <UtensilsCrossed className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No meals found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protein</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carbs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foods</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMeals?.map((meal) => (
                <tr key={meal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{meal.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getMealTypeColor(meal.mealType)}`}>
                      {meal.mealType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meal.totalCalories}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{meal.totalProtein}g</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{meal.totalCarbs}g</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{meal.totalFat}g</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meal.foods?.length || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/dashboard/meals/${meal.id}`} className="text-indigo-600 hover:text-indigo-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
