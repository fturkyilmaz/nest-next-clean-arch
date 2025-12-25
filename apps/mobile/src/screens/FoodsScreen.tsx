import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useFoods } from '../lib/api-hooks';
import { MagnifyingGlassIcon, PlusIcon } from 'react-native-heroicons/outline';
import { FireIcon } from 'react-native-heroicons/solid';

export default function FoodsScreen({ navigation }: any) {
    const { data: foods, isLoading, refetch, isRefetching } = useFoods();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const categories = ['ALL', 'Protein', 'Carbs', 'Vegetables', 'Fruits', 'Dairy', 'Other'];

    const filteredFoods = foods?.filter(food => {
        const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || food.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const renderFood = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('FoodDetail', { id: item.id })}
            className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50"
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">{item.name}</Text>
                    {item.category && (
                        <Text className="text-purple-400 text-sm font-semibold">
                            {item.category}
                        </Text>
                    )}
                </View>
                <View className="bg-orange-500/20 px-3 py-1 rounded-full flex-row items-center">
                    <FireIcon size={16} color="#f97316" />
                    <Text className="text-orange-400 text-sm font-bold ml-1">
                        {item.calories} cal
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between pt-3 border-t border-gray-700/50">
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Protein</Text>
                    <Text className="text-white font-semibold">{item.protein}g</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Carbs</Text>
                    <Text className="text-white font-semibold">{item.carbs}g</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Fat</Text>
                    <Text className="text-white font-semibold">{item.fat}g</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs text-right">Serving</Text>
                    <Text className="text-white font-semibold text-right">
                        {item.servingSize} {item.unit}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-white text-3xl font-extrabold">Food Database</Text>
                        <Text className="text-gray-300 text-sm mt-1">
                            {filteredFoods?.length || 0} foods
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateFood')}
                        className="bg-purple-600 rounded-full p-3 shadow-lg"
                    >
                        <PlusIcon size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-gray-800/60 rounded-xl px-4 py-3 flex-row items-center border border-gray-700">
                    <MagnifyingGlassIcon size={20} color="#9ca3af" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search foods..."
                        placeholderTextColor="#6b7280"
                        className="flex-1 text-white ml-3"
                    />
                </View>

                {/* Category Filters */}
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setCategoryFilter(item)}
                            className={`px-4 py-2 rounded-xl mr-2 mt-3 ${categoryFilter === item
                                    ? 'bg-purple-600'
                                    : 'bg-gray-700/50 border border-gray-600'
                                }`}
                        >
                            <Text className={`font-semibold ${categoryFilter === item ? 'text-white' : 'text-gray-400'
                                }`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Foods List */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text className="text-gray-400 mt-4">Loading foods...</Text>
                </View>
            ) : filteredFoods?.length === 0 ? (
                <View className="flex-1 justify-center items-center px-8">
                    <FireIcon size={64} color="#4b5563" />
                    <Text className="text-gray-400 text-lg mt-4 text-center">
                        No foods found
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateFood')}
                        className="bg-purple-600 rounded-xl px-6 py-3 mt-6"
                    >
                        <Text className="text-white font-bold">Add Food</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredFoods}
                    renderItem={renderFood}
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
