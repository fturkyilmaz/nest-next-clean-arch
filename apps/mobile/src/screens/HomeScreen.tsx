import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useCurrentUser, useClients, useDietPlans } from '../lib/api-hooks';

export default function HomeScreen({ navigation }: any) {
    const { data: user, isLoading: userLoading, refetch: refetchUser } = useCurrentUser();
    const { data: clients, isLoading: clientsLoading, refetch: refetchClients } = useClients();
    const { data: dietPlans, isLoading: plansLoading, refetch: refetchPlans } = useDietPlans();

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchUser(), refetchClients(), refetchPlans()]);
        setRefreshing(false);
    };

    const activePlans = dietPlans?.filter((p: any) => p.status === 'ACTIVE').length || 0;
    const totalClients = clients?.length || 0;

    if (userLoading) {
        return (
            <View className="flex-1 bg-slate-900 items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-slate-900"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
            }
        >
            <View className="px-4 pt-4 pb-24">
                {/* Header */}
                <View className="mb-6">
                    <Text className="text-slate-400">Welcome back,</Text>
                    <Text className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</Text>
                </View>

                {/* Stats */}
                <View className="flex-row gap-4 mb-6">
                    <StatCard title="Total Clients" value={totalClients} icon="👥" loading={clientsLoading} />
                    <StatCard title="Active Plans" value={activePlans} icon="📋" loading={plansLoading} />
                </View>

                {/* Recent Clients */}
                <View className="bg-white/5 rounded-2xl p-4 mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold text-white">Recent Clients</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Clients')}>
                            <Text className="text-emerald-400 text-sm">View all →</Text>
                        </TouchableOpacity>
                    </View>

                    {clientsLoading ? (
                        <ActivityIndicator color="#10b981" />
                    ) : (
                        clients?.slice(0, 3).map((client: any) => (
                            <TouchableOpacity
                                key={client.id}
                                className="flex-row items-center bg-white/5 rounded-xl p-3 mb-2"
                                onPress={() => navigation.navigate('ClientDetail', { clientId: client.id })}
                            >
                                <View className="w-10 h-10 rounded-full bg-pink-500 items-center justify-center mr-3">
                                    <Text className="text-white font-semibold">
                                        {client.firstName[0]}{client.lastName[0]}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-medium">{client.firstName} {client.lastName}</Text>
                                    <Text className="text-slate-400 text-sm">{client.email}</Text>
                                </View>
                                <View className={`px-2 py-1 rounded-full ${client.isActive ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
                                    <Text className={client.isActive ? 'text-emerald-400 text-xs' : 'text-slate-400 text-xs'}>
                                        {client.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    {clients?.length === 0 && !clientsLoading && (
                        <Text className="text-slate-400 text-center py-4">No clients yet</Text>
                    )}
                </View>

                {/* Recent Diet Plans */}
                <View className="bg-white/5 rounded-2xl p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold text-white">Recent Plans</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('DietPlans')}>
                            <Text className="text-emerald-400 text-sm">View all →</Text>
                        </TouchableOpacity>
                    </View>

                    {plansLoading ? (
                        <ActivityIndicator color="#10b981" />
                    ) : (
                        dietPlans?.slice(0, 3).map((plan: any) => (
                            <TouchableOpacity
                                key={plan.id}
                                className="flex-row items-center bg-white/5 rounded-xl p-3 mb-2"
                                onPress={() => navigation.navigate('DietPlanDetail', { planId: plan.id })}
                            >
                                <View className="w-10 h-10 rounded-lg bg-cyan-500 items-center justify-center mr-3">
                                    <Text className="text-lg">📋</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-medium">{plan.name}</Text>
                                    <Text className="text-slate-400 text-sm">{plan.targetCalories} kcal/day</Text>
                                </View>
                                <StatusBadge status={plan.status} />
                            </TouchableOpacity>
                        ))
                    )}

                    {dietPlans?.length === 0 && !plansLoading && (
                        <Text className="text-slate-400 text-center py-4">No diet plans yet</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

function StatCard({ title, value, icon, loading }: { title: string; value: number; icon: string; loading?: boolean }) {
    return (
        <View className="flex-1 bg-white/5 rounded-2xl p-4">
            <View className="flex-row justify-between items-start">
                <View>
                    <Text className="text-slate-400 text-sm">{title}</Text>
                    {loading ? (
                        <ActivityIndicator color="#10b981" className="mt-2" />
                    ) : (
                        <Text className="text-2xl font-bold text-white mt-1">{value}</Text>
                    )}
                </View>
                <Text className="text-2xl">{icon}</Text>
            </View>
        </View>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, { bg: string; text: string }> = {
        DRAFT: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
        ACTIVE: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
        COMPLETED: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
        CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400' },
    };
    const color = colors[status] || colors.DRAFT;
    return (
        <View className={`px-2 py-1 rounded-full ${color.bg}`}>
            <Text className={`text-xs ${color.text}`}>{status}</Text>
        </View>
    );
}
