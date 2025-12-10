import React from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import {
    CheckCircleIcon,
    FireIcon,
    ClockIcon,
    DocumentTextIcon
} from 'react-native-heroicons/outline';

interface Meal {
    id: string;
    name: string;
    time: string;
    calories: number;
    completed: boolean;
}

const TODAY_MEALS: Meal[] = [
    { id: "1", name: "Breakfast", time: "8:00 AM", calories: 450, completed: true },
    { id: "2", name: "Morning Snack", time: "10:30 AM", calories: 150, completed: true },
    { id: "3", name: "Lunch", time: "12:30 PM", calories: 650, completed: false },
    { id: "4", name: "Afternoon Snack", time: "3:30 PM", calories: 200, completed: false },
    { id: "5", name: "Dinner", time: "7:00 PM", calories: 550, completed: false },
];

export default function MealsScreen() {
    const renderMealItem = ({ item }: { item: Meal }) => (
        <TouchableOpacity
            className={`mb-4 p-5 rounded-2xl flex-row items-center shadow-md active:bg-gray-700 ${item.completed ? "bg-gray-700" : "bg-gray-800"}`}
        >
            <View
                className={`w-14 h-14 rounded-full items-center justify-center mr-4 shadow-sm ${item.completed ? "bg-secondary-500" : "bg-gray-600"}`}
            >
                {item.completed ? (
                    <CheckCircleIcon size={24} color="#ffffff" />
                ) : (
                    <DocumentTextIcon size={24} color="#ffffff" />
                )}
            </View>
            <View className="flex-1">
                <Text className={`font-semibold text-lg ${item.completed ? "text-white" : "text-white"}`}>
                    {item.name}
                </Text>
                <View className="flex-row items-center mt-1">
                    <ClockIcon size={14} color="#a1a1aa" className="mr-1" />
                    <Text className="text-gray-400 text-sm">{item.time}</Text>
                </View>
            </View>
            <View className="flex-row items-center">
                <FireIcon size={16} color="#fde047" className="mr-1" />
                <Text className="text-white font-bold text-base">{item.calories} kcal</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 border-b border-gray-800">
                <Text className="text-3xl font-bold text-white mb-2">Today's Meals</Text>
                <Text className="text-gray-400 text-base">Track your daily nutrition and meal progress.</Text>
            </View>

            <FlatList
                data={TODAY_MEALS}
                keyExtractor={(item) => item.id}
                renderItem={renderMealItem}
                contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 24 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
