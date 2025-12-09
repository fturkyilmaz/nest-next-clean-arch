import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
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

    const statusColors: Record<string, { bar: string; badge: string; text: string }> = {
        DRAFT: { bar: 'bg-amber-500', badge: 'bg-amber-500/20', text: 'text-amber-400' },
        ACTIVE: { bar: 'bg-emerald-500', badge: 'bg-emerald-500/20', text: 'text-emerald-400' },
        COMPLETED: { bar: 'bg-blue-500', badge: 'bg-blue-500/20', text: 'text-blue-400' },
        CANCELLED: { bar: 'bg-red-500', badge: 'bg-red-500/20', text: 'text-red-400' },
    };

    return (
        <View className="flex-1 bg-slate-900">
            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="max-h-14 px-4 pt-4"
            >
                {['all', 'DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg mr-2 ${filter === status ? 'bg-white/20' : 'bg-white/5'}`}
                    >
                        <Text className={filter === status ? 'text-white font-medium' : 'text-slate-400'}>
                            {status === 'all' ? 'All' : status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
                }
                className="flex-1"
            >
                <View className="px-4 pt-4 pb-24">
                    {isLoading ? (
                        <View className="py-8 items-center">
                            <ActivityIndicator size="large" color="#10b981" />
                        </View>
                    ) : (
                        filteredPlans?.map((plan: any) => {
                            const colors = statusColors[plan.status] || statusColors.DRAFT;
                            return (
                                <TouchableOpacity
                                    key={plan.id}
                                    className="bg-white/5 rounded-2xl overflow-hidden mb-3"
                                    onPress={() => navigation.navigate('DietPlanDetail', { planId: plan.id })}
                                >
                                    <View className={`h-1 ${colors.bar}`} />
                                    <View className="p-4">
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View className="flex-1 mr-3">
                                                <Text className="text-white font-semibold text-lg">{plan.name}</Text>
                                                <Text className="text-slate-400 text-sm mt-1" numberOfLines={2}>
                                                    {plan.description || 'No description'}
                                                </Text>
                                            </View>
                                            <View className={`px-2 py-1 rounded-full ${colors.badge}`}>
                                                <Text className={`text-xs ${colors.text}`}>{plan.status}</Text>
                                            </View>
                                        </View>

                                        {/* Nutrition Goals */}
                                        <View className="flex-row gap-2 mb-3">
                                            <View className="flex-1 bg-white/5 rounded-lg p-2 items-center">
                                                <Text className="text-white font-semibold">{plan.targetCalories || '-'}</Text>
                                                <Text className="text-slate-500 text-xs">kcal</Text>
                                            </View>
                                            <View className="flex-1 bg-white/5 rounded-lg p-2 items-center">
                                                <Text className="text-white font-semibold">{plan.targetProtein || '-'}</Text>
                                                <Text className="text-slate-500 text-xs">protein</Text>
                                            </View>
                                            <View className="flex-1 bg-white/5 rounded-lg p-2 items-center">
                                                <Text className="text-white font-semibold">{plan.targetCarbs || '-'}</Text>
                                                <Text className="text-slate-500 text-xs">carbs</Text>
                                            </View>
                                            <View className="flex-1 bg-white/5 rounded-lg p-2 items-center">
                                                <Text className="text-white font-semibold">{plan.targetFat || '-'}</Text>
                                                <Text className="text-slate-500 text-xs">fat</Text>
                                            </View>
                                        </View>

                                        {/* Actions */}
                                        <View className="flex-row gap-2">
                                            {plan.status === 'DRAFT' && (
                                                <TouchableOpacity
                                                    className="flex-1 bg-emerald-500/20 rounded-lg py-2"
                                                    onPress={() => activateMutation.mutate(plan.id)}
                                                    disabled={activateMutation.isPending}
                                                >
                                                    <Text className="text-emerald-400 text-center text-sm">Activate</Text>
                                                </TouchableOpacity>
                                            )}
                                            {plan.status === 'ACTIVE' && (
                                                <TouchableOpacity
                                                    className="flex-1 bg-blue-500/20 rounded-lg py-2"
                                                    onPress={() => completeMutation.mutate(plan.id)}
                                                    disabled={completeMutation.isPending}
                                                >
                                                    <Text className="text-blue-400 text-center text-sm">Complete</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}

                    {filteredPlans?.length === 0 && !isLoading && (
                        <View className="py-8 items-center">
                            <Text className="text-slate-400">No diet plans found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full items-center justify-center shadow-lg"
                onPress={() => navigation.navigate('CreateDietPlan')}
            >
                <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>
        </View>
    );
}
