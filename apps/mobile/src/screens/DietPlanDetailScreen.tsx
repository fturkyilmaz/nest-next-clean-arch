import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDietPlan, useActivateDietPlan, useCompleteDietPlan } from '../lib/api-hooks';
import {
    ChevronLeftIcon,
    PencilSquareIcon,
    PlayIcon,
    CheckCircleIcon,
    CalendarDaysIcon,
    FireIcon,
    CubeTransparentIcon,
    BeakerIcon,
    ScaleIcon,
} from 'react-native-heroicons/outline';

export default function DietPlanDetailScreen({ route, navigation }: any) {
    const { planId } = route.params;
    const { data: plan, isLoading, error } = useDietPlan(planId);
    const activateMutation = useActivateDietPlan();
    const completeMutation = useCompleteDietPlan();

    const statusColors: Record<string, { bar: string; badgeBg: string; badgeText: string }> = {
        DRAFT: { bar: 'bg-amber-500', badgeBg: 'bg-amber-500/20', badgeText: 'text-amber-400' },
        ACTIVE: { bar: 'bg-emerald-500', badgeBg: 'bg-emerald-500/20', badgeText: 'text-emerald-400' },
        COMPLETED: { bar: 'bg-blue-500', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-400' },
        CANCELLED: { bar: 'bg-red-500', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400' },
    };
    const colors = statusColors[plan?.status || 'DRAFT'] || statusColors.DRAFT;

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (error || !plan) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center p-6">
                <Text className="text-red-400 text-lg mb-4">Error loading diet plan. Please try again.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-primary-700 px-6 py-3 rounded-full shadow-md active:bg-primary-600">
                    <Text className="text-white font-semibold text-base">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 flex-row items-center border-b border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeftIcon size={24} color="#d1d5db" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white ml-3">Diet Plan Details</Text>
            </View>

            <View className="p-6 pb-24">
                {/* Plan Summary */}
                <View className="bg-gray-800 rounded-3xl p-6 mb-8 shadow-xl">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <Text className="text-3xl font-bold text-white mb-1 leading-tight">{plan.name}</Text>
                            <Text className="text-gray-400 text-base">{plan.description || 'No description provided.'}</Text>
                        </View>
                        <View className={`px-4 py-2 rounded-full ${colors.badgeBg}`}>
                            <Text className={`font-bold text-sm ${colors.badgeText}`}>{plan.status}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-4 mb-8">
                    {plan.status === 'DRAFT' && (
                        <TouchableOpacity
                            className="flex-1 bg-secondary-600 py-4 rounded-xl items-center shadow-md active:bg-secondary-500"
                            onPress={() => activateMutation.mutate(plan.id)}
                            disabled={activateMutation.isPending}
                        >
                            <PlayIcon size={24} color="#ffffff" />
                            <Text className="text-white font-bold mt-2 text-sm">Activate Plan</Text>
                        </TouchableOpacity>
                    )}
                    {plan.status === 'ACTIVE' && (
                        <TouchableOpacity
                            className="flex-1 bg-primary-600 py-4 rounded-xl items-center shadow-md active:bg-primary-500"
                            onPress={() => completeMutation.mutate(plan.id)}
                            disabled={completeMutation.isPending}
                        >
                            <CheckCircleIcon size={24} color="#ffffff" />
                            <Text className="text-white font-bold mt-2 text-sm">Complete Plan</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity className="flex-1 bg-gray-700 py-4 rounded-xl items-center shadow-md active:bg-gray-600">
                        <PencilSquareIcon size={24} color="#d1d5db" />
                        <Text className="text-gray-300 font-bold mt-2 text-sm">Edit Plan</Text>
                    </TouchableOpacity>
                </View>

                {/* Schedule */}
                <View className="bg-gray-800 rounded-2xl p-6 mb-8 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <CalendarDaysIcon size={20} color="#a1a1aa" className="mr-2" />
                        <Text className="text-xl font-bold text-white">Schedule</Text>
                    </View>
                    <View className="flex-row justify-between border-b border-gray-700 pb-4 mb-4">
                        <Text className="text-gray-400 text-base">Start Date</Text>
                        <Text className="text-white font-semibold text-base">{new Date(plan.startDate).toLocaleDateString()}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-400 text-base">End Date</Text>
                        <Text className="text-white font-semibold text-base">{plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'Ongoing'}</Text>
                    </View>
                </View>

                {/* Nutrition Goals */}
                <View className="bg-gray-800 rounded-2xl p-6 mb-8 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <FireIcon size={20} color="#a1a1aa" className="mr-2" />
                        <Text className="text-xl font-bold text-white">Daily Targets</Text>
                    </View>
                    <View className="flex-row flex-wrap justify-between gap-4">
                        <NutrientStat icon={<FireIcon size={20} color="#fde047" />} value={plan.targetCalories} label="Calories" />
                        <NutrientStat icon={<CubeTransparentIcon size={20} color="#a78bfa" />} value={plan.targetProtein} label="Protein" />
                        <NutrientStat icon={<BeakerIcon size={20} color="#4ade80" />} value={plan.targetCarbs} label="Carbs" />
                        <NutrientStat icon={<ScaleIcon size={20} color="#f472b6" />} value={plan.targetFat} label="Fat" />
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

function NutrientStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
    return (
        <View className="flex-col items-center p-3 bg-gray-700 rounded-xl flex-1 max-w-[48%] min-w-[48%]">
            <View className="mb-2">
                {icon}
            </View>
            <Text className="text-white font-bold text-lg">{value || '-'}</Text>
            <Text className="text-gray-400 text-xs uppercase">{label}</Text>
        </View>
    );
}
