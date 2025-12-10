import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLogin } from '../lib/api-hooks';

export default function LoginScreen({ navigation }: any) {
    const loginMutation = useLogin();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
            className="flex-1 bg-slate-900"
        >
            <View className="flex-1 justify-center px-8">
                {/* Logo */}
                <View className="items-center mb-12">
                    <View className="w-20 h-20 rounded-full bg-emerald-500 items-center justify-center mb-4">
                        <Text className="text-3xl">🥗</Text>
                    </View>
                    <Text className="text-3xl font-bold text-white">Diet Management</Text>
                    <Text className="text-slate-400 mt-2">Sign in to continue</Text>
                </View>

                {/* Error */}
                {error ? (
                    <View className="bg-red-500/20 rounded-xl p-4 mb-4">
                        <Text className="text-red-400 text-center">{error}</Text>
                    </View>
                ) : null}

                {/* Form */}
                <View className="space-y-4">
                    <View>
                        <Text className="text-slate-400 mb-2">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="admin@dietapp.com"
                            placeholderTextColor="#64748b"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white"
                        />
                    </View>

                    <View className="mt-4">
                        <Text className="text-slate-400 mb-2">Password</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#64748b"
                            secureTextEntry
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loginMutation.isPending}
                        className="bg-emerald-500 rounded-xl py-4 mt-6"
                    >
                        {loginMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-semibold text-lg">
                                Sign In
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Demo credentials */}
                <View className="mt-8 bg-white/5 rounded-xl p-4">
                    <Text className="text-slate-400 text-center text-sm mb-2">Demo Credentials:</Text>
                    <Text className="text-slate-300 text-center text-sm">
                        admin@dietapp.com / Admin123!@#
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
