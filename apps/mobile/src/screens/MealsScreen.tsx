import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

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
            className={`mb-3 p-4 rounded-xl flex-row items-center ${item.completed ? "bg-accent-50" : "bg-gray-50"
                }`}
        >
            <View
                className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.completed ? "bg-accent-500" : "bg-gray-200"
                    }`}
            >
                <Text className={`text-lg ${item.completed ? "text-white" : "text-gray-500"}`}>
                    {item.completed ? "✓" : item.name.charAt(0)}
                </Text>
            </View>
            <View className="flex-1">
                <Text className={`font-semibold ${item.completed ? "text-accent-700" : "text-gray-900"}`}>
                    {item.name}
                </Text>
                <Text className="text-gray-500 text-sm">{item.time}</Text>
            </View>
            <Text className="text-gray-600 font-medium">{item.calories} kcal</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <View className="px-6 pt-6 pb-4">
                <Text className="text-2xl font-bold text-gray-900">Today's Meals</Text>
                <Text className="text-gray-600 mt-1">
                    Track your daily nutrition
                </Text>
            </View>
            <FlatList
                data={TODAY_MEALS}
                keyExtractor={(item) => item.id}
                renderItem={renderMealItem}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
