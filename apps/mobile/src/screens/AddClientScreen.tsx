import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useCreateClient, useCurrentUser } from '../lib/api-hooks';
import { ChevronLeftIcon, CheckIcon, UserIcon, EnvelopeIcon, PhoneIcon, CalendarIcon, IdentificationIcon, TagIcon, DocumentTextIcon } from 'react-native-heroicons/outline';

export default function AddClientScreen({ navigation }: any) {
    const createMutation = useCreateClient();
    const { data: currentUser } = useCurrentUser();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'MALE',
        allergies: '',
        conditions: '',
        medications: '',
        notes: ''
    });

    const handleChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!form.firstName || !form.lastName || !form.email) {
            Alert.alert('Error', 'Please fill in all required fields (Name, Email)');
            return;
        }

        if (!currentUser?.id) {
            Alert.alert('Error', 'Could not identify current user. Please re-login.');
            return;
        }

        try {
            await createMutation.mutateAsync({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: form.phone || undefined,
                dateOfBirth: form.dateOfBirth || undefined,
                gender: form.gender as any,
                dietitianId: currentUser.id,
                allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()) : [],
                conditions: form.conditions ? form.conditions.split(',').map(s => s.trim()) : [],
                medications: form.medications ? form.medications.split(',').map(s => s.trim()) : [],
                notes: form.notes || undefined
            });
            Alert.alert('Success', 'Client created successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.detail || err.message || 'Failed to create client');
        }
    };

    // Custom Input Component
    const CustomInput = ({ label, placeholder, value, onChangeText, keyboardType, autoCapitalize, multiline, numberOfLines, icon }: {
        label: string;
        placeholder?: string;
        value: string;
        onChangeText: (text: string) => void;
        keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
        autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
        multiline?: boolean;
        numberOfLines?: number;
        icon?: React.ReactNode;
    }) => (
        <View className="mb-5">
            <Text className="text-gray-300 text-base font-semibold mb-2">{label}</Text>
            <View className="flex-row items-center bg-gray-800 rounded-xl px-4 border border-gray-700">
                {icon && <View className="mr-3">{icon}</View>}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
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
        </View>
    );

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 bg-gray-900 flex-row items-center justify-between border-b border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <ChevronLeftIcon size={24} color="#d1d5db" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-white">Add New Client</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={createMutation.isPending} className="p-2 -mr-2">
                    {createMutation.isPending ? (
                        <ActivityIndicator color="#34d399" />
                    ) : (
                        <CheckIcon size={24} color="#34d399" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-md">
                    <Text className="text-xl font-bold text-white mb-5">Personal Information</Text>

                    <CustomInput
                        label="First Name *"
                        placeholder="John"
                        value={form.firstName}
                        onChangeText={(t) => handleChange('firstName', t)}
                        icon={<UserIcon size={20} color="#a1a1aa" />}
                    />
                    <CustomInput
                        label="Last Name *"
                        placeholder="Doe"
                        value={form.lastName}
                        onChangeText={(t) => handleChange('lastName', t)}
                        icon={<UserIcon size={20} color="#a1a1aa" />}
                    />
                    <CustomInput
                        label="Email *"
                        placeholder="john@example.com"
                        value={form.email}
                        onChangeText={(t) => handleChange('email', t)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon={<EnvelopeIcon size={20} color="#a1a1aa" />}
                    />
                    <CustomInput
                        label="Phone"
                        placeholder="+1 234 567 8900"
                        value={form.phone}
                        onChangeText={(t) => handleChange('phone', t)}
                        keyboardType="phone-pad"
                        icon={<PhoneIcon size={20} color="#a1a1aa" />}
                    />

                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <Text className="text-gray-300 text-base font-semibold mb-2">Date of Birth</Text>
                            <View className="flex-row items-center bg-gray-800 rounded-xl px-4 border border-gray-700">
                                <CalendarIcon size={20} color="#a1a1aa" className="mr-3" />
                                <TextInput
                                    value={form.dateOfBirth}
                                    onChangeText={(t) => handleChange('dateOfBirth', t)}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#a1a1aa"
                                    className="flex-1 text-white text-base py-3"
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-300 text-base font-semibold mb-2">Gender</Text>
                            <View className="flex-row bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                                {['MALE', 'FEMALE'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        onPress={() => handleChange('gender', g)}
                                        className={`flex-1 py-3 items-center ${
                                            form.gender === g ? 'bg-primary-600' : ''
                                        }`}
                                    >
                                        <Text className={`text-base font-bold ${form.gender === g ? 'text-white' : 'text-gray-400'}`}>
                                            {g === 'MALE' ? 'M' : 'F'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-md">
                    <Text className="text-xl font-bold text-white mb-5">Medical Information</Text>

                    <CustomInput
                        label="Allergies (comma separated)"
                        placeholder="Peanuts, Shellfish..."
                        value={form.allergies}
                        onChangeText={(t) => handleChange('allergies', t)}
                        icon={<TagIcon size={20} color="#a1a1aa" />}
                    />
                    <CustomInput
                        label="Conditions (comma separated)"
                        placeholder="Diabetes, Hypertension..."
                        value={form.conditions}
                        onChangeText={(t) => handleChange('conditions', t)}
                        icon={<IdentificationIcon size={20} color="#a1a1aa" />}
                    />
                    <CustomInput
                        label="Medications (comma separated)"
                        placeholder="Insulin, Aspirin..."
                        value={form.medications}
                        onChangeText={(t) => handleChange('medications', t)}
                        icon={<TagIcon size={20} color="#a1a1aa" />}
                    />
                    <CustomInput
                        label="Notes"
                        placeholder="Additional client notes..."
                        value={form.notes}
                        onChangeText={(t) => handleChange('notes', t)}
                        multiline
                        numberOfLines={4}
                        icon={<DocumentTextIcon size={20} color="#a1a1aa" />}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
