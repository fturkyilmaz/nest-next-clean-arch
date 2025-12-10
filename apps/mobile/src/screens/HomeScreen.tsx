import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import {
    UserGroupIcon,
    ClipboardDocumentListIcon,
    ArrowRightIcon,
} from 'react-native-heroicons/outline';
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
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-900"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
            }
        >
            <View className="p-6 pb-24">
                {/* Hero Section */}
                <View className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-3xl p-6 mb-8 shadow-xl">
                    <Text className="text-gray-200 text-base mb-1">Welcome back,</Text>
                    <Text className="text-4xl font-extrabold text-white mb-4 leading-tight">{user?.firstName} {user?.lastName}</Text>
                    <Text className="text-indigo-200 text-sm">Your dashboard at a glance.</Text>
                </View>

                {/* Stats Cards */}
                <View className="flex-row gap-4 mb-8">
                    <StatCard
                        title="Total Clients"
                        value={totalClients}
                        icon={<UserGroupIcon size={24} color="#818cf8" />}
                        loading={clientsLoading}
                        onPress={() => navigation.navigate('Clients')}
                    />
                    <StatCard
                        title="Active Plans"
                        value={activePlans}
                        icon={<ClipboardDocumentListIcon size={24} color="#818cf8" />}
                        loading={plansLoading}
                        onPress={() => navigation.navigate('DietPlans')}
                    />
                </View>

                {/* Recent Clients */}
                <View className="bg-gray-800 rounded-2xl p-5 mb-8 shadow-md">
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-xl font-semibold text-white">Recent Clients</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Clients')} className="flex-row items-center">
                            <Text className="text-indigo-400 text-sm mr-1">View all</Text>
                            <ArrowRightIcon size={16} color="#818cf8" />
                        </TouchableOpacity>
                    </View>

                    {clientsLoading ? (
                        <ActivityIndicator color="#6366f1" />
                    ) : (
                        clients?.slice(0, 3).map((client: any) => (
                            <TouchableOpacity
                                key={client.id}
                                className="flex-row items-center bg-gray-700 rounded-xl p-4 mb-3 shadow-sm active:bg-gray-600"
                                onPress={() => navigation.navigate('ClientDetail', { clientId: client.id })}
                            >
                                <View className="w-12 h-12 rounded-full bg-pink-600 items-center justify-center mr-4 shadow-md">
                                    <Text className="text-white font-bold text-lg">
                                        {client.firstName[0]}{client.lastName[0]}
                                    </Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-medium text-base">{client.firstName} {client.lastName}</Text>
                                    <Text className="text-gray-400 text-sm">{client.email}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${client.isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                    <Text className={`text-xs ${client.isActive ? 'text-emerald-400' : 'text-red-400'} font-semibold`}>
                                        {client.isActive ? 'Active' : 'Inactive'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    {clients?.length === 0 && !clientsLoading && (
                        <Text className="text-gray-400 text-center py-6 text-sm">No clients added yet.</Text>
                    )}
                </View>

                {/* Recent Diet Plans */}
                <View className="bg-gray-800 rounded-2xl p-5 shadow-md">
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-xl font-semibold text-white">Recent Diet Plans</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('DietPlans')} className="flex-row items-center">
                            <Text className="text-indigo-400 text-sm mr-1">View all</Text>
                            <ArrowRightIcon size={16} color="#818cf8" />
                        </TouchableOpacity>
                    </View>

                    {plansLoading ? (
                        <ActivityIndicator color="#6366f1" />
                    ) : (
                        dietPlans?.slice(0, 3).map((plan: any) => (
                            <TouchableOpacity
                                key={plan.id}
                                className="flex-row items-center bg-gray-700 rounded-xl p-4 mb-3 shadow-sm active:bg-gray-600"
                                onPress={() => navigation.navigate('DietPlanDetail', { planId: plan.id })}
                            >
                                <View className="w-12 h-12 rounded-full bg-cyan-600 items-center justify-center mr-4 shadow-md">
                                    <Text className="text-white font-bold text-lg">DP</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-medium text-base">{plan.name}</Text>
                                    <Text className="text-gray-400 text-sm">{plan.targetCalories} kcal/day</Text>
                                </View>
                                <StatusBadge status={plan.status} />
                            </TouchableOpacity>
                        ))
                    )}

                    {dietPlans?.length === 0 && !plansLoading && (
                        <Text className="text-gray-400 text-center py-6 text-sm">No diet plans created yet.</Text>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

function StatCard({ title, value, icon, loading, onPress }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    loading?: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={onPress} className="flex-1 bg-gray-800 rounded-2xl p-5 shadow-md active:bg-gray-700">
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-gray-300 text-sm">{title}</Text>
                    {loading ? (
                        <ActivityIndicator color="#6366f1" className="mt-3" />
                    ) : (
                        <Text className="text-3xl font-bold text-white mt-2">{value}</Text>
                    )}
                </View>
                <View className="p-2 bg-indigo-500/20 rounded-full">
                    {icon}
                </View>
            </View>
            <View className="flex-row items-center mt-2">
                <Text className="text-indigo-400 text-sm">View details</Text>
                <ArrowRightIcon size={14} color="#818cf8" className="ml-1" />
            </View>
        </TouchableOpacity>
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
        <View className={`px-3 py-1 rounded-full ${color.bg}`}>
            <Text className={`text-xs ${color.text} font-semibold`}>{status}</Text>
        </View>
    );
}
