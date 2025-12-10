'use client';

import { useClient, useUpdateClient } from '@/lib/api-hooks';
import { Button } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import { Card } from '@ui/components/Card';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: client, isLoading, error } = useClient(id);
    const updateMutation = useUpdateClient(id);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        userId: '', // readonly
        phone: '',
        dateOfBirth: '',
        gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
        allergies: '',
        conditions: '',
        medications: '',
        notes: ''
    });

    useEffect(() => {
        if (client) {
            setFormData({
                firstName: client.firstName,
                lastName: client.lastName,
                userId: client.id,
                phone: client.phone || '',
                dateOfBirth: client.dateOfBirth ? new Date(client.dateOfBirth).toISOString().split('T')[0] : '',
                gender: client.gender || 'MALE',
                allergies: client.allergies ? client.allergies.join(', ') : '',
                conditions: client.conditions ? client.conditions.join(', ') : '',
                medications: client.medications ? client.medications.join(', ') : '',
                notes: client.notes || ''
            });
        }
    }, [client]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
            conditions: formData.conditions ? formData.conditions.split(',').map(s => s.trim()) : [],
            medications: formData.medications ? formData.medications.split(',').map(s => s.trim()) : [],
            notes: formData.notes
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
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">First Name</label>
                                <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Last Name</label>
                                <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Phone</label>
                                <Input name="phone" value={formData.phone} onChange={handleChange} />
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
                                <Input name="allergies" value={formData.allergies} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Conditions (comma separated)</label>
                                <Input name="conditions" value={formData.conditions} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Medications (comma separated)</label>
                                <Input name="medications" value={formData.medications} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-gray-700">Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
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
