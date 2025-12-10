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
import { useUsers } from '../lib/api-hooks';

export default function UsersScreen({ navigation }: any) {
    const { data: users, isLoading, refetch } = useUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const filteredUsers = users?.filter((user: any) =>
        `${user.firstName} ${user.lastName} ${user.email}`
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
            {/* Header */}
            <View className="px-4 pt-12 pb-4 bg-slate-800">
                <Text className="text-white text-2xl font-bold">Users</Text>
            </View>

            {/* Search */}
            <View className="px-4 pt-4 pb-2">
                <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Search users..."
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
                        filteredUsers?.map((user: any) => (
                            <View
                                key={user.id}
                                className="bg-white/5 rounded-2xl p-4 mb-3"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 rounded-full bg-indigo-500/20 items-center justify-center mr-3">
                                        <Text className="text-indigo-400 text-lg font-semibold">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-lg">
                                            {user.firstName} {user.lastName}
                                        </Text>
                                        <Text className="text-slate-400">{user.email}</Text>
                                    </View>
                                    <View className="items-end">
                                        <View className={`px-2 py-1 rounded-full mb-1 ${user.role === 'ADMIN' ? 'bg-purple-500/20' :
                                                user.role === 'DIETITIAN' ? 'bg-blue-500/20' : 'bg-green-500/20'
                                            }`}>
                                            <Text className={`text-xs ${user.role === 'ADMIN' ? 'text-purple-400' :
                                                    user.role === 'DIETITIAN' ? 'text-blue-400' : 'text-green-400'
                                                }`}>
                                                {user.role}
                                            </Text>
                                        </View>
                                        <View className={`px-2 py-1 rounded-full ${user.isActive ? 'bg-emerald-500/20' : 'bg-slate-500/20'}`}>
                                            <Text className={user.isActive ? 'text-emerald-400 text-xs' : 'text-slate-400 text-xs'}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}

                    {filteredUsers?.length === 0 && !isLoading && (
                        <View className="py-8 items-center">
                            <Text className="text-slate-400">No users found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
