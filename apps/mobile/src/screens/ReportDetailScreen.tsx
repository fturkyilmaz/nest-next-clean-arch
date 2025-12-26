import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useReport } from '../lib/api-hooks';
import { DocumentChartBarIcon } from 'react-native-heroicons/outline';

export default function ReportDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { data: report, isLoading } = useReport(id);

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#a855f7" />
            </View>
        );
    }

    if (!report) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-gray-400 text-lg">Report not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-900">
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-8 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-purple-300 text-base font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-3xl font-extrabold mb-2">{report.title}</Text>
                <View className="bg-purple-600/30 self-start px-4 py-2 rounded-full">
                    <Text className="text-purple-200 font-semibold">{report.reportType}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                    <DocumentChartBarIcon size={32} color="#a855f7" />
                    <Text className="text-gray-300 text-base mt-4">
                        Generated: {new Date(report.generatedAt).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text className="text-gray-400 text-sm mt-2">
                        Report data visualization would appear here
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
