import React from 'react';
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
import { HeartIcon, EnvelopeIcon, LockClosedIcon } from 'react-native-heroicons/outline';
import { Checkbox } from 'expo-checkbox';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormInputs } from '../lib/validationSchemas';

export default function LoginScreen({ navigation }: any) {
    const loginMutation = useLogin();
    const [rememberMe, setRememberMe] = React.useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            "email": "admin@test.com",
            "password": "Admin123!@#"
        },
    });

    const handleLogin = async (data: LoginFormInputs) => {
        try {
            const response = await loginMutation.mutateAsync(data);

            console.log("first", response)
            navigation.replace('MainTabs');
        } catch (err: any) {
            console.error("Login failed:", err);
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
                    {/* Form Fields */}
                    <View className="mb-6">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Email</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View className="flex-row items-center bg-gray-700 rounded-xl px-4 border border-gray-600">
                                    <EnvelopeIcon size={20} color="#a1a1aa" className="mr-3" />
                                    <TextInput
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="admin@dietapp.com"
                                        placeholderTextColor="#a1a1aa"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        className="flex-1 text-white text-base py-3"
                                    />
                                </View>
                            )}
                        />
                        {errors.email && <Text className="text-red-400 text-sm mt-1">{errors.email.message}</Text>}
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Password</Text>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View className="flex-row items-center bg-gray-700 rounded-xl px-4 border border-gray-600">
                                    <LockClosedIcon size={20} color="#a1a1aa" className="mr-3" />
                                    <TextInput
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="••••••••"
                                        placeholderTextColor="#a1a1aa"
                                        secureTextEntry
                                        className="flex-1 text-white text-base py-3"
                                    />
                                </View>
                            )}
                        />
                        {errors.password && <Text className="text-red-400 text-sm mt-1">{errors.password.message}</Text>}
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
                        onPress={handleSubmit(handleLogin)}
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