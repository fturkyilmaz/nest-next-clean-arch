import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useReports } from '../lib/api-hooks';
import { DocumentChartBarIcon } from 'react-native-heroicons/outline';

export default function ReportsScreen({ navigation }: any) {
    const { data: reports, isLoading, refetch, isRefetching } = useReports();

    const renderReport = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
            className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50"
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">{item.title}</Text>
                    <Text className="text-purple-400 text-sm font-semibold mb-2">{item.reportType}</Text>
                    <Text className="text-gray-400 text-sm">
                        Generated: {new Date(item.generatedAt).toLocaleDateString('tr-TR')}
                    </Text>
                </View>
                <DocumentChartBarIcon size={32} color="#a855f7" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-900">
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <Text className="text-white text-3xl font-extrabold">Reports</Text>
                <Text className="text-gray-300 text-sm mt-1">{reports?.length || 0} reports</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#a855f7" />
                </View>
            ) : reports?.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <DocumentChartBarIcon size={64} color="#4b5563" />
                    <Text className="text-gray-400 text-lg mt-4">No reports found</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderReport}
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
