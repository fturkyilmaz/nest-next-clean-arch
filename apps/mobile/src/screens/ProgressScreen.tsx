import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function ProgressScreen() {
    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                    Your Progress
                </Text>
                <Text className="text-gray-600 mb-6">
                    Track your health journey
                </Text>

                {/* Weight Card */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                    <Text className="text-gray-600 text-sm mb-1">Current Weight</Text>
                    <Text className="text-3xl font-bold text-gray-900">75.5 kg</Text>
                    <Text className="text-accent-600 text-sm mt-1">↓ 2.5 kg this month</Text>
                </View>

                {/* Weekly Stats */}
                <View className="bg-primary-50 rounded-xl p-4 mb-4">
                    <Text className="text-primary-700 font-semibold mb-3">
                        This Week
                    </Text>
                    <View className="flex-row justify-between">
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-primary-900">5</Text>
                            <Text className="text-primary-600 text-xs">Days on Track</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-primary-900">9,200</Text>
                            <Text className="text-primary-600 text-xs">Avg Calories</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-primary-900">21</Text>
                            <Text className="text-primary-600 text-xs">Meals Tracked</Text>
                        </View>
                    </View>
                </View>

                {/* BMI Card */}
                <View className="bg-accent-50 rounded-xl p-4">
                    <Text className="text-accent-700 font-semibold mb-2">BMI</Text>
                    <Text className="text-3xl font-bold text-accent-900">23.1</Text>
                    <Text className="text-accent-600 text-sm mt-1">Normal weight range</Text>
                </View>
            </View>
        </ScrollView>
    );
}
