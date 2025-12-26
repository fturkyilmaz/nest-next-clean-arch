import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useEvents } from '../lib/api-hooks';
import { CalendarIcon, PlusIcon } from 'react-native-heroicons/outline';

export default function EventsScreen({ navigation }: any) {
    const { data: events, isLoading, refetch, isRefetching } = useEvents();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const renderEvent = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('EventDetail', { id: item.id })}
            className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50"
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">{item.title}</Text>
                    <Text className="text-purple-400 text-sm font-semibold">{item.eventType}</Text>
                </View>
            </View>

            {item.description && (
                <Text className="text-gray-400 text-sm mb-3" numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            <View className="flex-row items-center justify-between pt-3 border-t border-gray-700/50">
                <View className="flex-row items-center">
                    <CalendarIcon size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm ml-2">
                        {formatDate(item.startDate)}
                        {item.endDate && ` - ${formatDate(item.endDate)}`}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-900">
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white text-3xl font-extrabold">Events</Text>
                        <Text className="text-gray-300 text-sm mt-1">
                            {events?.length || 0} events
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateEvent')}
                        className="bg-purple-600 rounded-full p-3 shadow-lg"
                    >
                        <PlusIcon size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#a855f7" />
                </View>
            ) : events?.length === 0 ? (
                <View className="flex-1 justify-center items-center px-8">
                    <CalendarIcon size={64} color="#4b5563" />
                    <Text className="text-gray-400 text-lg mt-4 text-center">No events found</Text>
                </View>
            ) : (
                <FlatList
                    data={events}
                    renderItem={renderEvent}
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
