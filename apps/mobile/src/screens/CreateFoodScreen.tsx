import React from 'react';
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
import { useCreateFood } from '../lib/api-hooks';

const foodSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    category: z.string().optional(),
    calories: z.number().min(0, 'Calories must be positive'),
    protein: z.number().min(0, 'Protein must be positive'),
    carbs: z.number().min(0, 'Carbs must be positive'),
    fat: z.number().min(0, 'Fat must be positive'),
    fiber: z.number().min(0).optional(),
    servingSize: z.string().min(1, 'Serving size required'),
    unit: z.string().min(1, 'Unit required'),
});

type FoodFormData = z.infer<typeof foodSchema>;

export default function CreateFoodScreen({ navigation }: any) {
    const createFood = useCreateFood();

    const { control, handleSubmit, formState: { errors } } = useForm<FoodFormData>({
        resolver: zodResolver(foodSchema),
        defaultValues: {
            name: '',
            category: 'Other',
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            servingSize: '100',
            unit: 'g',
        },
    });

    const onSubmit = async (data: FoodFormData) => {
        try {
            await createFood.mutateAsync(data);
            Alert.alert('Success', 'Food added successfully');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to add food');
        }
    };

    const categories = ['Protein', 'Carbs', 'Vegetables', 'Fruits', 'Dairy', 'Other'];

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-purple-300 text-base font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-3xl font-extrabold">Add New Food</Text>
                <Text className="text-gray-300 text-sm mt-1">Add to food database</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Name Input */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Food Name</Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                placeholder="e.g., Chicken Breast"
                                placeholderTextColor="#6b7280"
                                className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                            />
                        )}
                    />
                    {errors.name && (
                        <Text className="text-red-400 text-sm mt-1">{errors.name.message}</Text>
                    )}
                </View>

                {/* Category Selection */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Category</Text>
                    <Controller
                        control={control}
                        name="category"
                        render={({ field: { onChange, value } }) => (
                            <View className="flex-row flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => onChange(cat)}
                                        className={`px-4 py-2 rounded-xl ${value === cat
                                                ? 'bg-purple-600'
                                                : 'bg-gray-800 border border-gray-700'
                                            }`}
                                    >
                                        <Text className={`font-semibold ${value === cat ? 'text-white' : 'text-gray-400'
                                            }`}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    />
                </View>

                {/* Calories Input */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Calories</Text>
                    <Controller
                        control={control}
                        name="calories"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value?.toString()}
                                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                                placeholder="0"
                                placeholderTextColor="#6b7280"
                                keyboardType="numeric"
                                className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                            />
                        )}
                    />
                    {errors.calories && (
                        <Text className="text-red-400 text-sm mt-1">{errors.calories.message}</Text>
                    )}
                </View>

                {/* Macros Grid */}
                <Text className="text-gray-300 text-base font-semibold mb-2">Macronutrients (grams)</Text>
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1">
                        <Text className="text-gray-400 text-sm mb-2">Protein</Text>
                        <Controller
                            control={control}
                            name="protein"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value?.toString()}
                                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                                    placeholder="0"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="numeric"
                                    className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                                />
                            )}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-400 text-sm mb-2">Carbs</Text>
                        <Controller
                            control={control}
                            name="carbs"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value?.toString()}
                                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                                    placeholder="0"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="numeric"
                                    className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                                />
                            )}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-400 text-sm mb-2">Fat</Text>
                        <Controller
                            control={control}
                            name="fat"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value?.toString()}
                                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                                    placeholder="0"
                                    placeholderTextColor="#6b7280"
                                    keyboardType="numeric"
                                    className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                                />
                            )}
                        />
                    </View>
                </View>

                {/* Fiber Input */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Fiber (optional)</Text>
                    <Controller
                        control={control}
                        name="fiber"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value?.toString()}
                                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                                placeholder="0"
                                placeholderTextColor="#6b7280"
                                keyboardType="numeric"
                                className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                            />
                        )}
                    />
                </View>

                {/* Serving Size */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Serving Size</Text>
                        <Controller
                            control={control}
                            name="servingSize"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="100"
                                    placeholderTextColor="#6b7280"
                                    className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                                />
                            )}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-300 text-base font-semibold mb-2">Unit</Text>
                        <Controller
                            control={control}
                            name="unit"
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="g"
                                    placeholderTextColor="#6b7280"
                                    className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                                />
                            )}
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={createFood.isPending}
                    className="bg-purple-600 rounded-xl py-4 mb-8"
                >
                    {createFood.isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">
                            Add Food
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
