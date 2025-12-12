'use client';

import { useUsers, useCreateUser } from '@/lib/api-hooks';
import Link from 'next/link';
import { Button } from '@ui/components/Button';
import { Card } from '@ui/components/Card';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, CreateUserFormInputs } from '@/lib/validationSchemas';
import { Input } from '@ui/components/Input';

export default function UsersPage() {
    const { data: users, isLoading, error } = useUsers();
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-lg text-gray-500">Loading users...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-lg text-red-500">Error loading users. Please try again.</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl p-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users</h1>
                    <p className="text-gray-500 mt-1">Manage system users (Admins, Dietitians, Clients)</p>
                </div>
                <Button onClick={() => setShowCreateUserModal(true)}>Add User</Button>
            </div>

            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users?.map((user) => (
                                <tr key={user.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'DIETITIAN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.isActive ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/users/${user.id}`}>
                                            <Button variant="outline" size="sm" className="h-8">View</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!users || users.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="text-base font-medium text-gray-900">No users found</p>
                                            <p className="mt-1 text-sm text-gray-500">Get started by adding a new user.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {showCreateUserModal && (
                <CreateUserModal
                    onClose={() => setShowCreateUserModal(false)}
                />
            )}
        </div>
    );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
    const createUserMutation = useCreateUser();

    const { register, handleSubmit, formState: { errors } } = useForm<CreateUserFormInputs>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            role: 'CLIENT',
        },
    });

    const onSubmit = async (data: CreateUserFormInputs) => {
        try {
            await createUserMutation.mutateAsync(data);
            onClose();
        } catch (err: any) {
            alert(`Error creating user: ${err?.detail || err?.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">Create New User</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
                        <Input id="firstName" {...register('firstName')} required />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
                        <Input id="lastName" {...register('lastName')} required />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                        <Input id="email" type="email" {...register('email')} required />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
                        <Input id="password" type="password" {...register('password')} required />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role *</label>
                        <select
                            id="role"
                            {...register('role')}
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="CLIENT">Client</option>
                            <option value="DIETITIAN">Dietitian</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={createUserMutation.isPending}>
                            {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
