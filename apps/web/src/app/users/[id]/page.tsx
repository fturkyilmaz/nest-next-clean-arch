'use client';

import { useUser, useUpdateUser } from '@/lib/api-hooks';
import { Button } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import { Card } from '@ui/components/Card';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema, UpdateUserFormInputs } from '@/lib/validationSchemas';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: user, isLoading, error } = useUser(id);
    const updateMutation = useUpdateUser(id);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<UpdateUserFormInputs>({
        resolver: zodResolver(updateUserSchema),
    });

    useEffect(() => {
        if (user) {
            reset({ firstName: user.firstName, lastName: user.lastName });
        }
    }, [user, reset]);

    const onSubmit = (data: UpdateUserFormInputs) => {
        updateMutation.mutate(data, {
            onSuccess: () => {
                alert('User updated successfully');
                router.push('/users');
            }
        });
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading user details...</div>;
    if (error || !user) return <div className="p-8 text-center text-red-500">Error loading user</div>;

    return (
        <div className="container mx-auto max-w-2xl p-6 py-10 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Details</h1>
                <Link href="/users">
                    <Button variant="ghost">Back to List</Button>
                </Link>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-500">First Name</label>
                                <Input
                                    {...register('firstName')}
                                    placeholder="First Name"
                                    required
                                />
                                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-500">Last Name</label>
                                <Input
                                    {...register('lastName')}
                                    placeholder="Last Name"
                                    required
                                />
                                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-gray-500">Email</label>
                            <Input
                                value={email}
                                disabled
                                className="bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400">Email cannot be changed directly.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-gray-500">Role</label>
                            <div className="p-2 bg-gray-50 rounded-md border border-gray-200 text-sm font-medium">
                                {user.role}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link href="/users">
                            <Button type="button" variant="ghost">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
