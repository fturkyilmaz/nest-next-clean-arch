import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useClient } from '../lib/api-hooks';

export default function ClientDetailScreen({ route, navigation }: any) {
    const { clientId } = route.params;
    const { data: client, isLoading, error } = useClient(clientId);

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-900 items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    if (error || !client) {
        return (
            <View className="flex-1 bg-slate-900 items-center justify-center">
                <Text className="text-red-400">Error loading client profile</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-white/10 px-4 py-2 rounded-lg">
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-slate-900">
            <View className="p-4 pt-12">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-indigo-400 font-medium">← Back to Clients</Text>
                </TouchableOpacity>

                <View className="flex-row items-center mb-6">
                    <View className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 items-center justify-center mr-4">
                        <Text className="text-white text-2xl font-bold">
                            {client.firstName[0]}{client.lastName[0]}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-white mb-1">
                            {client.firstName} {client.lastName}
                        </Text>
                        <Text className="text-slate-400">{client.email}</Text>
                        {client.phone && <Text className="text-slate-500 text-sm mt-1">{client.phone}</Text>}
                    </View>
                </View>

                {/* Status Badge */}
                <View className="flex-row mb-6">
                    <View className={`px-3 py-1 rounded-full ${client.isActive ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
                        <Text className={`font-bold ${client.isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {client.isActive ? 'Active Client' : 'Inactive'}
                        </Text>
                    </View>
                </View>

                {/* Medical Info */}
                <View className="bg-white/5 rounded-2xl p-5 mb-6 space-y-4">
                    <Text className="text-lg font-bold text-white mb-2">Medical History</Text>

                    <View>
                        <Text className="text-slate-500 text-xs uppercase font-bold mb-1">Allergies</Text>
                        {client.allergies && client.allergies.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {client.allergies.map((a: string, i: number) => (
                                    <View key={i} className="bg-red-500/20 px-2 py-1 rounded-md">
                                        <Text className="text-red-300 text-sm">{a}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-slate-400">No allergies recorded</Text>
                        )}
                    </View>

                    <View>
                        <Text className="text-slate-500 text-xs uppercase font-bold mb-1">Medical Conditions</Text>
                        {client.conditions && client.conditions.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {client.conditions.map((c: string, i: number) => (
                                    <View key={i} className="bg-amber-500/20 px-2 py-1 rounded-md">
                                        <Text className="text-amber-300 text-sm">{c}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-slate-400">No conditions recorded</Text>
                        )}
                    </View>

                    <View>
                        <Text className="text-slate-500 text-xs uppercase font-bold mb-1">Medications</Text>
                        {client.medications && client.medications.length > 0 ? (
                            <Text className="text-white">{client.medications.join(', ')}</Text>
                        ) : (
                            <Text className="text-slate-400">No medications</Text>
                        )}
                    </View>
                </View>

                {/* Notes */}
                {client.notes && (
                    <View className="bg-white/5 rounded-2xl p-5 mb-6">
                        <Text className="text-lg font-bold text-white mb-2">Notes</Text>
                        <Text className="text-slate-300 leading-relaxed">{client.notes}</Text>
                    </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-3 mb-8">
                    <TouchableOpacity className="flex-1 bg-white/10 py-3 rounded-xl items-center">
                        <Text className="text-white font-bold">Diet Plans</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-white/10 py-3 rounded-xl items-center">
                        <Text className="text-white font-bold">Metrics</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
