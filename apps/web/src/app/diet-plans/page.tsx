'use client';

import { useState } from 'react';
import { useDietPlans } from '@/lib/api-hooks';
import { Button } from '@ui/components/Button';
import { Card } from '@ui/components/Card';
import { PaginationControls } from '@/components/PaginationControls';

export default function DietPlansPage() {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data: paginatedResult, isLoading, error } = useDietPlans(page, limit);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-lg text-gray-500">Loading diet plans...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-lg text-red-500">Error loading diet plans. Please try again.</div>
            </div>
        );
    }

    const dietPlans = paginatedResult?.data || [];
    const totalPages = paginatedResult?.pages || 1;
    const hasNextPage = paginatedResult?.hasNextPage || false;
    const hasPreviousPage = paginatedResult?.hasPreviousPage || false;

    return (
        <div className="container mx-auto max-w-7xl p-6 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Diet Plans</h1>
                    <p className="text-gray-500 mt-1">Manage diet plans for your clients</p>
                </div>
                <a href="/diet-plans/new">
                    <Button>Create Plan</Button>
                </a>
            </div>

            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Plan Name</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Start Date</th>
                                <th className="px-6 py-4 font-medium">End Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {dietPlans?.map((plan) => (
                                <tr key={plan.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {plan.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${plan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                plan.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                                    plan.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {plan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(plan.startDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {plan.endDate ? new Date(plan.endDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <a href={`/diet-plans/${plan.id}`}>
                                            <Button variant="outline" size="sm" className="h-8">View</Button>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            {(!dietPlans || dietPlans.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <p className="text-base font-medium text-gray-900">No diet plans found</p>
                                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new plan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {dietPlans && dietPlans.length > 0 && (
                    <PaginationControls
                        page={page}
                        totalPages={totalPages}
                        hasNextPage={hasNextPage}
                        hasPreviousPage={hasPreviousPage}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                )}
            </Card>
        </div>
    );
}
