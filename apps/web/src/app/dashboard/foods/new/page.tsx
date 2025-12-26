'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateFood } from '@/lib/api-hooks';
import { Apple, Hash, Beef, Wheat, Droplet, ArrowLeft, Loader2 } from 'lucide-react';

type FoodCategory = 'PROTEIN' | 'CARBS' | 'VEGETABLES' | 'FRUITS' | 'DAIRY' | 'OTHER';

export default function NewFoodPage() {
    const router = useRouter();
    const createFood = useCreateFood();

    const [formData, setFormData] = useState({
        name: '',
        category: 'OTHER' as FoodCategory,
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        servingSize: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createFood.mutateAsync({
                name: formData.name,
                category: formData.category,
                calories: parseFloat(formData.calories),
                protein: parseFloat(formData.protein),
                carbs: parseFloat(formData.carbs),
                fat: parseFloat(formData.fat),
                fiber: formData.fiber ? parseFloat(formData.fiber) : undefined,
                servingSize: formData.servingSize,
            });

            router.push('/dashboard/foods');
        } catch (error) {
            console.error('Failed to create food:', error);
        }
    };

    const categories: { value: FoodCategory; label: string; icon: React.ReactNode }[] = [
        { value: 'PROTEIN', label: 'Protein', icon: <Beef className="w-4 h-4" /> },
        { value: 'CARBS', label: 'Carbs', icon: <Wheat className="w-4 h-4" /> },
        { value: 'VEGETABLES', label: 'Vegetables', icon: <Apple className="w-4 h-4" /> },
        { value: 'FRUITS', label: 'Fruits', icon: <Apple className="w-4 h-4" /> },
        { value: 'DAIRY', label: 'Dairy', icon: <Droplet className="w-4 h-4" /> },
        { value: 'OTHER', label: 'Other', icon: <Hash className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                <h1 className="text-3xl font-bold text-gray-900">Add New Food</h1>
                <p className="text-gray-600 mt-2">Add a new food item to the database</p>
            </div>

            {/* Form Card */}
            <div className="max-w-3xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name & Category Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Apple className="w-4 h-4" />
                                    Food Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Chicken Breast"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Hash className="w-4 h-4" />
                                    Category
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as FoodCategory })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Nutrition Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Hash className="w-5 h-5" />
                                Nutrition Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Calories */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Calories (per serving)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.1"
                                        min="0"
                                        value={formData.calories}
                                        onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Macros Grid */}
                                <div>
                                    <label className="text-sm font-medium text-blue-700 mb-2 block">
                                        Protein (g)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.1"
                                        min="0"
                                        value={formData.protein}
                                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                                        className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-green-700 mb-2 block">
                                        Carbs (g)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.1"
                                        min="0"
                                        value={formData.carbs}
                                        onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                                        className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-yellow-700 mb-2 block">
                                        Fat (g)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.1"
                                        min="0"
                                        value={formData.fat}
                                        onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                                        className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Fiber (g) - Optional
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.fiber}
                                        onChange={(e) => setFormData({ ...formData, fiber: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Serving Size */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Serving Size
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.servingSize}
                                onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="e.g., 100g, 1 cup, 1 piece"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createFood.isPending}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {createFood.isPending && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Add Food
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
