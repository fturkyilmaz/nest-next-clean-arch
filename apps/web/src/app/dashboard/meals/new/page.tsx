'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateMeal, useFoods } from '@/lib/api-hooks';
import { Utensils, Clock, Plus, X, ArrowLeft, Loader2, Search } from 'lucide-react';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

interface MealFoodItem {
    foodId: string;
    foodName: string;
    quantity: number;
}

export default function NewMealPage() {
    const router = useRouter();
    const createMeal = useCreateMeal();
    const { data: foods, isLoading: foodsLoading } = useFoods();

    const [formData, setFormData] = useState({
        name: '',
        mealType: 'BREAKFAST' as MealType,
        scheduledFor: '',
    });

    const [mealFoods, setMealFoods] = useState<MealFoodItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFoodId, setSelectedFoodId] = useState('');

    const handleAddFood = () => {
        if (!selectedFoodId) return;

        const food = foods?.find(f => f.id === selectedFoodId);
        if (!food) return;

        // Check if already added
        if (mealFoods.some(mf => mf.foodId === selectedFoodId)) {
            alert('This food is already added to the meal');
            return;
        }

        setMealFoods([
            ...mealFoods,
            { foodId: selectedFoodId, foodName: food.name, quantity: 1 }
        ]);
        setSelectedFoodId('');
        setSearchQuery('');
    };

    const handleRemoveFood = (foodId: string) => {
        setMealFoods(mealFoods.filter(mf => mf.foodId !== foodId));
    };

    const handleQuantityChange = (foodId: string, quantity: number) => {
        setMealFoods(mealFoods.map(mf =>
            mf.foodId === foodId ? { ...mf, quantity } : mf
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mealFoods.length === 0) {
            alert('Please add at least one food item to the meal');
            return;
        }

        try {
            await createMeal.mutateAsync({
                name: formData.name,
                mealType: formData.mealType,
                scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : undefined,
                foods: mealFoods.map(mf => ({
                    foodId: mf.foodId,
                    quantity: mf.quantity,
                })),
            });

            router.push('/dashboard/meals');
        } catch (error) {
            console.error('Failed to create meal:', error);
        }
    };

    const mealTypes: { value: MealType; label: string; color: string }[] = [
        { value: 'BREAKFAST', label: 'Breakfast', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'LUNCH', label: 'Lunch', color: 'bg-orange-100 text-orange-800' },
        { value: 'DINNER', label: 'Dinner', color: 'bg-blue-100 text-blue-800' },
        { value: 'SNACK', label: 'Snack', color: 'bg-green-100 text-green-800' },
    ];

    const filteredFoods = foods?.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                <h1 className="text-3xl font-bold text-gray-900">Create Meal</h1>
                <p className="text-gray-600 mt-2">Plan a new meal with multiple food items</p>
            </div>

            {/* Form Card */}
            <div className="max-w-4xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Utensils className="w-4 h-4" />
                                    Meal Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Post-Workout Meal"
                                />
                            </div>

                            {/* Meal Type */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Meal Type
                                </label>
                                <select
                                    required
                                    value={formData.mealType}
                                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value as MealType })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                >
                                    {mealTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Scheduled Time (Optional) */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Clock className="w-4 h-4" />
                                Scheduled Time (Optional)
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledFor}
                                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Food Items Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Food Items
                            </h3>

                            {/* Add Food */}
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search foods..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <select
                                        value={selectedFoodId}
                                        onChange={(e) => setSelectedFoodId(e.target.value)}
                                        disabled={foodsLoading}
                                        className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Select a food</option>
                                        {filteredFoods?.map((food) => (
                                            <option key={food.id} value={food.id}>
                                                {food.name} ({food.calories} cal)
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleAddFood}
                                        disabled={!selectedFoodId}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Food Items List */}
                            {mealFoods.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">No food items added yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {mealFoods.map((item) => (
                                        <div
                                            key={item.foodId}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{item.foodName}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600">Quantity:</label>
                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    step="0.1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item.foodId, parseFloat(e.target.value))}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFood(item.foodId)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                disabled={createMeal.isPending || mealFoods.length === 0}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {createMeal.isPending && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Create Meal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
