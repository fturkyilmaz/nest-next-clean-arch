import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useAppointment } from '../lib/api-hooks';
import {
    CalendarIcon,
    ClockIcon,
    UserIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
} from 'react-native-heroicons/outline';

export default function AppointmentDetailScreen({ route, navigation }: any) {
    const { id } = route.params;
    const { data: appointment, isLoading } = useAppointment(id);

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#a855f7" />
            </View>
        );
    }

    if (!appointment) {
        return (
            <View className="flex-1 bg-gray-900 justify-center items-center px-8">
                <Text className="text-gray-400 text-lg">Appointment not found</Text>
            </View>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-500';
            case 'COMPLETED': return 'bg-green-500';
            case 'CANCELLED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-8 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-purple-300 text-base font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-3xl font-extrabold mb-2">
                    {appointment.title}
                </Text>
                <View className={`${getStatusColor(appointment.status)} self-start px-4 py-2 rounded-full`}>
                    <Text className="text-white font-bold">{appointment.status}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Date & Time Card */}
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                    <View className="flex-row items-center mb-3">
                        <CalendarIcon size={24} color="#a855f7" />
                        <Text className="text-white text-lg font-bold ml-3">Date & Time</Text>
                    </View>
                    <Text className="text-gray-300 text-base mb-2">
                        {formatDate(appointment.scheduledAt)}
                    </Text>
                    <View className="flex-row items-center mt-2">
                        <ClockIcon size={20} color="#9ca3af" />
                        <Text className="text-gray-400 ml-2">Duration: {appointment.duration} minutes</Text>
                    </View>
                </View>

                {/* Client Info Card */}
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                    <View className="flex-row items-center mb-3">
                        <UserIcon size={24} color="#a855f7" />
                        <Text className="text-white text-lg font-bold ml-3">Client</Text>
                    </View>
                    <Text className="text-gray-300 text-base">
                        Client ID: {appointment.clientId}
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ClientDetail', { id: appointment.clientId })}
                        className="bg-purple-600/20 border border-purple-600 rounded-xl px-4 py-2 mt-3"
                    >
                        <Text className="text-purple-400 font-semibold text-center">View Client Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Description Card */}
                {appointment.description && (
                    <View className="bg-gray-800/60 rounded-2xl p-5 mb-4 border border-gray-700/50">
                        <View className="flex-row items-center mb-3">
                            <DocumentTextIcon size={24} color="#a855f7" />
                            <Text className="text-white text-lg font-bold ml-3">Description</Text>
                        </View>
                        <Text className="text-gray-300 text-base leading-6">
                            {appointment.description}
                        </Text>
                    </View>
                )}

                {/* Metadata Card */}
                <View className="bg-gray-800/60 rounded-2xl p-5 mb-6 border border-gray-700/50">
                    <Text className="text-gray-400 text-sm mb-2">
                        Created: {new Date(appointment.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                        Updated: {new Date(appointment.updatedAt).toLocaleDateString('tr-TR')}
                    </Text>
                </View>

                {/* Action Buttons */}
                {appointment.status === 'SCHEDULED' && (
                    <View className="mb-8 space-y-3">
                        <TouchableOpacity className="bg-green-600 rounded-xl py-4 mb-3 flex-row items-center justify-center">
                            <CheckCircleIcon size={20} color="#ffffff" />
                            <Text className="text-white font-bold text-lg ml-2">Mark as Completed</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="bg-red-600 rounded-xl py-4 flex-row items-center justify-center">
                            <XCircleIcon size={20} color="#ffffff" />
                            <Text className="text-white font-bold text-lg ml-2">Cancel Appointment</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
