import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function HomeScreen() {
    return (
        <ScrollView className="flex-1 bg-white">
            <View className="p-6">
                <Text className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome Back!
                </Text>
                <Text className="text-gray-600 mb-6">
                    Track your nutrition and achieve your health goals.
                </Text>

                {/* Quick Stats Card */}
                <View className="bg-primary-50 rounded-xl p-4 mb-4">
                    <Text className="text-primary-700 font-semibold mb-2">
                        Today's Progress
                    </Text>
                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-2xl font-bold text-primary-900">1,850</Text>
                            <Text className="text-primary-600 text-sm">Calories</Text>
                        </View>
                        <View>
                            <Text className="text-2xl font-bold text-primary-900">3</Text>
                            <Text className="text-primary-600 text-sm">Meals</Text>
                        </View>
                        <View>
                            <Text className="text-2xl font-bold text-primary-900">8</Text>
                            <Text className="text-primary-600 text-sm">Glasses</Text>
                        </View>
                    </View>
                </View>

                {/* Upcoming Meal Card */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                    <Text className="text-gray-900 font-semibold mb-2">
                        Next Meal: Lunch
                    </Text>
                    <Text className="text-gray-600">
                        Grilled chicken salad with quinoa
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">12:30 PM</Text>
                </View>
            </View>
        </ScrollView>
    );
}
