import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useAudits } from '../lib/api-hooks';
import { ClockIcon, UserIcon } from 'react-native-heroicons/outline';

export default function ActivityLogsScreen({ navigation }: any) {
    const { data: audits, isLoading, refetch, isRefetching } = useAudits();

    const renderAudit = ({ item }: any) => (
        <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">{item.action}</Text>
                    <Text className="text-purple-400 text-sm font-semibold">{item.entity}</Text>
                </View>
                <ClockIcon size={20} color="#9ca3af" />
            </View>

            <View className="flex-row items-center pt-3 border-t border-gray-700/50">
                <UserIcon size={16} color="#9ca3af" />
                <Text className="text-gray-400 text-sm ml-2">
                    User #{item.userId?.slice(0, 8)}
                </Text>
                <Text className="text-gray-500 text-sm ml-4">
                    {new Date(item.createdAt).toLocaleString('tr-TR')}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-900">
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <Text className="text-white text-3xl font-extrabold">Activity Logs</Text>
                <Text className="text-gray-300 text-sm mt-1">{audits?.length || 0} activities</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#a855f7" />
                </View>
            ) : audits?.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ClockIcon size={64} color="#4b5563" />
                    <Text className="text-gray-400 text-lg mt-4">No activity logs found</Text>
                </View>
            ) : (
                <FlatList
                    data={audits}
                    renderItem={renderAudit}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#a855f7" />
                    }
                />
            )}
        </View>
    );
}
