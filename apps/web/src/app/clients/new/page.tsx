'use client';

import { useCreateClient, useCurrentUser } from '@/lib/api-hooks';
import { Button } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import { Card } from '@ui/components/Card';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function CreateClientPage() {
    const router = useRouter();
    const createMutation = useCreateClient();
    const { data: currentUser } = useCurrentUser();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
        allergies: '',
        conditions: '',
        medications: '',
        notes: ''
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

        createMutation.mutate({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth, // API expects YYYY-MM-DD
            gender: formData.gender,
            dietitianId: currentUser.id,
            allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
            conditions: formData.conditions ? formData.conditions.split(',').map(s => s.trim()) : [],
            medications: formData.medications ? formData.medications.split(',').map(s => s.trim()) : [],
            notes: formData.notes
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
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">First Name *</label>
                                <Input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Last Name *</label>
                                <Input name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Email *</label>
                                <Input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Phone</label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1234567890" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Date of Birth</label>
                                <Input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
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
                                <Input name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Peanuts, Shellfish..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Conditions (comma separated)</label>
                                <Input name="conditions" value={formData.conditions} onChange={handleChange} placeholder="Diabetes, Hypertension..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Medications (comma separated)</label>
                                <Input name="medications" value={formData.medications} onChange={handleChange} placeholder="Insulin, Lisinopril..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Additional notes..."
                                />
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
