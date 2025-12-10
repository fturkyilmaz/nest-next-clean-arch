import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useCreateClient, useCurrentUser } from '../lib/api-hooks';

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

    return (
        <View className="flex-1 bg-slate-900">
            <View className="px-4 py-4 pt-12 border-b border-white/10 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-white text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">New Client</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                        <ActivityIndicator color="#10b981" />
                    ) : (
                        <Text className="text-emerald-400 text-lg font-bold">Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                <View className="space-y-4 mb-8">
                    <Text className="text-slate-400 uppercase text-xs font-bold mb-2">Personal Info</Text>

                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-white mb-1">First Name *</Text>
                            <TextInput
                                value={form.firstName}
                                onChangeText={(t) => handleChange('firstName', t)}
                                placeholder="John"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-1">Last Name *</Text>
                            <TextInput
                                value={form.lastName}
                                onChangeText={(t) => handleChange('lastName', t)}
                                placeholder="Doe"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-white mb-1">Email *</Text>
                        <TextInput
                            value={form.email}
                            onChangeText={(t) => handleChange('email', t)}
                            placeholder="john@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#64748b"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                        />
                    </View>

                    <View>
                        <Text className="text-white mb-1">Phone</Text>
                        <TextInput
                            value={form.phone}
                            onChangeText={(t) => handleChange('phone', t)}
                            placeholder="+1 234 567 8900"
                            keyboardType="phone-pad"
                            placeholderTextColor="#64748b"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                        />
                    </View>

                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-white mb-1">Date of Birth</Text>
                            <TextInput
                                value={form.dateOfBirth}
                                onChangeText={(t) => handleChange('dateOfBirth', t)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-1">Gender</Text>
                            <View className="flex-row bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                {['MALE', 'FEMALE'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        onPress={() => handleChange('gender', g)}
                                        className={`flex-1 py-3 items-center ${form.gender === g ? 'bg-emerald-500' : ''}`}
                                    >
                                        <Text className={form.gender === g ? 'text-white font-bold' : 'text-slate-400'}>
                                            {g === 'MALE' ? 'M' : 'F'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View className="space-y-4 mb-12">
                    <Text className="text-slate-400 uppercase text-xs font-bold mb-2">Medical Info</Text>

                    <View>
                        <Text className="text-white mb-1">Allergies (comma separated)</Text>
                        <TextInput
                            value={form.allergies}
                            onChangeText={(t) => handleChange('allergies', t)}
                            placeholder="Peanuts, Shellfish..."
                            placeholderTextColor="#64748b"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                        />
                    </View>

                    <View>
                        <Text className="text-white mb-1">Conditions</Text>
                        <TextInput
                            value={form.conditions}
                            onChangeText={(t) => handleChange('conditions', t)}
                            placeholder="Diabetes, Hypertension..."
                            placeholderTextColor="#64748b"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                        />
                    </View>

                    <View>
                        <Text className="text-white mb-1">Medications</Text>
                        <TextInput
                            value={form.medications}
                            onChangeText={(t) => handleChange('medications', t)}
                            placeholder="Insulin, Aspirin..."
                            placeholderTextColor="#64748b"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                        />
                    </View>

                    <View>
                        <Text className="text-white mb-1">Notes</Text>
                        <TextInput
                            value={form.notes}
                            onChangeText={(t) => handleChange('notes', t)}
                            placeholder="Additional client notes..."
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#64748b"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-top h-24"
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
