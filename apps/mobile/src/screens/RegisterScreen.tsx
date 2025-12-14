import React from 'react';
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
import { useRegister } from '../lib/api-hooks'; // Assuming useRegister hook exists or will be created
import { HeartIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from 'react-native-heroicons/outline';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registrationSchema, RegistrationFormInputs } from '../lib/validationSchemas';

export default function RegisterScreen({ navigation }: any) {
    const registerMutation = useRegister(); // This will need to be implemented or mocked

    const { control, handleSubmit, formState: { errors } } = useForm<RegistrationFormInputs>({
        resolver: zodResolver(registrationSchema),
    });

    const handleRegister = async (data: RegistrationFormInputs) => {
        try {
            await registerMutation.mutateAsync(data);
            navigation.replace('Login'); // Redirect to login after successful registration
        } catch (err: any) {
            console.error("Registration failed:", err);
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
                    <Text className="text-gray-300 text-lg">Create a new account</Text>
                </View>

                {/* Registration Form Container */}
                <View className="bg-gray-800/60 rounded-3xl p-8 shadow-2xl backdrop-blur-lg border border-gray-700/50">
                    {/* Error handling can be added here if needed for server-side errors */}

                    {/* Form Fields */}
                    <View className="mb-6">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Full Name</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View className="flex-row items-center bg-gray-700 rounded-xl px-4 border border-gray-600">
                                    <UserIcon size={20} color="#a1a1aa" className="mr-3" />
                                    <TextInput
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        placeholder="John Doe"
                                        placeholderTextColor="#a1a1aa"
                                        autoCapitalize="words"
                                        className="flex-1 text-white text-base py-3"
                                    />
                                </View>
                            )}
                        />
                        {errors.name && <Text className="text-red-400 text-sm mt-1">{errors.name.message}</Text>}
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Email Address</Text>
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
                                        placeholder="john.doe@example.com"
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

                    <View className="mb-8">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Confirm Password</Text>
                        <Controller
                            control={control}
                            name="confirmPassword"
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
                        {errors.confirmPassword && <Text className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</Text>}
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        onPress={handleSubmit(handleRegister)}
                        disabled={registerMutation.isPending}
                        className="bg-gradient-to-r from-secondary-500 to-primary-500 rounded-xl py-4 shadow-lg active:from-secondary-600 active:to-primary-600"
                    >
                        {registerMutation.isPending ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">
                                Register
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View className="mt-8 text-center">
                        <Text className="text-gray-300 text-base">
                            Already have an account? {' '}
                            <Text
                                className="text-primary-400 font-semibold"
                                onPress={() => navigation.navigate('Login')}
                            >
                                Sign In
                            </Text>
                        </Text>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}