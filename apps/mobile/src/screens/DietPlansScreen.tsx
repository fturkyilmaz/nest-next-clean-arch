import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import {
    PlusIcon,
    AdjustmentsHorizontalIcon,
    ArrowRightIcon,
    FireIcon,
    CubeTransparentIcon,
    BeakerIcon,
    ScaleIcon,
} from 'react-native-heroicons/outline';
import { useDietPlans, useActivateDietPlan, useCompleteDietPlan } from '../lib/api-hooks';

export default function DietPlansScreen({ navigation }: any) {
    const { data: plans, isLoading, refetch } = useDietPlans();
    const activateMutation = useActivateDietPlan();
    const completeMutation = useCompleteDietPlan();
    const [filter, setFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const filteredPlans = plans?.filter((plan: any) => {
        if (filter === 'all') return true;
        return plan.status === filter;
    });

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const statusColors: Record<string, { bar: string; badgeBg: string; badgeText: string }> = {
        DRAFT: { bar: 'bg-amber-500', badgeBg: 'bg-amber-500/20', badgeText: 'text-amber-400' },
        ACTIVE: { bar: 'bg-emerald-500', badgeBg: 'bg-emerald-500/20', badgeText: 'text-emerald-400' },
        COMPLETED: { bar: 'bg-blue-500', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-400' },
        CANCELLED: { bar: 'bg-red-500', badgeBg: 'bg-red-500/20', badgeText: 'text-red-400' },
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 border-b border-gray-800">
                <Text className="text-3xl font-bold text-white mb-2">Diet Plans</Text>
                <Text className="text-gray-400 text-base">Organize and manage your diet plans.</Text>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-6 pt-4 pb-4"
            >
                <View className="flex-row space-x-3">
                    {['all', 'DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            onPress={() => setFilter(status)}
                            className={`px-5 py-2 rounded-full ${filter === status ? 'bg-primary-600' : 'bg-gray-700'} active:bg-primary-500`}
                        >
                            <Text className={`text-sm font-semibold ${filter === status ? 'text-white' : 'text-gray-300'}`}>
                                {status === 'all' ? 'All' : status}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                }
                className="flex-1"
            >
                <View className="px-6 pt-4 pb-24">
                    {isLoading ? (
                        <View className="py-12 items-center">
                            <ActivityIndicator size="large" color="#6366f1" />
                        </View>
                    ) : (
                        filteredPlans?.map((plan: any) => {
                            const colors = statusColors[plan.status] || statusColors.DRAFT;
                            return (
                                <TouchableOpacity
                                    key={plan.id}
                                    className="bg-gray-800 rounded-2xl overflow-hidden mb-5 shadow-md active:bg-gray-700"
                                    onPress={() => navigation.navigate('DietPlanDetail', { planId: plan.id })}
                                >
                                    <View className={`h-1 ${colors.bar}`} />
                                    <View className="p-5">
                                        <View className="flex-row justify-between items-start mb-4">
                                            <View className="flex-1 mr-4">
                                                <Text className="text-white font-bold text-xl mb-1">{plan.name}</Text>
                                                <Text className="text-gray-400 text-sm" numberOfLines={2}>
                                                    {plan.description || 'No description provided.'}
                                                </Text>
                                            </View>
                                            <View className={`px-3 py-1 rounded-full ${colors.badgeBg}`}>
                                                <Text className={`text-xs ${colors.badgeText} font-semibold`}>{plan.status}</Text>
                                            </View>
                                        </View>

                                        {/* Nutrition Goals */}
                                        <View className="flex-row justify-between items-center bg-gray-700 rounded-xl p-3 mb-4">
                                            <NutrientStat icon={<FireIcon size={20} color="#fde047" />} value={plan.targetCalories} label="kcal" />
                                            <NutrientStat icon={<CubeTransparentIcon size={20} color="#a78bfa" />} value={plan.targetProtein} label="protein" />
                                            <NutrientStat icon={<BeakerIcon size={20} color="#4ade80" />} value={plan.targetCarbs} label="carbs" />
                                            <NutrientStat icon={<ScaleIcon size={20} color="#f472b6" />} value={plan.targetFat} label="fat" />
                                        </View>

                                        {/* Actions */}
                                        <View className="flex-row gap-3">
                                            {plan.status === 'DRAFT' && (
                                                <TouchableOpacity
                                                    className="flex-1 bg-primary-600 py-3 rounded-xl items-center shadow-sm active:bg-primary-500"
                                                    onPress={() => activateMutation.mutate(plan.id)}
                                                    disabled={activateMutation.isPending}
                                                >
                                                    <Text className="text-white text-base font-semibold">Activate Plan</Text>
                                                </TouchableOpacity>
                                            )}
                                            {plan.status === 'ACTIVE' && (
                                                <TouchableOpacity
                                                    className="flex-1 bg-secondary-600 py-3 rounded-xl items-center shadow-sm active:bg-secondary-500"
                                                    onPress={() => completeMutation.mutate(plan.id)}
                                                    disabled={completeMutation.isPending}
                                                >
                                                    <Text className="text-white text-base font-semibold">Complete Plan</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}

                    {filteredPlans?.length === 0 && !isLoading && (
                        <View className="py-12 items-center">
                            <Text className="text-gray-400 text-base">No diet plans created yet.</Text>
                            <TouchableOpacity
                                className="mt-4 bg-primary-600 px-5 py-2 rounded-full shadow-md active:bg-primary-500"
                                onPress={() => navigation.navigate('CreateDietPlan')}
                            >
                                <Text className="text-white font-semibold">Create New Plan</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-8 right-6 w-16 h-16 bg-secondary-500 rounded-full items-center justify-center shadow-lg active:bg-secondary-600"
                onPress={() => navigation.navigate('CreateDietPlan')}
            >
                <PlusIcon size={28} color="#ffffff" />
            </TouchableOpacity>
        </View>
    );
}

function NutrientStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
    return (
        <View className="flex-col items-center p-2">
            <View className="mb-1">
                {icon}
            </View>
            <Text className="text-white font-bold text-base">{value || '-'}</Text>
            <Text className="text-gray-400 text-xs uppercase">{label}</Text>
        </View>
    );
}
