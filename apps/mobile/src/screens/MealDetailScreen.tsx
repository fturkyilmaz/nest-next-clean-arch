import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useMeal } from '../lib/api-hooks';
import { FireIcon } from 'react-native-heroicons/solid';
import { ClockIcon, ChartBarIcon } from 'react-native-heroicons/outline';

export default function MealDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { data: meal, isLoading } = useMeal(id);

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#a855f7" />
            </View>
        );
    }

    if (!meal) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center px-8">
                <Text className="text-gray-400 text-lg">Meal not found</Text>
            </View>
        );
    }

    const getMealTypeColor = (type: string) => {
        switch (type) {
            case 'BREAKFAST': return 'bg-yellow-500';
            case 'LUNCH': return 'bg-orange-500';
            case 'DINNER': return 'bg-purple-500';
            case 'SNACK': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-8 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-purple-300 text-base font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-3xl font-extrabold mb-2">{meal.name}</Text>
                <View className={`${getMealTypeColor(meal.mealType)} self-start px-4 py-2 rounded-full`}>
                    <Text className="text-white font-bold">{meal.mealType}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Total Nutrition Card */}
                <View className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 mb-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-orange-100 text-sm font-semibold mb-1">
                                Total Calories
                            </Text>
                            <Text className="text-white text-4xl font-extrabold">
                                {meal.totalCalories}
                            </Text>
                            <Text className="text-orange-100 text-sm mt-1">
                                for this meal
                            </Text>
                        </View>
                        <FireIcon size={80} color="rgba(255,255,255,0.2)" />
                    </View>
                </View>

                {/* Macros Summary Card */}
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                    <View className="flex-row items-center mb-4">
                        <ChartBarIcon size={24} color="#a855f7" />
                        <Text className="text-white text-lg font-bold ml-3">Macronutrients</Text>
                    </View>

                    <View className="flex-row justify-between">
                        <View className="flex-1 items-center">
                            <Text className="text-gray-400 text-sm mb-1">Protein</Text>
                            <Text className="text-blue-400 text-2xl font-bold">{meal.totalProtein}g</Text>
                        </View>
                        <View className="flex-1 items-center border-x border-gray-700">
                            <Text className="text-gray-400 text-sm mb-1">Carbs</Text>
                            <Text className="text-green-400 text-2xl font-bold">{meal.totalCarbs}g</Text>
                        </View>
                        <View className="flex-1 items-center">
                            <Text className="text-gray-400 text-sm mb-1">Fat</Text>
                            <Text className="text-yellow-400 text-2xl font-bold">{meal.totalFat}g</Text>
                        </View>
                    </View>
                </View>

                {/* Scheduled Time */}
                {meal.scheduledTime && (
                    <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                        <View className="flex-row items-center">
                            <ClockIcon size={20} color="#a855f7" />
                            <Text className="text-gray-300 ml-3">
                                Scheduled: {new Date(meal.scheduledTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Food Items List */}
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-6 border border-gray-700/50">
                    <Text className="text-white text-lg font-bold mb-4">Food Items</Text>
                    {meal.foods?.length > 0 ? (
                        meal.foods.map((mealFood: any, index: number) => (
                            <View
                                key={index}
                                className="flex-row justify-between items-center py-3 border-b border-gray-700/50"
                            >
                                <View className="flex-1">
                                    <Text className="text-white font-semibold">
                                        {mealFood.food?.name || `Food #${mealFood.foodId.slice(0, 8)}`}
                                    </Text>
                                    <Text className="text-gray-400 text-sm">
                                        Quantity: {mealFood.quantity}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text className="text-gray-400 text-center py-4">No food items</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
