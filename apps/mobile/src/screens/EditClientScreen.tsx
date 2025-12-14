import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useClient, useUpdateClient } from '../lib/api-hooks';
import { ChevronLeftIcon, CheckIcon, UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, IdentificationIcon, TagIcon, DocumentTextIcon } from 'react-native-heroicons/outline';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateClientSchema, UpdateClientFormInputs } from '../lib/validationSchemas';

// Custom Input Component (reused from AddClientScreen.tsx, assuming it's defined elsewhere or in a shared component)
const CustomInput = ({ label, placeholder, keyboardType, autoCapitalize, multiline, numberOfLines, icon, onChange, onBlur, value, error }: {
    label: string;
    placeholder?: string;
    onChange: (...event: any[]) => void;
    onBlur: (...event: any[]) => void;
    value: string;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    multiline?: boolean;
    numberOfLines?: number;
    icon?: React.ReactNode;
    error?: string;
}) => (
    <View className="mb-5">
        <Text className="text-gray-300 text-base font-semibold mb-2">{label}</Text>
        <View className="flex-row items-center bg-gray-800 rounded-xl px-4 border border-gray-700">
            {icon && <View className="mr-3">{icon}</View>}
            <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder={placeholder}
                placeholderTextColor="#a1a1aa"
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                multiline={multiline}
                numberOfLines={numberOfLines}
                className={`flex-1 text-white text-base py-3 ${multiline ? 'h-24 align-top' : ''}`}
                style={multiline ? { textAlignVertical: 'top' } : {}}
            />
        </View>
        {error && <Text className="text-red-400 text-sm mt-1">{error}</Text>}
    </View>
);

export default function EditClientScreen({ route, navigation }: any) {
    const { clientId } = route.params;
    const { data: client, isLoading, error: fetchError } = useClient(clientId);
    const updateMutation = useUpdateClient(clientId);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<UpdateClientFormInputs>({
        resolver: zodResolver(updateClientSchema),
    });

    useEffect(() => {
        if (client) {
            reset({
                firstName: client.firstName,
                lastName: client.lastName,
                phone: client.phone || '',
                dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '',
                gender: client.gender || 'MALE',
                allergies: client.allergies ? client.allergies.join(', ') : '',
                conditions: client.conditions ? client.conditions.join(', ') : '',
                medications: client.medications ? client.medications.join(', ') : '',
                notes: client.notes || '',
            });
        }
    }, [client, reset]);

    const onSubmit = async (data: UpdateClientFormInputs) => {
        try {
            await updateMutation.mutateAsync({
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone || undefined,
                dateOfBirth: data.dateOfBirth || undefined,
                gender: data.gender,
                allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()) : [],
                conditions: data.conditions ? data.conditions.split(',').map(s => s.trim()) : [],
                medications: data.medications ? data.medications.split(',').map(s => s.trim()) : [],
                notes: data.notes || undefined,
            });
            Alert.alert('Success', 'Client updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.detail || err.message || 'Failed to update client');
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (fetchError || !client) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center p-6">
                <Text className="text-red-400 text-lg mb-4">Error loading client profile. Please try again.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-primary-700 px-6 py-3 rounded-full shadow-md active:bg-primary-600">
                    <Text className="text-white font-semibold text-base">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 flex-row items-center justify-between border-b border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeftIcon size={24} color="#d1d5db" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white ml-3">Edit Client</Text>
                <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className="p-2 -mr-2">
                    {updateMutation.isPending ? (
                        <ActivityIndicator color="#34d399" />
                    ) : (
                        <CheckIcon size={24} color="#34d399" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-md">
                    <Text className="text-xl font-bold text-white mb-5">Personal Information</Text>

                    <Controller
                        control={control}
                        name="firstName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="First Name *"
                                placeholder="John"
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                icon={<UserIcon size={20} color="#a1a1aa" />}
                                error={errors.firstName?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="lastName"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Last Name *"
                                placeholder="Doe"
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                icon={<UserIcon size={20} color="#a1a1aa" />}
                                error={errors.lastName?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="phone"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Phone"
                                placeholder="+1 234 567 8900"
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                keyboardType="phone-pad"
                                icon={<PhoneIcon size={20} color="#a1a1aa" />}
                                error={errors.phone?.message}
                            />
                        )}
                    />

                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <Text className="text-gray-300 text-base font-semibold mb-2">Date of Birth</Text>
                            <Controller
                                control={control}
                                name="dateOfBirth"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View className="flex-row items-center bg-gray-800 rounded-xl px-4 border border-gray-700">
                                        <CalendarIcon size={20} color="#a1a1aa" className="mr-3" />
                                        <TextInput
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor="#a1a1aa"
                                            className="flex-1 text-white text-base py-3"
                                        />
                                    </View>
                                )}
                            />
                            {errors.dateOfBirth && <Text className="text-red-400 text-sm mt-1">{errors.dateOfBirth.message}</Text>}
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-300 text-base font-semibold mb-2">Gender</Text>
                            <Controller
                                control={control}
                                name="gender"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                        {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                                            <TouchableOpacity
                                                key={g}
                                                onPress={() => onChange(g)}
                                                className={`flex-1 py-3 items-center ${
                                                    value === g ? 'bg-primary-600' : ''
                                                }`}
                                            >
                                                <Text className={`text-base font-bold ${value === g ? 'text-white' : 'text-gray-400'}`}>
                                                    {g === 'MALE' ? 'M' : g === 'FEMALE' ? 'F' : 'O'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            />
                            {errors.gender && <Text className="text-red-400 text-sm mt-1">{errors.gender.message}</Text>}
                        </View>
                    </View>
                </View>

                <View className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-md">
                    <Text className="text-xl font-bold text-white mb-5">Medical Information</Text>

                    <Controller
                        control={control}
                        name="allergies"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Allergies (comma separated)"
                                placeholder="Peanuts, Shellfish..."
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                icon={<TagIcon size={20} color="#a1a1aa" />}
                                error={errors.allergies?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="conditions"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Conditions (comma separated)"
                                placeholder="Diabetes, Hypertension..."
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                icon={<IdentificationIcon size={20} color="#a1a1aa" />}
                                error={errors.conditions?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="medications"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Medications (comma separated)"
                                placeholder="Insulin, Aspirin..."
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                icon={<TagIcon size={20} color="#a1a1aa" />}
                                error={errors.medications?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="notes"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Notes"
                                placeholder="Additional client notes..."
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                multiline
                                numberOfLines={4}
                                icon={<DocumentTextIcon size={20} color="#a1a1aa" />}
                                error={errors.notes?.message}
                            />
                        )}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
