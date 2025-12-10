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
import { MagnifyingGlassIcon, UserIcon, ArrowRightIcon } from 'react-native-heroicons/outline';

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
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 border-b border-gray-800">
                <Text className="text-3xl font-bold text-white mb-2">Users</Text>
                <Text className="text-gray-400 text-base">Manage all application users.</Text>
            </View>

            {/* Search */}
            <View className="px-6 pt-4 pb-4">
                <View className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
                    <MagnifyingGlassIcon size={20} color="#a1a1aa" className="mr-3" />
                    <TextInput
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        placeholder="Search users..."
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
                        filteredUsers?.map((user: any) => (
                            <TouchableOpacity
                                key={user.id}
                                className="bg-gray-800 rounded-2xl p-4 mb-4 shadow-md active:bg-gray-700"
                                // Assuming there might be a UserDetailScreen in the future
                                // onPress={() => navigation.navigate('UserDetail', { userId: user.id })}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 rounded-full bg-primary-500 items-center justify-center mr-4 shadow-sm">
                                        <Text className="text-white text-xl font-bold">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold text-lg">
                                            {user.firstName} {user.lastName}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">{user.email}</Text>
                                    </View>
                                    <View className="items-end">
                                        <View className={`px-3 py-1 rounded-full mb-2 ${
                                                user.role === 'ADMIN' ? 'bg-purple-500/20' :
                                                user.role === 'DIETITIAN' ? 'bg-blue-500/20' : 'bg-green-500/20'
                                            }`}>
                                            <Text className={`text-xs font-semibold ${
                                                    user.role === 'ADMIN' ? 'text-purple-400' :
                                                    user.role === 'DIETITIAN' ? 'text-blue-400' : 'text-green-400'
                                                }`}>
                                                {user.role}
                                            </Text>
                                        </View>
                                        <View className={`px-3 py-1 rounded-full ${user.isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                            <Text className={`text-xs ${user.isActive ? 'text-emerald-400' : 'text-red-400'} font-semibold`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}

                    {filteredUsers?.length === 0 && !isLoading && (
                        <View className="py-12 items-center">
                            <Text className="text-gray-400 text-base">No users found.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
