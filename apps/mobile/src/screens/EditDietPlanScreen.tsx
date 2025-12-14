import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { useDietPlan, useUpdateDietPlan, useClients } from '../lib/api-hooks';
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateDietPlanSchema, UpdateDietPlanFormInputs } from '../lib/validationSchemas';

// Custom Input Component (copied from AddClientScreen.tsx, should be shared)
const CustomInput = ({ label, placeholder, keyboardType, autoCapitalize, multiline, numberOfLines, icon, onChange, onBlur, value, error }: {
    label?: string;
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
        {label && <Text className="text-gray-300 text-base font-semibold mb-2">{label}</Text>}
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

export default function EditDietPlanScreen({ route, navigation }: any) {
    const { planId } = route.params;
    const { data: plan, isLoading: fetchLoading, error: fetchError } = useDietPlan(planId);
    const updateMutation = useUpdateDietPlan(planId);
    const { data: clients, isLoading: loadingClients } = useClients();

    const [showClientModal, setShowClientModal] = useState(false);

    const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<UpdateDietPlanFormInputs>({
        resolver: zodResolver(updateDietPlanSchema),
    });

    const selectedClientId = watch('clientId');
    const selectedClientName = selectedClientId ?
        clients?.find(c => c.id === selectedClientId)?.firstName + ' ' + clients?.find(c => c.id === selectedClientId)?.lastName
        : '';

    useEffect(() => {
        if (plan) {
            reset({
                name: plan.name,
                description: plan.description || '',
                clientId: plan.clientId || '',
                startDate: new Date(plan.startDate).toISOString().split('T')[0],
                endDate: plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : '',
                targetCalories: plan.targetCalories?.toString() || '',
                targetProtein: plan.targetProtein?.toString() || '',
                targetCarbs: plan.targetCarbs?.toString() || '',
                targetFat: plan.targetFat?.toString() || '',
                targetFiber: plan.targetFiber?.toString() || '',
            });
        }
    }, [plan, reset]);

    const selectClient = (client: any) => {
        setValue('clientId', client.id);
        setShowClientModal(false);
    };

    const onSubmit = async (data: UpdateDietPlanFormInputs) => {
        try {
            await updateMutation.mutateAsync({
                name: data.name,
                description: data.description || undefined,
                clientId: data.clientId || undefined,
                startDate: data.startDate,
                endDate: data.endDate || undefined,
                nutritionalGoals: {
                    targetCalories: data.targetCalories ? Number(data.targetCalories) : undefined,
                    targetProtein: data.targetProtein ? Number(data.targetProtein) : undefined,
                    targetCarbs: data.targetCarbs ? Number(data.targetCarbs) : undefined,
                    targetFat: data.targetFat ? Number(data.targetFat) : undefined,
                    targetFiber: data.targetFiber ? Number(data.targetFiber) : undefined,
                },
            });
            Alert.alert('Success', 'Diet Plan updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.detail || err.message || 'Failed to update diet plan');
        }
    };

    if (fetchLoading) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center">
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (fetchError || !plan) {
        return (
            <View className="flex-1 bg-gray-900 items-center justify-center p-6">
                <Text className="text-red-400 text-lg mb-4">Error loading diet plan. Please try again.</Text>
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
                <Text className="text-2xl font-bold text-white ml-3">Edit Diet Plan</Text>
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
                    <Text className="text-xl font-bold text-white mb-5">Plan Details</Text>

                    <View className="mb-5">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Client *</Text>
                        <Controller
                            control={control}
                            name="clientId"
                            render={({ field: { onChange, value } }) => (
                                <TouchableOpacity
                                    onPress={() => setShowClientModal(true)}
                                    className="flex-row items-center bg-gray-800 rounded-xl px-4 py-3 border border-gray-700"
                                >
                                    <UserGroupIcon size={20} color="#a1a1aa" className="mr-3" />
                                    <Text className={value ? 'text-white text-base' : 'text-gray-400 text-base'}>
                                        {selectedClientName || 'Select a Client...'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        {errors.clientId && <Text className="text-red-400 text-sm mt-1">{errors.clientId.message}</Text>}
                    </View>

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Plan Name *"
                                placeholder="e.g. Keto Phase 1"
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                icon={<PencilSquareIcon size={20} color="#a1a1aa" />}
                                error={errors.name?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Description"
                                placeholder="Description..."
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                multiline
                                numberOfLines={4}
                                icon={<BookOpenIcon size={20} color="#a1a1aa" />}
                                error={errors.description?.message}
                            />
                        )}
                    />

                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <Text className="text-gray-300 text-base font-semibold mb-2">Start Date</Text>
                            <Controller
                                control={control}
                                name="startDate"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View className="flex-row items-center bg-gray-800 rounded-xl px-4 border border-gray-700">
                                        <CalendarDaysIcon size={20} color="#a1a1aa" className="mr-3" />
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
                            {errors.startDate && <Text className="text-red-400 text-sm mt-1">{errors.startDate.message}</Text>}
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-300 text-base font-semibold mb-2">End Date</Text>
                            <Controller
                                control={control}
                                name="endDate"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View className="flex-row items-center bg-gray-800 rounded-xl px-4 border border-gray-700">
                                        <CalendarDaysIcon size={20} color="#a1a1aa" className="mr-3" />
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
                            {errors.endDate && <Text className="text-red-400 text-sm mt-1">{errors.endDate.message}</Text>}
                        </View>
                    </View>
                </View>

                <View className="mb-8 bg-gray-800 rounded-2xl p-6 shadow-md">
                    <Text className="text-xl font-bold text-white mb-5">Nutritional Goals (Daily)</Text>

                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <Controller
                                control={control}
                                name="targetCalories"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomInput
                                        label="Calories"
                                        placeholder="2000"
                                        value={value}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                        icon={<FireIcon size={20} color="#a1a1aa" />}
                                        error={errors.targetCalories?.message}
                                    />
                                )}
                            />
                        </View>
                        <View className="flex-1">
                            <Controller
                                control={control}
                                name="targetProtein"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomInput
                                        label="Protein (g)"
                                        placeholder="150"
                                        value={value}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                        icon={<CubeTransparentIcon size={20} color="#a1a1aa" />}
                                        error={errors.targetProtein?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>
                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <Controller
                                control={control}
                                name="targetCarbs"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomInput
                                        label="Carbs (g)"
                                        placeholder="200"
                                        value={value}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                        icon={<BeakerIcon size={20} color="#a1a1aa" />}
                                        error={errors.targetCarbs?.message}
                                    />
                                )}
                            />
                        </View>
                        <View className="flex-1">
                            <Controller
                                control={control}
                                name="targetFat"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomInput
                                        label="Fat (g)"
                                        placeholder="60"
                                        value={value}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        keyboardType="numeric"
                                        icon={<ScaleIcon size={20} color="#a1a1aa" />}
                                        error={errors.targetFat?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>
                    <View>
                        <Controller
                            control={control}
                            name="targetFiber"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <CustomInput
                                    label="Fiber (g)"
                                    placeholder="30"
                                    value={value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    keyboardType="numeric"
                                    icon={<CubeTransparentIcon size={20} color="#a1a1aa" />}
                                    error={errors.targetFiber?.message}
                                />
                            )}
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
                                    <CheckIcon size={20} color={selectedClientId === client.id ? "#34d399" : "#a1a1aa"} />
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