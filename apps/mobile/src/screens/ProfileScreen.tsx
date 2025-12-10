import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {
    UserCircleIcon,
    EnvelopeIcon,
    TagIcon,
    PowerIcon,
    CalendarDaysIcon,
    BellIcon,
    LockClosedIcon,
    MoonIcon,
    QuestionMarkCircleIcon,
    ClipboardDocumentListIcon,
    ArrowRightIcon,
} from 'react-native-heroicons/outline';
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
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 border-b border-gray-800">
                <Text className="text-3xl font-bold text-white mb-2">Profile</Text>
                <Text className="text-gray-400 text-base">Manage your account and settings.</Text>
            </View>

            <View className="p-6 pb-24">
                {/* Profile Header */}
                <View className="items-center mb-8 bg-gray-800 rounded-2xl p-6 shadow-md">
                    <View className="w-28 h-28 rounded-full bg-primary-600 items-center justify-center mb-4 shadow-lg">
                        <Text className="text-white text-4xl font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Text>
                    </View>
                    <Text className="text-3xl font-bold text-white mb-1">
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text className="text-gray-400 text-base">{user?.email}</Text>
                    <View className="bg-secondary-500/20 px-4 py-1 rounded-full mt-3">
                        <Text className="text-secondary-400 text-sm font-semibold">{user?.role}</Text>
                    </View>
                </View>

                {/* Account Info */}
                <View className="bg-gray-800 rounded-2xl p-6 mb-6 shadow-md">
                    <Text className="text-xl font-bold text-white mb-4">Account Information</Text>

                    <InfoRow icon={<EnvelopeIcon size={20} color="#a1a1aa" />} label="Email" value={user?.email} />
                    <InfoRow icon={<TagIcon size={20} color="#a1a1aa" />} label="Role" value={user?.role} />
                    <InfoRow icon={<PowerIcon size={20} color="#a1a1aa" />} label="Status" value={user?.isActive ? 'Active' : 'Inactive'} valueColor={user?.isActive ? 'text-secondary-400' : 'text-red-400'} />
                    <InfoRow icon={<CalendarDaysIcon size={20} color="#a1a1aa" />} label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'} isLast={true} />
                </View>

                {/* Settings */}
                <View className="bg-gray-800 rounded-2xl overflow-hidden mb-6 shadow-md">
                    <Text className="text-xl font-bold text-white p-6 pb-4">Settings</Text>

                    <SettingItem icon={<BellIcon size={20} color="#a1a1aa" />} label="Notifications" value="" />
                    <SettingItem icon={<LockClosedIcon size={20} color="#a1a1aa" />} label="Change Password" value="" />
                    <SettingItem icon={<MoonIcon size={20} color="#a1a1aa" />} label="Dark Mode" value="On" isLast={true} />
                </View>

                {/* Support */}
                <View className="bg-gray-800 rounded-2xl overflow-hidden mb-8 shadow-md">
                    <Text className="text-xl font-bold text-white p-6 pb-4">Support</Text>

                    <SettingItem icon={<QuestionMarkCircleIcon size={20} color="#a1a1aa" />} label="Help Center" value="" />
                    <SettingItem icon={<ClipboardDocumentListIcon size={20} color="#a1a1aa" />} label="Terms & Privacy" value="" isLast={true} />
                </View>

                {/* Logout */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-600/20 rounded-2xl py-4 shadow-md active:bg-red-700/20"
                >
                    <Text className="text-red-400 text-center font-bold text-base">Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text className="text-gray-500 text-center mt-8 text-sm">
                    Version 1.0.0
                </Text>
            </View>
        </ScrollView>
    );
}

// Helper component for information rows
function InfoRow({ icon, label, value, valueColor, isLast }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    valueColor?: string;
    isLast?: boolean;
}) {
    return (
        <View className={`flex-row justify-between items-center py-3 ${!isLast ? 'border-b border-gray-700' : ''}`}>
            <View className="flex-row items-center">
                {icon}
                <Text className="text-gray-300 text-base ml-3">{label}</Text>
            </View>
            <Text className={`text-white font-medium text-base ${valueColor}`}>{value}</Text>
        </View>
    );
}

// Helper component for setting items
function SettingItem({ icon, label, value, isLast }: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    isLast?: boolean;
}) {
    return (
        <TouchableOpacity className={`flex-row items-center justify-between p-4 active:bg-gray-700 ${!isLast ? 'border-b border-gray-700' : ''}`}>
            <View className="flex-row items-center">
                {icon}
                <Text className="text-white text-base ml-3">{label}</Text>
            </View>
            {value ? (
                <View className="bg-secondary-500/20 px-3 py-1 rounded-full">
                    <Text className="text-secondary-400 text-xs font-semibold">{value}</Text>
                </View>
            ) : (
                <ArrowRightIcon size={16} color="#a1a1aa" />
            )}
        </TouchableOpacity>
    );
}
