'use client';

import { useCreateDietPlan, useClients, useCurrentUser } from '@/lib/api-hooks';
import { Button } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import { Card } from '@ui/components/Card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDietPlanSchema, CreateDietPlanFormInputs } from '@/lib/validationSchemas';

export default function CreateDietPlanPage() {
    const router = useRouter();
    const createMutation = useCreateDietPlan();
    const { data: clients } = useClients();
    const { data: currentUser } = useCurrentUser();

    const { register, handleSubmit, formState: { errors } } = useForm<CreateDietPlanFormInputs>({
        resolver: zodResolver(createDietPlanSchema),
    });

    const onSubmit = (data: CreateDietPlanFormInputs) => {
        if (!currentUser?.id) {
            alert('Error: Could not determine current dietitian');
            return;
        }

        const nutritionalGoals = {
            targetCalories: data.targetCalories ? Number(data.targetCalories) : undefined,
            targetProtein: data.targetProtein ? Number(data.targetProtein) : undefined,
            targetCarbs: data.targetCarbs ? Number(data.targetCarbs) : undefined,
            targetFat: data.targetFat ? Number(data.targetFat) : undefined,
            targetFiber: data.targetFiber ? Number(data.targetFiber) : undefined,
        };

        createMutation.mutate({
            name: data.name,
            description: data.description || undefined,
            clientId: data.clientId,
            startDate: data.startDate,
            endDate: data.endDate || undefined,
            nutritionalGoals: Object.values(nutritionalGoals).some(v => v !== undefined) ? nutritionalGoals : undefined
        }, {
            onSuccess: () => {
                router.push('/diet-plans');
            },
            onError: (err: any) => {
                alert(`Error creating diet plan: ${err?.detail || err?.message || 'Unknown error'}`);
            }
        });
    };

    return (
        <div className="container mx-auto max-w-3xl p-6 py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Diet Plan</h1>
                    <p className="text-gray-500 mt-1">Design a new nutrition plan for a client</p>
                </div>
                <Link href="/diet-plans">
                    <Button variant="ghost">Cancel</Button>
                </Link>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Plan Details</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Client *</label>
                                <select
                                    {...register('clientId')}
                                    required
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">Select a client</option>
                                    {clients?.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.firstName} {client.lastName} ({client.email})
                                        </option>
                                    ))}
                                </select>
                                {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Plan Name *</label>
                                <Input {...register('name')} required placeholder="Weight Loss Phase 1" />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Description</label>
                                <textarea
                                    {...register('description')}
                                    rows={3}
                                    className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Weekly plan description..."
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-gray-700">Start Date *</label>
                                    <Input {...register('startDate')} type="date" required />
                                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-gray-700">End Date</label>
                                    <Input {...register('endDate')} type="date" />
                                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nutritional Goals */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Nutritional Goals (Daily)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Calories (kcal)</label>
                                <Input {...register('targetCalories')} type="number" placeholder="2000" />
                                {errors.targetCalories && <p className="text-red-500 text-sm mt-1">{errors.targetCalories.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Protein (g)</label>
                                <Input {...register('targetProtein')} type="number" placeholder="150" />
                                {errors.targetProtein && <p className="text-red-500 text-sm mt-1">{errors.targetProtein.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Carbs (g)</label>
                                <Input {...register('targetCarbs')} type="number" placeholder="200" />
                                {errors.targetCarbs && <p className="text-red-500 text-sm mt-1">{errors.targetCarbs.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Fat (g)</label>
                                <Input {...register('targetFat')} type="number" placeholder="70" />
                                {errors.targetFat && <p className="text-red-500 text-sm mt-1">{errors.targetFat.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Fiber (g)</label>
                                <Input {...register('targetFiber')} type="number" placeholder="30" />
                                {errors.targetFiber && <p className="text-red-500 text-sm mt-1">{errors.targetFiber.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link href="/diet-plans">
                            <Button type="button" variant="ghost">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Creating Plan...' : 'Create Diet Plan'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
