import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEvent } from '../lib/api-hooks';
import { CalendarIcon, DocumentTextIcon } from 'react-native-heroicons/outline';

export default function EventDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { data: event, isLoading } = useEvent(id);

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#a855f7" />
            </View>
        );
    }

    if (!event) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-gray-400 text-lg">Event not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-900">
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-8 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-purple-300 text-base font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-3xl font-extrabold mb-2">{event.title}</Text>
                <View className="bg-purple-600/30 self-start px-4 py-2 rounded-full">
                    <Text className="text-purple-200 font-semibold">{event.eventType}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                    <View className="flex-row items-center mb-3">
                        <CalendarIcon size={24} color="#a855f7" />
                        <Text className="text-white text-lg font-bold ml-3">Date Range</Text>
                    </View>
                    <Text className="text-gray-300 text-base mb-2">
                        Start: {new Date(event.startDate).toLocaleDateString('tr-TR')}
                    </Text>
                    {event.endDate && (
                        <Text className="text-gray-300 text-base">
                            End: {new Date(event.endDate).toLocaleDateString('tr-TR')}
                        </Text>
                    )}
                </View>

                {event.description && (
                    <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                        <View className="flex-row items-center mb-3">
                            <DocumentTextIcon size={24} color="#a855f7" />
                            <Text className="text-white text-lg font-bold ml-3">Description</Text>
                        </View>
                        <Text className="text-gray-300 text-base leading-6">{event.description}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
