'use client';

import { useClient, useUpdateClient } from '@/lib/api-hooks';
import { Button } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import { Card } from '@ui/components/Card';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateClientSchema, UpdateClientFormInputs } from '@/lib/validationSchemas';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: client, isLoading, error } = useClient(id);
    const updateMutation = useUpdateClient(id);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<UpdateClientFormInputs>({
        resolver: zodResolver(updateClientSchema),
    });

    useEffect(() => {
        if (client) {
            reset({
                firstName: client.firstName,
                lastName: client.lastName,
                phone: client.phone || '',
                dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '',
                gender: client.gender || 'MALE',
                allergies: client.allergies ? client.allergies.join(', ') : '',
                conditions: client.conditions ? client.conditions.join(', ') : '',
                medications: client.medications ? client.medications.join(', ') : '',
                notes: client.notes || '',
            });
        }
    }, [client, reset]);

    const onSubmit = (data: UpdateClientFormInputs) => {
        updateMutation.mutate({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || undefined,
            dateOfBirth: data.dateOfBirth || undefined,
            gender: data.gender,
            allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()) : [],
            conditions: data.conditions ? data.conditions.split(',').map(s => s.trim()) : [],
            medications: data.medications ? data.medications.split(',').map(s => s.trim()) : [],
            notes: data.notes || undefined,
        }, {
            onSuccess: () => {
                alert('Client updated successfully');
            },
            onError: (err: any) => {
                alert(`Error updating client: ${err?.title || 'Unknown error'}`);
            }
        });
    };

    if (isLoading) return <div className="flex h-screen w-full items-center justify-center text-gray-500">Loading client details...</div>;
    if (error || !client) return <div className="flex h-screen w-full items-center justify-center text-red-500">Error loading client</div>;

    return (
        <div className="container mx-auto max-w-3xl p-6 py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Client Details</h1>
                    <p className="text-gray-500 mt-1">{client.firstName} {client.lastName}</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/clients/${id}/metrics`}>
                        <Button variant="outline">View Metrics</Button>
                    </Link>
                    <Link href={`/clients/${id}/diet-plans`}>
                        <Button variant="outline">Diet Plans</Button>
                    </Link>
                    <Link href="/clients">
                        <Button variant="ghost">Back to List</Button>
                    </Link>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">First Name</label>
                                <Input {...register('firstName')} required />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Last Name</label>
                                <Input {...register('lastName')} required />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Phone</label>
                                <Input {...register('phone')} />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Date of Birth</label>
                                <Input {...register('dateOfBirth')} type="date" />
                                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Gender</label>
                                <select
                                    {...register('gender')}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Email</label>
                                <Input value={client.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Medical Information</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Allergies (comma separated)</label>
                                <Input {...register('allergies')} />
                                {errors.allergies && <p className="text-red-500 text-sm mt-1">{errors.allergies.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Conditions (comma separated)</label>
                                <Input {...register('conditions')} />
                                {errors.conditions && <p className="text-red-500 text-sm mt-1">{errors.conditions.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Medications (comma separated)</label>
                                <Input {...register('medications')} />
                                {errors.medications && <p className="text-red-500 text-sm mt-1">{errors.medications.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Notes</label>
                                <textarea
                                    {...register('notes')}
                                    rows={4}
                                    className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
