'use client';

import { useCreateDietPlan, useClients, useCurrentUser } from '@/lib/api-hooks';
import { Button } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import { Card } from '@ui/components/Card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function CreateDietPlanPage() {
    const router = useRouter();
    const createMutation = useCreateDietPlan();
    const { data: clients } = useClients();
    const { data: currentUser } = useCurrentUser();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        clientId: '',
        startDate: '',
        endDate: '',
        // Nutritional Goals
        targetCalories: '',
        targetProtein: '',
        targetCarbs: '',
        targetFat: '',
        targetFiber: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser?.id) {
            alert('Error: Could not determine current dietitian');
            return;
        }

        const nutritionalGoals = {
            targetCalories: formData.targetCalories ? Number(formData.targetCalories) : undefined,
            targetProtein: formData.targetProtein ? Number(formData.targetProtein) : undefined,
            targetCarbs: formData.targetCarbs ? Number(formData.targetCarbs) : undefined,
            targetFat: formData.targetFat ? Number(formData.targetFat) : undefined,
            targetFiber: formData.targetFiber ? Number(formData.targetFiber) : undefined,
        };

        // Filter out undefined values if the API doesn't like them, or just send partial object
        // Actually interface expects object with optional keys.

        createMutation.mutate({
            name: formData.name,
            description: formData.description,
            clientId: formData.clientId,
            startDate: formData.startDate,
            endDate: formData.endDate || undefined,
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
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Plan Details</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Client *</label>
                                <select
                                    name="clientId"
                                    value={formData.clientId}
                                    onChange={handleChange}
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
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Plan Name *</label>
                                <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Weight Loss Phase 1" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Weekly plan description..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-gray-700">Start Date *</label>
                                    <Input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-gray-700">End Date</label>
                                    <Input name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
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
                                <Input name="targetCalories" type="number" value={formData.targetCalories} onChange={handleChange} placeholder="2000" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Protein (g)</label>
                                <Input name="targetProtein" type="number" value={formData.targetProtein} onChange={handleChange} placeholder="150" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Carbs (g)</label>
                                <Input name="targetCarbs" type="number" value={formData.targetCarbs} onChange={handleChange} placeholder="200" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Fat (g)</label>
                                <Input name="targetFat" type="number" value={formData.targetFat} onChange={handleChange} placeholder="70" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Fiber (g)</label>
                                <Input name="targetFiber" type="number" value={formData.targetFiber} onChange={handleChange} placeholder="30" />
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
