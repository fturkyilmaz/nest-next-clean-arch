import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useAppointments } from '../lib/api-hooks';
import { CalendarIcon, ClockIcon, UserIcon, PlusIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon, XCircleIcon } from 'react-native-heroicons/solid';

type FilterType = 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export default function AppointmentsScreen({ navigation }: any) {
    const { data: appointments, isLoading, refetch, isRefetching } = useAppointments();
    const [filter, setFilter] = useState<FilterType>('ALL');

    const filteredAppointments = appointments?.filter(apt =>
        filter === 'ALL' ? true : apt.status === filter
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-500';
            case 'COMPLETED': return 'bg-green-500';
            case 'CANCELLED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircleIcon size={20} color="#10b981" />;
            case 'CANCELLED': return <XCircleIcon size={20} color="#ef4444" />;
            default: return <ClockIcon size={20} color="#3b82f6" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderAppointment = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('AppointmentDetail', { id: item.id })}
            className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50"
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">{item.title}</Text>
                    <View className="flex-row items-center mt-1">
                        {getStatusIcon(item.status)}
                        <Text className={`ml-2 text-sm font-semibold ${item.status === 'COMPLETED' ? 'text-green-400' :
                                item.status === 'CANCELLED' ? 'text-red-400' :
                                    'text-blue-400'
                            }`}>
                            {item.status}
                        </Text>
                    </View>
                </View>
                <View className={`${getStatusColor(item.status)} px-3 py-1 rounded-full`}>
                    <Text className="text-white text-xs font-bold">{item.duration}min</Text>
                </View>
            </View>

            {item.description && (
                <Text className="text-gray-400 text-sm mb-3" numberOfLines={2}>
                    {item.description}
                </Text>
            )}

            <View className="flex-row items-center justify-between pt-3 border-t border-gray-700/50">
                <View className="flex-row items-center flex-1">
                    <CalendarIcon size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm ml-2">
                        {formatDate(item.scheduledAt)}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <UserIcon size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm ml-2">
                        Client #{item.clientId.slice(0, 8)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const FilterButton = ({ label, value }: { label: string; value: FilterType }) => (
        <TouchableOpacity
            onPress={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl mr-2 ${filter === value
                    ? 'bg-purple-600'
                    : 'bg-gray-700/50 border border-gray-600'
                }`}
        >
            <Text className={`font-semibold ${filter === value ? 'text-white' : 'text-gray-400'
                }`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-white text-3xl font-extrabold">Appointments</Text>
                        <Text className="text-gray-300 text-sm mt-1">
                            {filteredAppointments?.length || 0} appointments
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateAppointment')}
                        className="bg-purple-600 rounded-full p-3 shadow-lg"
                    >
                        <PlusIcon size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View className="flex-row mt-2">
                    <FilterButton label="All" value="ALL" />
                    <FilterButton label="Scheduled" value="SCHEDULED" />
                    <FilterButton label="Completed" value="COMPLETED" />
                    <FilterButton label="Cancelled" value="CANCELLED" />
                </View>
            </View>

            {/* Appointments List */}
            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#a855f7" />
                    <Text className="text-gray-400 mt-4">Loading appointments...</Text>
                </View>
            ) : filteredAppointments?.length === 0 ? (
                <View className="flex-1 justify-center items-center px-8">
                    <CalendarIcon size={64} color="#4b5563" />
                    <Text className="text-gray-400 text-lg mt-4 text-center">
                        No {filter === 'ALL' ? '' : filter.toLowerCase()} appointments found
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateAppointment')}
                        className="bg-purple-600 rounded-xl px-6 py-3 mt-6"
                    >
                        <Text className="text-white font-bold">Create Appointment</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredAppointments}
                    renderItem={renderAppointment}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor="#a855f7"
                        />
                    }
                />
            )}
        </View>
    );
}
