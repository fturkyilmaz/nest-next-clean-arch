'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFood } from '@/lib/api-hooks';
import { ArrowLeft, Flame, TrendingUp } from 'lucide-react';

export default function FoodDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: food, isLoading } = useFood(params.id as string);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!food) {
        return <div className="p-8">Food not found</div>;
    }

    const totalMacros = (food.protein * 4) + (food.carbs * 4) + (food.fat * 9);
    const proteinPercent = ((food.protein * 4) / food.calories * 100).toFixed(0);
    const carbsPercent = ((food.carbs * 4) / food.calories * 100).toFixed(0);
    const fatPercent = ((food.fat * 9) / food.calories * 100).toFixed(0);

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
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{food.name}</h1>
                            {food.category && (
                                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                    {food.category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Calories Card */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 mb-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm font-semibold mb-2">Total Calories</p>
                                <p className="text-5xl font-extrabold">{food.calories}</p>
                                <p className="text-orange-100 mt-2">per {food.servingSize} {food.unit}</p>
                            </div>
                            <Flame className="w-24 h-24 text-white opacity-20" />
                        </div>
                    </div>

                    {/* Macronutrients */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-6 h-6 text-indigo-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Macronutrients</h2>
                        </div>

                        {/* Protein */}
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700 font-semibold">Protein</span>
                                <span className="text-blue-600 font-bold">{food.protein}g ({proteinPercent}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-blue-500 h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min(parseInt(proteinPercent), 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Carbs */}
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700 font-semibold">Carbohydrates</span>
                                <span className="text-green-600 font-bold">{food.carbs}g ({carbsPercent}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-green-500 h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min(parseInt(carbsPercent), 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Fat */}
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-700 font-semibold">Fat</span>
                                <span className="text-yellow-600 font-bold">{food.fat}g ({fatPercent}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-yellow-500 h-3 rounded-full transition-all"
                                    style={{ width: `${Math.min(parseInt(fatPercent), 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Fiber */}
                        {food.fiber && food.fiber > 0 && (
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-semibold">Fiber</span>
                                    <span className="text-green-700 font-bold text-xl">{food.fiber}g</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Serving Size */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <p className="text-gray-600 text-sm mb-2">Serving Size</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {food.servingSize} {food.unit}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
