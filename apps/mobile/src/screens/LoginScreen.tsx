import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { useLogin } from '../lib/api-hooks';
import { HeartIcon, EnvelopeIcon, LockClosedIcon } from 'react-native-heroicons/outline';
import { Checkbox } from 'expo-checkbox'; // Assuming expo-checkbox is installed

export default function LoginScreen({ navigation }: any) {
    const loginMutation = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async () => {
        setError('');
        try {
            await loginMutation.mutateAsync({ email, password });
            navigation.replace('MainTabs');
        } catch (err: any) {
            setError(err.detail || err.message || 'Login failed');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-900"
        >
            <View className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 opacity-90"></View>

            <View className="flex-1 justify-center px-8 relative z-10">
                {/* Logo */}
                <View className="items-center mb-12">
                    <View className="w-24 h-24 rounded-full bg-secondary-400 items-center justify-center mb-4 shadow-lg">
                        <HeartIcon size={48} color="#ffffff" />
                    </View>
                    <Text className="text-4xl font-extrabold text-white mb-2">Diet Management</Text>
                    <Text className="text-gray-300 text-lg">Sign in to your account</Text>
                </View>

                {/* Login Form Container */}
                <View className="bg-gray-800/60 rounded-3xl p-8 shadow-2xl backdrop-blur-lg border border-gray-700/50">
                    {/* Error */}
                    {error ? (
                        <View className="bg-red-500/20 rounded-xl p-4 mb-6">
                            <Text className="text-red-400 text-center font-medium">{error}</Text>
                        </View>
                    ) : null}

                    {/* Form Fields */}
                    <View className="mb-6">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Email Address</Text>
                        <View className="flex-row items-center bg-gray-700 rounded-xl px-4 border border-gray-600">
                            <EnvelopeIcon size={20} color="#a1a1aa" className="mr-3" />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="admin@dietapp.com"
                                placeholderTextColor="#a1a1aa"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="flex-1 text-white text-base py-3"
                            />
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Password</Text>
                        <View className="flex-row items-center bg-gray-700 rounded-xl px-4 border border-gray-600">
                            <LockClosedIcon size={20} color="#a1a1aa" className="mr-3" />
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#a1a1aa"
                                secureTextEntry
                                className="flex-1 text-white text-base py-3"
                            />
                        </View>
                    </View>

                    {/* Remember me and Forgot password */}
                    <View className="flex-row justify-between items-center mb-8">
                        <TouchableOpacity className="flex-row items-center" onPress={() => setRememberMe(!rememberMe)}>
                            <Checkbox
                                value={rememberMe}
                                onValueChange={setRememberMe}
                                color={rememberMe ? '#34d399' : '#a1a1aa'}
                                className="rounded-md mr-2"
                            />
                            <Text className="text-gray-300 text-sm">Remember me</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text className="text-primary-400 text-sm font-semibold">Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loginMutation.isPending}
                        className="bg-gradient-to-r from-secondary-500 to-primary-500 rounded-xl py-4 shadow-lg active:from-secondary-600 active:to-primary-600"
                    >
                        {loginMutation.isPending ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">
                                Sign In
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Demo credentials */}
                    <View className="mt-8 bg-gray-700/50 rounded-xl p-4">
                        <Text className="text-gray-300 text-center text-sm mb-3">Demo Credentials:</Text>
                        <View className="flex-row justify-center space-x-4">
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs">Admin</Text>
                                <Text className="text-white font-medium text-sm">admin@dietapp.com</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-gray-400 text-xs">Password</Text>
                                <Text className="text-white font-medium text-sm">Admin123!@#</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    // No custom styles needed beyond NativeWind
});
