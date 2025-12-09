'use client';

import { useDietPlans, useCreateDietPlan, useActivateDietPlan, useCompleteDietPlan } from '@/lib/api-hooks';
import Link from 'next/link';
import { useState } from 'react';

export default function DietPlansPage() {
    const { data: plans, isLoading } = useDietPlans();
    const createPlanMutation = useCreateDietPlan();
    const activateMutation = useActivateDietPlan();
    const completeMutation = useCompleteDietPlan();
    const [filter, setFilter] = useState('all');

    const filteredPlans = plans?.filter(plan => {
        if (filter === 'all') return true;
        return plan.status === filter;
    });

    const statusColors: Record<string, string> = {
        DRAFT: 'from-amber-500 to-orange-500',
        ACTIVE: 'from-emerald-500 to-green-500',
        COMPLETED: 'from-blue-500 to-cyan-500',
        CANCELLED: 'from-red-500 to-rose-500',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="text-slate-400 hover:text-white transition">
                                ← Back
                            </Link>
                            <span className="text-xl font-bold text-white">Diet Plans</span>
                        </div>
                        <Link
                            href="/dashboard/diet-plans/new"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-white font-medium hover:from-emerald-500 hover:to-cyan-500 transition"
                        >
                            + New Plan
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filter === status
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            {status === 'all' ? 'All Plans' : status}
                        </button>
                    ))}
                </div>

                {/* Plans Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlans?.map(plan => (
                            <div
                                key={plan.id}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden group"
                            >
                                <div className={`h-2 bg-gradient-to-r ${statusColors[plan.status]}`} />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition">
                                                {plan.name}
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                                                {plan.description || 'No description'}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${statusColors[plan.status]} text-white`}>
                                            {plan.status}
                                        </span>
                                    </div>

                                    {/* Nutrition Goals */}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        <div className="text-center p-2 bg-white/5 rounded-lg">
                                            <p className="text-white font-semibold">{plan.targetCalories || '-'}</p>
                                            <p className="text-slate-500 text-xs">kcal</p>
                                        </div>
                                        <div className="text-center p-2 bg-white/5 rounded-lg">
                                            <p className="text-white font-semibold">{plan.targetProtein || '-'}</p>
                                            <p className="text-slate-500 text-xs">protein</p>
                                        </div>
                                        <div className="text-center p-2 bg-white/5 rounded-lg">
                                            <p className="text-white font-semibold">{plan.targetCarbs || '-'}</p>
                                            <p className="text-slate-500 text-xs">carbs</p>
                                        </div>
                                        <div className="text-center p-2 bg-white/5 rounded-lg">
                                            <p className="text-white font-semibold">{plan.targetFat || '-'}</p>
                                            <p className="text-slate-500 text-xs">fat</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/dashboard/diet-plans/${plan.id}`}
                                            className="flex-1 py-2 rounded-lg bg-white/10 text-white text-center text-sm hover:bg-white/20 transition"
                                        >
                                            View Details
                                        </Link>
                                        {plan.status === 'DRAFT' && (
                                            <button
                                                onClick={() => activateMutation.mutate(plan.id)}
                                                disabled={activateMutation.isPending}
                                                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition disabled:opacity-50"
                                            >
                                                Activate
                                            </button>
                                        )}
                                        {plan.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => completeMutation.mutate(plan.id)}
                                                disabled={completeMutation.isPending}
                                                className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 transition disabled:opacity-50"
                                            >
                                                Complete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredPlans?.length === 0 && !isLoading && (
                    <div className="text-center py-12">
                        <p className="text-slate-400">No diet plans found</p>
                        <Link
                            href="/dashboard/diet-plans/new"
                            className="inline-block mt-4 text-emerald-400 hover:text-emerald-300"
                        >
                            Create your first diet plan
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
