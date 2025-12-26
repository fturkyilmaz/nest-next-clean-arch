import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useFood } from '../lib/api-hooks';
import { FireIcon } from 'react-native-heroicons/solid';
import { ChartBarIcon } from 'react-native-heroicons/outline';

export default function FoodDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { data: food, isLoading } = useFood(id);

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#a855f7" />
            </View>
        );
    }

    if (!food) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center px-8">
                <Text className="text-gray-400 text-lg">Food not found</Text>
            </View>
        );
    }

    const totalMacros = food.protein + food.carbs + food.fat;
    const proteinPercent = ((food.protein * 4) / food.calories * 100).toFixed(0);
    const carbsPercent = ((food.carbs * 4) / food.calories * 100).toFixed(0);
    const fatPercent = ((food.fat * 9) / food.calories * 100).toFixed(0);

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-8 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-purple-300 text-base font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-3xl font-extrabold mb-2">{food.name}</Text>
                {food.category && (
                    <View className="bg-purple-600/30 self-start px-4 py-2 rounded-full">
                        <Text className="text-purple-200 font-semibold">{food.category}</Text>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Calories Card */}
                <View className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 mb-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-orange-100 text-sm font-semibold mb-1">
                                Total Calories
                            </Text>
                            <Text className="text-white text-4xl font-extrabold">
                                {food.calories}
                            </Text>
                            <Text className="text-orange-100 text-sm mt-1">
                                per {food.servingSize} {food.unit}
                            </Text>
                        </View>
                        <FireIcon size={80} color="rgba(255,255,255,0.2)" />
                    </View>
                </View>

                {/* Macros Card */}
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                    <View className="flex-row items-center mb-4">
                        <ChartBarIcon size={24} color="#a855f7" />
                        <Text className="text-white text-lg font-bold ml-3">Macronutrients</Text>
                    </View>

                    {/* Protein */}
                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-300 font-semibold">Protein</Text>
                            <Text className="text-white font-bold">{food.protein}g ({proteinPercent}%)</Text>
                        </View>
                        <View className="bg-gray-700 rounded-full h-2">
                            <View
                                className="bg-blue-500 rounded-full h-2"
                                style={{ width: `${Math.min(parseInt(proteinPercent), 100)}%` }}
                            />
                        </View>
                    </View>

                    {/* Carbs */}
                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-300 font-semibold">Carbohydrates</Text>
                            <Text className="text-white font-bold">{food.carbs}g ({carbsPercent}%)</Text>
                        </View>
                        <View className="bg-gray-700 rounded-full h-2">
                            <View
                                className="bg-green-500 rounded-full h-2"
                                style={{ width: `${Math.min(parseInt(carbsPercent), 100)}%` }}
                            />
                        </View>
                    </View>

                    {/* Fat */}
                    <View className="mb-4">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-gray-300 font-semibold">Fat</Text>
                            <Text className="text-white font-bold">{food.fat}g ({fatPercent}%)</Text>
                        </View>
                        <View className="bg-gray-700 rounded-full h-2">
                            <View
                                className="bg-yellow-500 rounded-full h-2"
                                style={{ width: `${Math.min(parseInt(fatPercent), 100)}%` }}
                            />
                        </View>
                    </View>

                    {/* Fiber */}
                    {food.fiber && (
                        <View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-300 font-semibold">Fiber</Text>
                                <Text className="text-white font-bold">{food.fiber}g</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Serving Size Card */}
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-6 border border-gray-700/50">
                    <Text className="text-gray-400 text-sm mb-2">Serving Size</Text>
                    <Text className="text-white text-2xl font-bold">
                        {food.servingSize} {food.unit}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
