'use client';

import { useCreateClient, useCurrentUser } from '@/lib/api-hooks';
import { Button } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import { Card } from '@ui/components/Card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientSchema, CreateClientFormInputs } from '@/lib/validationSchemas';

export default function CreateClientPage() {
    const router = useRouter();
    const createMutation = useCreateClient();
    const { data: currentUser } = useCurrentUser();

    const { register, handleSubmit, formState: { errors } } = useForm<CreateClientFormInputs>({
        resolver: zodResolver(createClientSchema),
        defaultValues: {
            gender: 'MALE',
        },
    });

    const onSubmit = (data: CreateClientFormInputs) => {
        if (!currentUser?.id) {
            alert('Error: Could not determine current dietitian');
            return;
        }

        createMutation.mutate({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || undefined,
            dateOfBirth: data.dateOfBirth || undefined,
            gender: data.gender,
            dietitianId: currentUser.id,
            allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()) : [],
            conditions: data.conditions ? data.conditions.split(',').map(s => s.trim()) : [],
            medications: data.medications ? data.medications.split(',').map(s => s.trim()) : [],
            notes: data.notes || undefined,
        }, {
            onSuccess: () => {
                router.push('/clients');
            },
            onError: (err: any) => {
                alert(`Error creating client: ${err?.detail || err?.message || 'Unknown error'}`);
            }
        });
    };

    return (
        <div className="container mx-auto max-w-3xl p-6 py-10 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Add New Client</h1>
                    <p className="text-gray-500 mt-1">Create a new client profile</p>
                </div>
                <Link href="/clients">
                    <Button variant="ghost">Cancel</Button>
                </Link>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">First Name *</label>
                                <Input {...register('firstName')} required placeholder="John" />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Last Name *</label>
                                <Input {...register('lastName')} required placeholder="Doe" />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Email *</label>
                                <Input {...register('email')} type="email" required placeholder="john@example.com" />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Phone</label>
                                <Input {...register('phone')} placeholder="+1234567890" />
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
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Medical Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Medical Information</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Allergies (comma separated)</label>
                                <Input {...register('allergies')} placeholder="Peanuts, Shellfish..." />
                                {errors.allergies && <p className="text-red-500 text-sm mt-1">{errors.allergies.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Conditions (comma separated)</label>
                                <Input {...register('conditions')} placeholder="Diabetes, Hypertension..." />
                                {errors.conditions && <p className="text-red-500 text-sm mt-1">{errors.conditions.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Medications (comma separated)</label>
                                <Input {...register('medications')} placeholder="Insulin, Lisinopril..." />
                                {errors.medications && <p className="text-red-500 text-sm mt-1">{errors.medications.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Notes</label>
                                <textarea
                                    {...register('notes')}
                                    rows={4}
                                    className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Additional notes..."
                                />
                                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link href="/clients">
                            <Button type="button" variant="ghost">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Creating Client...' : 'Create Client'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
