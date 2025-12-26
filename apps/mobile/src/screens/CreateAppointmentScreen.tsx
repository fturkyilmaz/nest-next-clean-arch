import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAppointment, useClients } from '../lib/api-hooks';
import { CalendarIcon, ClockIcon } from 'react-native-heroicons/outline';

const appointmentSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    clientId: z.string().min(1, 'Client is required'),
    scheduledAt: z.string().min(1, 'Date and time required'),
    duration: z.number().min(15, 'Duration must be at least 15 minutes'),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function CreateAppointmentScreen({ navigation }: any) {
    const { data: clients } = useClients();
    const createAppointment = useCreateAppointment();
    const [selectedClientId, setSelectedClientId] = useState('');

    const { control, handleSubmit, formState: { errors } } = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            title: '',
            description: '',
            clientId: '',
            scheduledAt: new Date().toISOString(),
            duration: 30,
        },
    });

    const onSubmit = async (data: AppointmentFormData) => {
        try {
            await createAppointment.mutateAsync({
                ...data,
                dietitianId: 'current-user-id', // Should be from auth context
            });
            Alert.alert('Success', 'Appointment created successfully');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create appointment');
        }
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-purple-300 text-base font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-3xl font-extrabold">New Appointment</Text>
                <Text className="text-gray-300 text-sm mt-1">Schedule a new appointment</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Title Input */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Title</Text>
                    <Controller
                        control={control}
                        name="title"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                placeholder="e.g., Initial Consultation"
                                placeholderTextColor="#6b7280"
                                className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                            />
                        )}
                    />
                    {errors.title && (
                        <Text className="text-red-400 text-sm mt-1">{errors.title.message}</Text>
                    )}
                </View>

                {/* Client Selection */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Client</Text>
                    <Controller
                        control={control}
                        name="clientId"
                        render={({ field: { onChange, value } }) => (
                            <View className="bg-gray-800 rounded-xl border border-gray-700">
                                {clients?.slice(0, 5).map((client: any) => (
                                    <TouchableOpacity
                                        key={client.id}
                                        onPress={() => {
                                            onChange(client.id);
                                            setSelectedClientId(client.id);
                                        }}
                                        className={`p-4 border-b border-gray-700 ${value === client.id ? 'bg-purple-600/20' : ''
                                            }`}
                                    >
                                        <Text className={`font-semibold ${value === client.id ? 'text-purple-400' : 'text-white'
                                            }`}>
                                            {client.firstName} {client.lastName}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">{client.email}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    />
                    {errors.clientId && (
                        <Text className="text-red-400 text-sm mt-1">{errors.clientId.message}</Text>
                    )}
                </View>

                {/* Date & Time Placeholder */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Date & Time</Text>
                    <Controller
                        control={control}
                        name="scheduledAt"
                        render={({ field: { onChange, value } }) => (
                            <View className="bg-gray-800 rounded-xl px-4 py-3 border border-gray-700 flex-row items-center">
                                <CalendarIcon size={20} color="#9ca3af" />
                                <TextInput
                                    value={new Date(value).toLocaleString('tr-TR')}
                                    editable={false}
                                    className="text-white ml-3 flex-1"
                                />
                            </View>
                        )}
                    />
                    <Text className="text-gray-500 text-xs mt-1">
                        Note: Date picker integration needed
                    </Text>
                </View>

                {/* Duration Input */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Duration (minutes)</Text>
                    <Controller
                        control={control}
                        name="duration"
                        render={({ field: { onChange, value } }) => (
                            <View className="flex-row space-x-2">
                                {[15, 30, 45, 60, 90].map((min) => (
                                    <TouchableOpacity
                                        key={min}
                                        onPress={() => onChange(min)}
                                        className={`flex-1 py-3 rounded-xl border ${value === min
                                                ? 'bg-purple-600 border-purple-600'
                                                : 'bg-gray-800 border-gray-700'
                                            }`}
                                    >
                                        <Text className={`text-center font-semibold ${value === min ? 'text-white' : 'text-gray-400'
                                            }`}>
                                            {min}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    />
                </View>

                {/* Description Input */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Description (Optional)</Text>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                placeholder="Add notes or details..."
                                placeholderTextColor="#6b7280"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                            />
                        )}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={createAppointment.isPending}
                    className="bg-purple-600 rounded-xl py-4 mb-8"
                >
                    {createAppointment.isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">
                            Create Appointment
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
