'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMeal } from '@/lib/api-hooks';
import { ArrowLeft, Flame, Clock, UtensilsCrossed } from 'lucide-react';

export default function MealDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: meal, isLoading } = useMeal(params.id as string);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!meal) {
        return <div className="p-8">Meal not found</div>;
    }

    const getMealTypeColor = (type: string) => {
        const colors = {
            BREAKFAST: 'bg-yellow-500',
            LUNCH: 'bg-orange-500',
            DINNER: 'bg-purple-500',
            SNACK: 'bg-green-500',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">{meal.name}</h1>
                        <div className={`inline-block px-4 py-2 ${getMealTypeColor(meal.mealType)} text-white rounded-full font-semibold`}>
                            {meal.mealType}
                        </div>
                    </div>

                    {/* Total Nutrition */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 mb-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-semibold mb-2">Total Calories</p>
                                <p className="text-5xl font-extrabold">{meal.totalCalories}</p>
                                <p className="text-orange-100 mt-2">for this meal</p>
                            </div>
                            <Flame className="w-24 h-24 text-white opacity-20" />
                        </div>
                    </div>

                    {/* Macros Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-200">
                            <p className="text-blue-600 text-sm font-semibold mb-2">Protein</p>
                            <p className="text-3xl font-bold text-blue-700">{meal.totalProtein}g</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
                            <p className="text-green-600 text-sm font-semibold mb-2">Carbs</p>
                            <p className="text-3xl font-bold text-green-700">{meal.totalCarbs}g</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-6 text-center border border-yellow-200">
                            <p className="text-yellow-600 text-sm font-semibold mb-2">Fat</p>
                            <p className="text-3xl font-bold text-yellow-700">{meal.totalFat}g</p>
                        </div>
                    </div>

                    {/* Scheduled Time */}
                    {meal.scheduledTime && (
                        <div className="bg-indigo-50 rounded-lg p-4 mb-8 border border-indigo-200 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            <div>
                                <p className="text-sm text-indigo-600 font-semibold">Scheduled Time</p>
                                <p className="text-indigo-900 font-medium">
                                    {new Date(meal.scheduledTime).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Food Items */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <UtensilsCrossed className="w-6 h-6 text-gray-700" />
                            <h2 className="text-2xl font-bold text-gray-900">Food Items</h2>
                        </div>
                        {meal.foods && meal.foods.length > 0 ? (
                            <div className="space-y-3">
                                {meal.foods.map((mealFood, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">
                                                {mealFood.food?.name || `Food #${mealFood.foodId.slice(0, 8)}`}
                                            </p>
                                            <p className="text-sm text-gray-600">Quantity: {mealFood.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No food items in this meal</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
