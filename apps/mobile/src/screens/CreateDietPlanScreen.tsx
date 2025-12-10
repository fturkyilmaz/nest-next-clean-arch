import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { useCreateDietPlan, useClients } from '../lib/api-hooks';
import {
    ChevronLeftIcon,
    CheckIcon,
    PencilSquareIcon,
    BookOpenIcon,
    UserGroupIcon,
    CalendarDaysIcon,
    FireIcon,
    CubeTransparentIcon,
    BeakerIcon,
    ScaleIcon,
    XMarkIcon,
} from 'react-native-heroicons/outline';

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

    // Custom Input Component
    const CustomInput = ({ label, placeholder, value, onChangeText, keyboardType, multiline, numberOfLines, icon }: {
        label: string;
        placeholder?: string;
        value: string;
        onChangeText: (text: string) => void;
        keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
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
                <Text className="text-2xl font-bold text-white">Create Diet Plan</Text>
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
                    <Text className="text-xl font-bold text-white mb-5">Plan Details</Text>

                    <View className="mb-5">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Client *</Text>
                        <TouchableOpacity
                            onPress={() => setShowClientModal(true)}
                            className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3 border border-gray-700"
                        >
                            <UserGroupIcon size={20} color="#a1a1aa" className="mr-3" />
                            <Text className={form.clientName ? 'text-white text-base' : 'text-gray-400 text-base'}>
                                {form.clientName || 'Select a Client...'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <CustomInput
                        label="Plan Name *"
                        placeholder="e.g. Keto Phase 1"
                        value={form.name}
                        onChangeText={(t) => handleChange('name', t)}
                        icon={<PencilSquareIcon size={20} color="#a1a1aa" />}
                    />
                    <CustomInput
                        label="Description"
                        placeholder="Description..."
                        value={form.description}
                        onChangeText={(t) => handleChange('description', t)}
                        multiline
                        numberOfLines={4}
                        icon={<BookOpenIcon size={20} color="#a1a1aa" />}
                    />

                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <Text className="text-gray-300 text-base font-semibold mb-2">Start Date</Text>
                            <View className="flex-row items-center bg-gray-800 rounded-xl px-4 border border-gray-700">
                                <CalendarDaysIcon size={20} color="#a1a1aa" className="mr-3" />
                                <TextInput
                                    value={form.startDate}
                                    onChangeText={(t) => handleChange('startDate', t)}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#a1a1aa"
                                    className="flex-1 text-white text-base py-3"
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-300 text-base font-semibold mb-2">End Date</Text>
                            <View className="flex-row items-center bg-gray-800 rounded-xl px-4 border border-gray-700">
                                <CalendarDaysIcon size={20} color="#a1a1aa" className="mr-3" />
                                <TextInput
                                    value={form.endDate}
                                    onChangeText={(t) => handleChange('endDate', t)}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#a1a1aa"
                                    className="flex-1 text-white text-base py-3"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-md">
                    <Text className="text-xl font-bold text-white mb-5">Nutritional Goals (Daily)</Text>

                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <CustomInput
                                label="Calories"
                                placeholder="2000"
                                value={form.targetCalories}
                                onChangeText={(t) => handleChange('targetCalories', t)}
                                keyboardType="numeric"
                                icon={<FireIcon size={20} color="#a1a1aa" />}
                            />
                        </View>
                        <View className="flex-1">
                            <CustomInput
                                label="Protein (g)"
                                placeholder="150"
                                value={form.targetProtein}
                                onChangeText={(t) => handleChange('targetProtein', t)}
                                keyboardType="numeric"
                                icon={<CubeTransparentIcon size={20} color="#a1a1aa" />}
                            />
                        </View>
                    </View>
                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <CustomInput
                                label="Carbs (g)"
                                placeholder="200"
                                value={form.targetCarbs}
                                onChangeText={(t) => handleChange('targetCarbs', t)}
                                keyboardType="numeric"
                                icon={<BeakerIcon size={20} color="#a1a1aa" />}
                            />
                        </View>
                        <View className="flex-1">
                            <CustomInput
                                label="Fat (g)"
                                placeholder="60"
                                value={form.targetFat}
                                onChangeText={(t) => handleChange('targetFat', t)}
                                keyboardType="numeric"
                                icon={<ScaleIcon size={20} color="#a1a1aa" />}
                            />
                        </View>
                    </View>
                    <View>
                        <CustomInput
                            label="Fiber (g)"
                            placeholder="30"
                            value={form.targetFiber}
                            onChangeText={(t) => handleChange('targetFiber', t)}
                            keyboardType="numeric"
                            icon={<CubeTransparentIcon size={20} color="#a1a1aa" />}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Client Modal */}
            <Modal
                visible={showClientModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowClientModal(false)}
            >
                <View className="flex-1 bg-gray-900">
                    <View className="px-6 pt-6 pb-4 bg-gray-900 flex-row items-center justify-between border-b border-gray-800">
                        <Text className="text-2xl font-bold text-white">Select Client</Text>
                        <TouchableOpacity onPress={() => setShowClientModal(false)} className="p-2 -mr-2">
                            <XMarkIcon size={24} color="#d1d5db" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="flex-1 p-6">
                        {loadingClients ? (
                            <ActivityIndicator className="mt-10" size="large" color="#6366f1" />
                        ) : (
                            clients?.map((client: any) => (
                                <TouchableOpacity
                                    key={client.id}
                                    className="flex-row items-center bg-gray-800 rounded-xl p-4 mb-4 shadow-sm active:bg-gray-700"
                                    onPress={() => selectClient(client)}
                                >
                                    <View className="w-12 h-12 rounded-full bg-primary-500 items-center justify-center mr-4">
                                        <Text className="text-white font-bold text-lg">
                                            {client.firstName[0]}{client.lastName[0]}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-bold text-base">{client.firstName} {client.lastName}</Text>
                                        <Text className="text-gray-400 text-sm">{client.email}</Text>
                                    </View>
                                    <CheckIcon size={20} color={form.clientId === client.id ? "#34d399" : "#a1a1aa"} />
                                </TouchableOpacity>
                            ))
                        )}
                        {clients?.length === 0 && !loadingClients && (
                            <Text className="text-gray-400 text-center py-6 text-base">No clients available.</Text>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
