import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDietPlan, useActivateDietPlan, useCompleteDietPlan } from '../lib/api-hooks';

export default function DietPlanDetailScreen({ route, navigation }: any) {
    const { planId } = route.params;
    const { data: plan, isLoading, error } = useDietPlan(planId);
    const activateMutation = useActivateDietPlan();
    const completeMutation = useCompleteDietPlan();

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-900 items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    if (error || !plan) {
        return (
            <View className="flex-1 bg-slate-900 items-center justify-center">
                <Text className="text-red-400">Error loading plan</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-white/10 px-4 py-2 rounded-lg">
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-slate-900">
            <View className="p-4 pt-12">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-indigo-400 font-medium">← Back to Plans</Text>
                </TouchableOpacity>

                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-3xl font-bold text-white mb-2">{plan.name}</Text>
                        <Text className="text-slate-400">{plan.description}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full bg-white/10`}>
                        <Text className="text-white text-xs uppercase font-bold">{plan.status}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3 mb-8">
                    {plan.status === 'DRAFT' && (
                        <TouchableOpacity
                            className="flex-1 bg-emerald-600 py-3 rounded-xl items-center"
                            onPress={() => activateMutation.mutate(plan.id)}
                        >
                            <Text className="text-white font-bold">Activate Plan</Text>
                        </TouchableOpacity>
                    )}
                    {plan.status === 'ACTIVE' && (
                        <TouchableOpacity
                            className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
                            onPress={() => completeMutation.mutate(plan.id)}
                        >
                            <Text className="text-white font-bold">Complete Plan</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity className="flex-1 bg-white/10 py-3 rounded-xl items-center">
                        <Text className="text-white font-bold">Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Details */}
                <View className="bg-white/5 rounded-2xl p-5 mb-6 space-y-4">
                    <Text className="text-lg font-bold text-white mb-2">Schedule</Text>
                    <View className="flex-row justify-between border-b border-white/10 pb-3">
                        <Text className="text-slate-400">Start Date</Text>
                        <Text className="text-white">{new Date(plan.startDate).toLocaleDateString()}</Text>
                    </View>
                    <View className="flex-row justify-between pt-1">
                        <Text className="text-slate-400">End Date</Text>
                        <Text className="text-white">{plan.endDate ? new Date(plan.endDate).toLocaleDateString() : '-'}</Text>
                    </View>
                </View>

                {/* Nutrition Goals */}
                <View className="bg-white/5 rounded-2xl p-5 mb-6">
                    <Text className="text-lg font-bold text-white mb-4">Daily Targets</Text>
                    <View className="grid grid-cols-2 gap-4">
                        {/* Note: React Native does not support grid-cols consistently with Tailwind without NativeWind configuration, using View rows instead */}
                        <View className="flex-row gap-3 mb-3">
                            <View className="flex-1 bg-white/5 p-3 rounded-xl items-center">
                                <Text className="text-2xl font-bold text-white">{plan.targetCalories || '-'}</Text>
                                <Text className="text-slate-400 text-xs uppercase">Calories</Text>
                            </View>
                            <View className="flex-1 bg-white/5 p-3 rounded-xl items-center">
                                <Text className="text-2xl font-bold text-white">{plan.targetProtein || '-'}</Text>
                                <Text className="text-slate-400 text-xs uppercase">Protein</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-white/5 p-3 rounded-xl items-center">
                                <Text className="text-2xl font-bold text-white">{plan.targetCarbs || '-'}</Text>
                                <Text className="text-slate-400 text-xs uppercase">Carbs</Text>
                            </View>
                            <View className="flex-1 bg-white/5 p-3 rounded-xl items-center">
                                <Text className="text-2xl font-bold text-white">{plan.targetFat || '-'}</Text>
                                <Text className="text-slate-400 text-xs uppercase">Fat</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
