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
        <View className="flex-1 bg-slate-900">
            {/* Search */}
            <View className="px-4 pt-4 pb-2">
                <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Search clients..."
                    placeholderTextColor="#64748b"
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                />
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />
                }
                className="flex-1"
            >
                <View className="px-4 pb-24">
                    {isLoading ? (
                        <View className="py-8 items-center">
                            <ActivityIndicator size="large" color="#10b981" />
                        </View>
                    ) : (
                        filteredClients?.map((client: any) => (
                            <TouchableOpacity
                                key={client.id}
                                className="bg-white/5 rounded-2xl p-4 mb-3"
                                onPress={() => navigation.navigate('ClientDetail', { clientId: client.id })}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 items-center justify-center mr-3">
                                        <Text className="text-white text-lg font-semibold">
                                            {client.firstName[0]}{client.lastName[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-lg">
                                            {client.firstName} {client.lastName}
                                        </Text>
                                        <Text className="text-slate-400">{client.email}</Text>
                                    </View>
                                    <View className={`px-2 py-1 rounded-full ${client.isActive ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
                                        <Text className={client.isActive ? 'text-emerald-400 text-xs' : 'text-slate-400 text-xs'}>
                                            {client.isActive ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>

                                {(client.allergies?.length > 0 || client.conditions?.length > 0) && (
                                    <View className="flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                                        {client.allergies?.slice(0, 2).map((allergy: string, i: number) => (
                                            <View key={i} className="bg-red-500/20 px-2 py-1 rounded-full">
                                                <Text className="text-red-400 text-xs">🚫 {allergy}</Text>
                                            </View>
                                        ))}
                                        {client.conditions?.slice(0, 2).map((condition: string, i: number) => (
                                            <View key={i} className="bg-amber-500/20 px-2 py-1 rounded-full">
                                                <Text className="text-amber-400 text-xs">⚕️ {condition}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}

                    {filteredClients?.length === 0 && !isLoading && (
                        <View className="py-8 items-center">
                            <Text className="text-slate-400">No clients found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full items-center justify-center shadow-lg"
                onPress={() => navigation.navigate('AddClient')}
            >
                <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>
        </View>
    );
}
