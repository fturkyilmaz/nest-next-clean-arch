import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useMeals } from '../lib/api-hooks';
import { FireIcon, PlusIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon } from 'react-native-heroicons/solid';

type MealTypeFilter = 'ALL' | 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export default function MealsScreen({ navigation }: any) {
    const { data: meals, isLoading, refetch, isRefetching } = useMeals();
    const [filter, setFilter] = useState<MealTypeFilter>('ALL');

    const filteredMeals = meals?.filter(meal =>
        filter === 'ALL' ? true : meal.mealType === filter
    );

    const getMealTypeColor = (type: string) => {
        switch (type) {
            case 'BREAKFAST': return 'bg-yellow-500';
            case 'LUNCH': return 'bg-orange-500';
            case 'DINNER': return 'bg-purple-500';
            case 'SNACK': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const renderMeal = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('MealDetail', { id: item.id })}
            className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50"
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">{item.name}</Text>
                    <View className={`${getMealTypeColor(item.mealType)} self-start px-3 py-1 rounded-full mt-1`}>
                        <Text className="text-white text-xs font-bold">{item.mealType}</Text>
                    </View>
                </View>
                <View className="bg-orange-500/20 px-3 py-2 rounded-full flex-row items-center">
                    <FireIcon size={16} color="#f97316" />
                    <Text className="text-orange-400 text-sm font-bold ml-1">
                        {item.totalCalories} cal
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between pt-3 border-t border-gray-700/50">
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Protein</Text>
                    <Text className="text-blue-400 font-semibold">{item.totalProtein}g</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Carbs</Text>
                    <Text className="text-green-400 font-semibold">{item.totalCarbs}g</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Fat</Text>
                    <Text className="text-yellow-400 font-semibold">{item.totalFat}g</Text>
                </View>
                <View className="flex-1 items-end">
                    <Text className="text-gray-500 text-xs">Foods</Text>
                    <Text className="text-white font-semibold">{item.foods?.length || 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const FilterButton = ({ label, value }: { label: string; value: MealTypeFilter }) => (
        <TouchableOpacity
            onPress={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl mr-2 ${filter === value
                    ? 'bg-purple-600'
                    : 'bg-gray-700/50 border border-gray-600'
                }`}
        >
            <Text className={`font-semibold ${filter === value ? 'text-white' : 'text-gray-400'
                }`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-white text-3xl font-extrabold">Meals</Text>
                        <Text className="text-gray-300 text-sm mt-1">
                            {filteredMeals?.length || 0} meals
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateMeal', { dietPlanId: 'default' })}
                        className="bg-purple-600 rounded-full p-3 shadow-lg"
                    >
                        <PlusIcon size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View className="flex-row mt-2">
                    <FilterButton label="All" value="ALL" />
                    <FilterButton label="Breakfast" value="BREAKFAST" />
                    <FilterButton label="Lunch" value="LUNCH" />
                    <FilterButton label="Dinner" value="DINNER" />
                    <FilterButton label="Snack" value="SNACK" />
                </View>
            </View>

            {/* Meals List */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text className="text-gray-400 mt-4">Loading meals...</Text>
                </View>
            ) : filteredMeals?.length === 0 ? (
                <View className="flex-1 justify-center items-center px-8">
                    <FireIcon size={64} color="#4b5563" />
                    <Text className="text-gray-400 text-lg mt-4 text-center">
                        No {filter === 'ALL' ? '' : filter.toLowerCase()} meals found
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateMeal', { dietPlanId: 'default' })}
                        className="bg-purple-600 rounded-xl px-6 py-3 mt-6"
                    >
                        <Text className="text-white font-bold">Create Meal</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredMeals}
                    renderItem={renderMeal}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor="#a855f7"
                        />
                    }
                />
            )}
        </View>
    );
}
