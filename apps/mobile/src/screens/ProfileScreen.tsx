import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useCurrentUser, useLogout, clearTokens } from '../lib/api-hooks';

export default function ProfileScreen({ navigation }: any) {
    const { data: user, isLoading } = useCurrentUser();
    const logoutMutation = useLogout();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logoutMutation.mutateAsync();
                        navigation.replace('Login');
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-900 items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-slate-900">
            <View className="px-4 pt-8 pb-24">
                {/* Profile Header */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 items-center justify-center mb-4">
                        <Text className="text-white text-3xl font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Text>
                    </View>
                    <Text className="text-2xl font-bold text-white">
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text className="text-slate-400 mt-1">{user?.email}</Text>
                    <View className="bg-emerald-500/20 px-3 py-1 rounded-full mt-2">
                        <Text className="text-emerald-400 text-sm">{user?.role}</Text>
                    </View>
                </View>

                {/* Account Info */}
                <View className="bg-white/5 rounded-2xl p-4 mb-4">
                    <Text className="text-slate-400 text-sm mb-4">Account Information</Text>

                    <View className="flex-row justify-between py-3 border-b border-white/10">
                        <Text className="text-slate-400">Email</Text>
                        <Text className="text-white">{user?.email}</Text>
                    </View>

                    <View className="flex-row justify-between py-3 border-b border-white/10">
                        <Text className="text-slate-400">Role</Text>
                        <Text className="text-white">{user?.role}</Text>
                    </View>

                    <View className="flex-row justify-between py-3 border-b border-white/10">
                        <Text className="text-slate-400">Status</Text>
                        <Text className={user?.isActive ? 'text-emerald-400' : 'text-red-400'}>
                            {user?.isActive ? 'Active' : 'Inactive'}
                        </Text>
                    </View>

                    <View className="flex-row justify-between py-3">
                        <Text className="text-slate-400">Member Since</Text>
                        <Text className="text-white">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </Text>
                    </View>
                </View>

                {/* Settings */}
                <View className="bg-white/5 rounded-2xl overflow-hidden mb-4">
                    <Text className="text-slate-400 text-sm p-4 pb-2">Settings</Text>

                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-white/10">
                        <View className="flex-row items-center">
                            <Text className="text-lg mr-3">🔔</Text>
                            <Text className="text-white">Notifications</Text>
                        </View>
                        <Text className="text-slate-400">→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-white/10">
                        <View className="flex-row items-center">
                            <Text className="text-lg mr-3">🔐</Text>
                            <Text className="text-white">Change Password</Text>
                        </View>
                        <Text className="text-slate-400">→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center">
                            <Text className="text-lg mr-3">🌙</Text>
                            <Text className="text-white">Dark Mode</Text>
                        </View>
                        <View className="bg-emerald-500 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs">On</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Support */}
                <View className="bg-white/5 rounded-2xl overflow-hidden mb-8">
                    <Text className="text-slate-400 text-sm p-4 pb-2">Support</Text>

                    <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-white/10">
                        <View className="flex-row items-center">
                            <Text className="text-lg mr-3">❓</Text>
                            <Text className="text-white">Help Center</Text>
                        </View>
                        <Text className="text-slate-400">→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center">
                            <Text className="text-lg mr-3">📋</Text>
                            <Text className="text-white">Terms & Privacy</Text>
                        </View>
                        <Text className="text-slate-400">→</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-500/20 rounded-2xl py-4"
                >
                    <Text className="text-red-400 text-center font-semibold">Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text className="text-slate-500 text-center mt-6 text-sm">
                    Version 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}
