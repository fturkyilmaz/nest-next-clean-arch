import React from "react";
import { View, Text, ScrollView } from "react-native";
import {
    ScaleIcon,
    FireIcon,
    CalendarDaysIcon,
    ArrowTrendingUpIcon,
    HeartIcon,
    CheckCircleIcon,
    UtensilsIcon,
} from 'react-native-heroicons/outline';

export default function ProgressScreen() {
    return (
        <ScrollView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 border-b border-gray-800">
                <Text className="text-3xl font-bold text-white mb-2">Your Progress</Text>
                <Text className="text-gray-400 text-base">Track your health journey and celebrate achievements.</Text>
            </View>

            <View className="p-6 pb-24">
                {/* Weight Card */}
                <View className="bg-gray-800 rounded-2xl p-6 mb-6 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <ScaleIcon size={20} color="#a1a1aa" className="mr-2" />
                        <Text className="text-xl font-bold text-white">Current Weight</Text>
                    </View>
                    <Text className="text-5xl font-extrabold text-white mb-2">75.5 kg</Text>
                    <View className="flex-row items-center">
                        <ArrowTrendingUpIcon size={18} color="#34d399" className="rotate-180" />
                        <Text className="text-secondary-400 text-base ml-1">2.5 kg loss this month</Text>
                    </View>
                </View>

                {/* Weekly Stats */}
                <View className="bg-primary-800 rounded-2xl p-6 mb-6 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <CalendarDaysIcon size={20} color="#d1d5db" className="mr-2" />
                        <Text className="text-xl font-bold text-white">This Week</Text>
                    </View>
                    <View className="flex-row justify-around">
                        <StatItem value="5" label="Days on Track" icon={<CheckCircleIcon size={24} color="#818cf8" />} />
                        <StatItem value="9,200" label="Avg Calories" icon={<FireIcon size={24} color="#fde047" />} />
                        <StatItem value="21" label="Meals Tracked" icon={<UtensilsIcon size={24} color="#4ade80" />} />
                    </View>
                </View>

                {/* BMI Card */}
                <View className="bg-gray-800 rounded-2xl p-6 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <HeartIcon size={20} color="#a1a1aa" className="mr-2" />
                        <Text className="text-xl font-bold text-white">BMI</Text>
                    </View>
                    <Text className="text-5xl font-extrabold text-white mb-2">23.1</Text>
                    <Text className="text-secondary-400 text-base">Normal weight range</Text>
                </View>
            </View>
        </ScrollView>
    );
}

function StatItem({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
    return (
        <View className="items-center p-2">
            <View className="mb-2">
                {icon}
            </View>
            <Text className="text-3xl font-bold text-white">{value}</Text>
            <Text className="text-gray-400 text-xs uppercase text-center mt-1">{label}</Text>
        </View>
    );
}
