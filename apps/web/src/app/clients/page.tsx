'use client';

import { useClients } from '@/lib/api-hooks';
import Link from 'next/link';
import { Button } from '@ui/components/Button';
import { Card } from '@ui/components/Card';

export default function ClientsPage() {
    const { data: clients, isLoading, error } = useClients();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-lg text-gray-500">Loading clients...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-lg text-red-500">Error loading clients. Please try again.</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl p-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Clients</h1>
                    <p className="text-gray-500 mt-1">Manage your clients and their progress</p>
                </div>
                <Link href="/clients/new">
                    <Button>Add Client</Button>
                </Link>
            </div>

            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Phone</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clients?.map((client) => (
                                <tr key={client.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {client.firstName} {client.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{client.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{client.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        {client.isActive ? (
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
                                        <Link href={`/clients/${client.id}`}>
                                            <Button variant="outline" size="sm" className="h-8">View</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!clients || clients.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="text-base font-medium text-gray-900">No clients found</p>
                                            <p className="mt-1 text-sm text-gray-500">Get started by adding a new client.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
