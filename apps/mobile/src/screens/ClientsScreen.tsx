import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useClients } from '../lib/api-hooks';
import { PlusIcon, MagnifyingGlassIcon, ArrowRightIcon } from 'react-native-heroicons/outline';

export default function ClientsScreen({ navigation }: any) {
    const { data: clients, isLoading, refetch } = useClients();
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const filteredClients = clients?.filter((client: any) =>
        `${client.firstName} ${client.lastName} ${client.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 border-b border-gray-800">
                <Text className="text-3xl font-bold text-white mb-2">Clients</Text>
                <Text className="text-gray-400 text-base">Manage your client base efficiently.</Text>
            </View>

            {/* Search */}
            <View className="px-6 pt-4 pb-4">
                <View className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
                    <MagnifyingGlassIcon size={20} color="#a1a1aa" className="mr-3" />
                    <TextInput
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholder="Search clients..."
                        placeholderTextColor="#a1a1aa"
                        className="flex-1 text-white text-base"
                    />
                </View>
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
                }
                className="flex-1"
            >
                <View className="px-6 pb-24">
                    {isLoading ? (
                        <View className="py-12 items-center">
                            <ActivityIndicator size="large" color="#6366f1" />
                        </View>
                    ) : (
                        filteredClients?.map((client: any) => (
                            <TouchableOpacity
                                key={client.id}
                                className="bg-gray-800 rounded-2xl p-4 mb-4 shadow-md active:bg-gray-700"
                                onPress={() => navigation.navigate('ClientDetail', { clientId: client.id })}
                            >
                                <View className="flex-row items-center mb-3">
                                    <View className="w-14 h-14 rounded-full bg-primary-500 items-center justify-center mr-4 shadow-sm">
                                        <Text className="text-white text-xl font-bold">
                                            {client.firstName[0]}{client.lastName[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-lg">
                                            {client.firstName} {client.lastName}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">{client.email}</Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${client.isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                        <Text className={`text-xs ${client.isActive ? 'text-emerald-400' : 'text-red-400'} font-semibold`}>
                                            {client.isActive ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>

                                {(client.allergies?.length > 0 || client.conditions?.length > 0) && (
                                    <View className="flex-row flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                                        {client.allergies?.slice(0, 2).map((allergy: string, i: number) => (
                                            <View key={i} className="bg-red-500/20 px-3 py-1 rounded-full">
                                                <Text className="text-red-400 text-xs">🚫 {allergy}</Text>
                                            </View>
                                        ))}
                                        {client.conditions?.slice(0, 2).map((condition: string, i: number) => (
                                            <View key={i} className="bg-amber-500/20 px-3 py-1 rounded-full">
                                                <Text className="text-amber-400 text-xs">⚕️ {condition}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}

                    {filteredClients?.length === 0 && !isLoading && (
                        <View className="py-12 items-center">
                            <Text className="text-gray-400 text-base">No clients found.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-8 right-6 w-16 h-16 bg-primary-500 rounded-full items-center justify-center shadow-lg active:bg-primary-600"
                onPress={() => navigation.navigate('AddClient')}
            >
                <PlusIcon size={28} color="#ffffff" />
            </TouchableOpacity>
        </View>
    );
}
