import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    FlatList,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateMeal, useFoods } from '../lib/api-hooks';
import { PlusIcon, XMarkIcon } from 'react-native-heroicons/outline';

const mealSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
    dietPlanId: z.string().min(1, 'Diet plan required'),
    scheduledTime: z.string().optional(),
});

type MealFormData = z.infer<typeof mealSchema>;

export default function CreateMealScreen({ route, navigation }: any) {
    const { dietPlanId } = route.params || {};
    const { data: foods } = useFoods();
    const createMeal = useCreateMeal();

    const [selectedFoods, setSelectedFoods] = useState<Array<{ foodId: string; quantity: number; name: string }>>([]);
    const [showFoodPicker, setShowFoodPicker] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<MealFormData>({
        resolver: zodResolver(mealSchema),
        defaultValues: {
            name: '',
            mealType: 'BREAKFAST',
            dietPlanId: dietPlanId || '',
            scheduledTime: new Date().toISOString(),
        },
    });

    const addFood = (food: any) => {
        if (!selectedFoods.find(f => f.foodId === food.id)) {
            setSelectedFoods([...selectedFoods, { foodId: food.id, quantity: 1, name: food.name }]);
        }
        setShowFoodPicker(false);
    };

    const removeFood = (foodId: string) => {
        setSelectedFoods(selectedFoods.filter(f => f.foodId !== foodId));
    };

    const updateQuantity = (foodId: string, quantity: number) => {
        setSelectedFoods(selectedFoods.map(f =>
            f.foodId === foodId ? { ...f, quantity: Math.max(0.1, quantity) } : f
        ));
    };

    const onSubmit = async (data: MealFormData) => {
        if (selectedFoods.length === 0) {
            Alert.alert('Error', 'Please add at least one food item');
            return;
        }

        try {
            await createMeal.mutateAsync({
                ...data,
                foods: selectedFoods.map(f => ({ foodId: f.foodId, quantity: f.quantity })),
            });
            Alert.alert('Success', 'Meal created successfully');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create meal');
        }
    };

    const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

    return (
        <View className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pt-12 pb-6 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-purple-300 text-base font-semibold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-white text-3xl font-extrabold">Create Meal</Text>
                <Text className="text-gray-300 text-sm mt-1">Add foods to your meal plan</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Name Input */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Meal Name</Text>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                value={value}
                                onChangeText={onChange}
                                placeholder="e.g., High Protein Breakfast"
                                placeholderTextColor="#6b7280"
                                className="bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700"
                            />
                        )}
                    />
                    {errors.name && (
                        <Text className="text-red-400 text-sm mt-1">{errors.name.message}</Text>
                    )}
                </View>

                {/* Meal Type Selection */}
                <View className="mb-6">
                    <Text className="text-gray-300 text-base font-semibold mb-2">Meal Type</Text>
                    <Controller
                        control={control}
                        name="mealType"
                        render={({ field: { onChange, value } }) => (
                            <View className="flex-row flex-wrap gap-2">
                                {mealTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => onChange(type)}
                                        className={`px-4 py-3 rounded-xl ${value === type
                                                ? 'bg-purple-600'
                                                : 'bg-gray-800 border border-gray-700'
                                            }`}
                                    >
                                        <Text className={`font-semibold ${value === type ? 'text-white' : 'text-gray-400'
                                            }`}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    />
                </View>

                {/* Food Items Section */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-300 text-base font-semibold">Food Items</Text>
                        <TouchableOpacity
                            onPress={() => setShowFoodPicker(!showFoodPicker)}
                            className="bg-purple-600 rounded-full p-2"
                        >
                            <PlusIcon size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* Food Picker */}
                    {showFoodPicker && (
                        <View className="bg-gray-800 rounded-xl mb-4 max-h-60">
                            <FlatList
                                data={foods?.slice(0, 10)}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => addFood(item)}
                                        className="p-4 border-b border-gray-700"
                                    >
                                        <Text className="text-white font-semibold">{item.name}</Text>
                                        <Text className="text-gray-400 text-sm">{item.calories} cal</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}

                    {/* Selected Foods List */}
                    <View className="bg-gray-800/60 rounded-2xl border border-gray-700/50">
                        {selectedFoods.length === 0 ? (
                            <Text className="text-gray-400 text-center py-8">
                                No foods added yet
                            </Text>
                        ) : (
                            selectedFoods.map((food) => (
                                <View
                                    key={food.foodId}
                                    className="flex-row items-center justify-between p-4 border-b border-gray-700/50"
                                >
                                    <View className="flex-1">
                                        <Text className="text-white font-semibold">{food.name}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <TextInput
                                            value={food.quantity.toString()}
                                            onChangeText={(text) => updateQuantity(food.foodId, parseFloat(text) || 1)}
                                            keyboardType="numeric"
                                            className="bg-gray-700 text-white rounded-lg px-3 py-2 w-16 text-center mr-2"
                                        />
                                        <Text className="text-gray-400 mr-3">x</Text>
                                        <TouchableOpacity
                                            onPress={() => removeFood(food.foodId)}
                                            className="bg-red-600/20 rounded-full p-2"
                                        >
                                            <XMarkIcon size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={createMeal.isPending}
                    className="bg-purple-600 rounded-xl py-4 mb-8"
                >
                    {createMeal.isPending ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">
                            Create Meal
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
