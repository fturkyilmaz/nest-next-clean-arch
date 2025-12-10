import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useClient } from '../lib/api-hooks';
import { ChevronLeftIcon, ChartBarIcon, ClipboardDocumentListIcon, DocumentTextIcon, HeartIcon } from 'react-native-heroicons/outline';

export default function ClientDetailScreen({ route, navigation }: any) {
    const { clientId } = route.params;
    const { data: client, isLoading, error } = useClient(clientId);

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (error || !client) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center p-6">
                <Text className="text-red-400 text-lg mb-4">Error loading client profile. Please try again.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-primary-700 px-6 py-3 rounded-full shadow-md active:bg-primary-600">
                    <Text className="text-white font-semibold text-base">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 flex-row items-center border-b border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeftIcon size={24} color="#d1d5db" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white ml-3">Client Details</Text>
            </View>

            <View className="p-6 pb-24">
                {/* Client Profile Summary */}
                <View className="bg-gray-800 rounded-3xl p-6 mb-8 shadow-xl flex-row items-center">
                    <View className="w-20 h-20 rounded-full bg-primary-600 items-center justify-center mr-5 shadow-md">
                        <Text className="text-white text-3xl font-bold">
                            {client.firstName[0]}{client.lastName[0]}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-3xl font-bold text-white mb-1 leading-tight">
                            {client.firstName} {client.lastName}
                        </Text>
                        <Text className="text-gray-400 text-base">{client.email}</Text>
                        {client.phone && <Text className="text-gray-500 text-sm mt-1">📞 {client.phone}</Text>}
                    </View>
                </View>

                {/* Status Badge */}
                <View className="mb-8 items-start">
                    <View className={`px-4 py-2 rounded-full ${client.isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        <Text className={`font-bold text-sm ${client.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {client.isActive ? 'Active Client' : 'Inactive'}
                        </Text>
                    </View>
                </View>

                {/* Medical Info */}
                <View className="bg-gray-800 rounded-2xl p-6 mb-8 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <HeartIcon size={20} color="#a1a1aa" className="mr-2" />
                        <Text className="text-xl font-bold text-white">Medical History</Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-500 text-xs uppercase font-bold mb-2">Allergies</Text>
                        {client.allergies && client.allergies.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {client.allergies.map((a: string, i: number) => (
                                    <View key={i} className="bg-red-600/30 px-3 py-1 rounded-full">
                                        <Text className="text-red-300 text-sm">🚫 {a}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-gray-400 text-sm">No allergies recorded.</Text>
                        )}
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-500 text-xs uppercase font-bold mb-2">Medical Conditions</Text>
                        {client.conditions && client.conditions.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {client.conditions.map((c: string, i: number) => (
                                    <View key={i} className="bg-amber-600/30 px-3 py-1 rounded-full">
                                        <Text className="text-amber-300 text-sm">⚕️ {c}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-gray-400 text-sm">No conditions recorded.</Text>
                        )}
                    </View>

                    <View>
                        <Text className="text-gray-500 text-xs uppercase font-bold mb-2">Medications</Text>
                        {client.medications && client.medications.length > 0 ? (
                            <Text className="text-white text-sm">{client.medications.join(', ')}</Text>
                        ) : (
                            <Text className="text-gray-400 text-sm">No medications recorded.</Text>
                        )}
                    </View>
                </View>

                {/* Notes */}
                {client.notes && (
                    <View className="bg-gray-800 rounded-2xl p-6 mb-8 shadow-md">
                        <View className="flex-row items-center mb-4">
                            <DocumentTextIcon size={20} color="#a1a1aa" className="mr-2" />
                            <Text className="text-xl font-bold text-white">Additional Notes</Text>
                        </View>
                        <Text className="text-gray-300 leading-relaxed text-sm">{client.notes}</Text>
                    </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-4 mb-8">
                    <TouchableOpacity className="flex-1 bg-primary-700 py-4 rounded-xl items-center shadow-md active:bg-primary-600">
                        <ClipboardDocumentListIcon size={24} color="#ffffff" />
                        <Text className="text-white font-bold mt-2 text-sm">Diet Plans</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-primary-700 py-4 rounded-xl items-center shadow-md active:bg-primary-600">
                        <ChartBarIcon size={24} color="#ffffff" />
                        <Text className="text-white font-bold mt-2 text-sm">Metrics</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
