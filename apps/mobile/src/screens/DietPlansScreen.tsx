import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";

interface DietPlan {
    id: string;
    name: string;
    status: "active" | "completed" | "upcoming";
    startDate: string;
    calories: number;
}

const SAMPLE_PLANS: DietPlan[] = [
    {
        id: "1",
        name: "Weight Loss Program",
        status: "active",
        startDate: "Dec 1, 2025",
        calories: 1800,
    },
    {
        id: "2",
        name: "Muscle Building Phase",
        status: "upcoming",
        startDate: "Jan 1, 2026",
        calories: 2500,
    },
    {
        id: "3",
        name: "Detox Week",
        status: "completed",
        startDate: "Nov 15, 2025",
        calories: 1500,
    },
];

export default function DietPlansScreen() {
    const renderPlanItem = ({ item }: { item: DietPlan }) => (
        <TouchableOpacity
            className={`mb-3 p-4 rounded-xl ${item.status === "active"
                    ? "bg-accent-50 border border-accent-200"
                    : "bg-gray-50"
                }`}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-gray-900 flex-1">
                    {item.name}
                </Text>
                <View
                    className={`px-2 py-1 rounded-full ${item.status === "active"
                            ? "bg-accent-500"
                            : item.status === "upcoming"
                                ? "bg-blue-500"
                                : "bg-gray-400"
                        }`}
                >
                    <Text className="text-white text-xs font-medium capitalize">
                        {item.status}
                    </Text>
                </View>
            </View>
            <Text className="text-gray-600 text-sm">
                Started: {item.startDate}
            </Text>
            <Text className="text-gray-600 text-sm">
                Daily calories: {item.calories} kcal
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <View className="px-6 pt-6 pb-4">
                <Text className="text-2xl font-bold text-gray-900">Diet Plans</Text>
                <Text className="text-gray-600 mt-1">
                    Manage your nutrition programs
                </Text>
            </View>
            <FlatList
                data={SAMPLE_PLANS}
                keyExtractor={(item) => item.id}
                renderItem={renderPlanItem}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
