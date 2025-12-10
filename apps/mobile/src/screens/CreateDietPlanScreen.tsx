import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { useCreateDietPlan, useClients } from '../lib/api-hooks';

export default function CreateDietPlanScreen({ navigation }: any) {
    const createMutation = useCreateDietPlan();
    const { data: clients, isLoading: loadingClients } = useClients();

    // Simple state for client selection modal
    const [showClientModal, setShowClientModal] = useState(false);

    const [form, setForm] = useState({
        name: '',
        description: '',
        clientId: '',
        clientName: '', // store name for display
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        targetCalories: '',
        targetProtein: '',
        targetCarbs: '',
        targetFat: '',
        targetFiber: ''
    });

    const handleChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const selectClient = (client: any) => {
        setForm(prev => ({
            ...prev,
            clientId: client.id,
            clientName: `${client.firstName} ${client.lastName}`
        }));
        setShowClientModal(false);
    };

    const handleSubmit = async () => {
        if (!form.name || !form.clientId || !form.startDate) {
            Alert.alert('Error', 'Please fill in Name, Client, and Start Date');
            return;
        }

        const nutritionalGoals = {
            targetCalories: form.targetCalories ? Number(form.targetCalories) : undefined,
            targetProtein: form.targetProtein ? Number(form.targetProtein) : undefined,
            targetCarbs: form.targetCarbs ? Number(form.targetCarbs) : undefined,
            targetFat: form.targetFat ? Number(form.targetFat) : undefined,
            targetFiber: form.targetFiber ? Number(form.targetFiber) : undefined,
        };

        try {
            await createMutation.mutateAsync({
                name: form.name,
                description: form.description,
                clientId: form.clientId,
                startDate: form.startDate,
                endDate: form.endDate || undefined,
                nutritionalGoals: Object.values(nutritionalGoals).some(v => v !== undefined) ? nutritionalGoals : undefined
            });
            Alert.alert('Success', 'Diet Plan created!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.detail || err.message || 'Failed to create plan');
        }
    };

    return (
        <View className="flex-1 bg-slate-900">
            <View className="px-4 py-4 pt-12 border-b border-white/10 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-white text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">New Plan</Text>
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
                    <Text className="text-slate-400 uppercase text-xs font-bold mb-2">Plan Details</Text>

                    <View>
                        <Text className="text-white mb-1">Client *</Text>
                        <TouchableOpacity
                            onPress={() => setShowClientModal(true)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                        >
                            <Text className={form.clientName ? 'text-white' : 'text-slate-500'}>
                                {form.clientName || 'Select a Client...'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text className="text-white mb-1">Plan Name *</Text>
                        <TextInput
                            value={form.name}
                            onChangeText={(t) => handleChange('name', t)}
                            placeholder="e.g. Keto Phase 1"
                            placeholderTextColor="#64748b"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                        />
                    </View>

                    <View>
                        <Text className="text-white mb-1">Description</Text>
                        <TextInput
                            value={form.description}
                            onChangeText={(t) => handleChange('description', t)}
                            placeholder="Description..."
                            multiline
                            numberOfLines={3}
                            placeholderTextColor="#64748b"
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-20 text-top"
                        />
                    </View>

                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-white mb-1">Start Date</Text>
                            <TextInput
                                value={form.startDate}
                                onChangeText={(t) => handleChange('startDate', t)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-1">End Date</Text>
                            <TextInput
                                value={form.endDate}
                                onChangeText={(t) => handleChange('endDate', t)}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                    </View>
                </View>

                {/* Nutrition Goals */}
                <View className="space-y-4 mb-12">
                    <Text className="text-slate-400 uppercase text-xs font-bold mb-2">Nutritional Goals (Daily)</Text>

                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-white mb-1">Calories</Text>
                            <TextInput
                                value={form.targetCalories}
                                onChangeText={(t) => handleChange('targetCalories', t)}
                                placeholder="2000"
                                keyboardType="numeric"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-1">Protein (g)</Text>
                            <TextInput
                                value={form.targetProtein}
                                onChangeText={(t) => handleChange('targetProtein', t)}
                                placeholder="150"
                                keyboardType="numeric"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                    </View>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-white mb-1">Carbs (g)</Text>
                            <TextInput
                                value={form.targetCarbs}
                                onChangeText={(t) => handleChange('targetCarbs', t)}
                                placeholder="200"
                                keyboardType="numeric"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-1">Fat (g)</Text>
                            <TextInput
                                value={form.targetFat}
                                onChangeText={(t) => handleChange('targetFat', t)}
                                placeholder="60"
                                keyboardType="numeric"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-1">Fiber (g)</Text>
                            <TextInput
                                value={form.targetFiber}
                                onChangeText={(t) => handleChange('targetFiber', t)}
                                placeholder="30"
                                keyboardType="numeric"
                                placeholderTextColor="#64748b"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Client Modal */}
            <Modal visible={showClientModal} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-slate-800">
                    <View className="p-4 border-b border-gray-700 flex-row justify-between items-center">
                        <Text className="text-white font-bold text-lg">Select Client</Text>
                        <TouchableOpacity onPress={() => setShowClientModal(false)}>
                            <Text className="text-blue-400">Close</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        {loadingClients ? (
                            <ActivityIndicator className="mt-10" />
                        ) : (
                            clients?.map((client: any) => (
                                <TouchableOpacity
                                    key={client.id}
                                    className="p-4 border-b border-gray-700"
                                    onPress={() => selectClient(client)}
                                >
                                    <Text className="text-white font-bold">{client.firstName} {client.lastName}</Text>
                                    <Text className="text-slate-400">{client.email}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
