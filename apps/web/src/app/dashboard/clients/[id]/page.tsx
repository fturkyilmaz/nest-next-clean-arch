'use client';

import { useClient, useClientMetrics, useClientDietPlans, useAddClientMetrics } from '@/lib/api-hooks';
import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function ClientDetailPage() {
    const params = useParams();
    const clientId = params.id as string;

    const { data: client, isLoading: clientLoading } = useClient(clientId);
    const { data: metrics, isLoading: metricsLoading } = useClientMetrics(clientId);
    const { data: dietPlans, isLoading: plansLoading } = useClientDietPlans(clientId);
    const addMetricsMutation = useAddClientMetrics(clientId);

    const [showMetricsModal, setShowMetricsModal] = useState(false);

    if (clientLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!client) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <p className="text-white">Client not found</p>
            </div>
        );
    }

    const latestMetrics = metrics?.[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard/clients" className="text-slate-400 hover:text-white transition">
                                ← Clients
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Client Header */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                            {client.firstName[0]}{client.lastName[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-white">{client.firstName} {client.lastName}</h1>
                                <span className={`text-xs px-2 py-1 rounded-full ${client.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                    {client.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-slate-400">{client.email}</p>
                            {client.phone && <p className="text-slate-500">{client.phone}</p>}
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition">
                            Edit Client
                        </button>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                        {client.allergies?.map((allergy, i) => (
                            <span key={i} className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                                🚫 {allergy}
                            </span>
                        ))}
                        {client.conditions?.map((condition, i) => (
                            <span key={i} className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">
                                ⚕️ {condition}
                            </span>
                        ))}
                        {client.medications?.map((medication, i) => (
                            <span key={i} className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                💊 {medication}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Metrics Section */}
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Health Metrics</h2>
                            <button
                                onClick={() => setShowMetricsModal(true)}
                                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30 transition"
                            >
                                + Add Metrics
                            </button>
                        </div>

                        {/* Latest Metrics Cards */}
                        {latestMetrics ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <MetricCard label="Weight" value={`${latestMetrics.weight} kg`} icon="⚖️" />
                                <MetricCard label="Height" value={`${latestMetrics.height} cm`} icon="📏" />
                                <MetricCard label="BMI" value={latestMetrics.bmi?.toFixed(1) || '-'} icon="📊" />
                                <MetricCard label="Body Fat" value={latestMetrics.bodyFat ? `${latestMetrics.bodyFat}%` : '-'} icon="🔥" />
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-8">No metrics recorded yet</p>
                        )}

                        {/* Metrics History */}
                        {metrics && metrics.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-slate-400 mb-3">History</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {metrics.map((m, i) => (
                                        <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                            <span className="text-slate-400 text-sm">
                                                {new Date(m.recordedAt).toLocaleDateString()}
                                            </span>
                                            <div className="flex gap-4 text-sm">
                                                <span className="text-white">{m.weight} kg</span>
                                                <span className="text-slate-400">BMI: {m.bmi?.toFixed(1) || '-'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Diet Plans Section */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Diet Plans</h2>
                            <Link
                                href={`/dashboard/diet-plans/new?clientId=${clientId}`}
                                className="text-emerald-400 hover:text-emerald-300 text-sm"
                            >
                                + New
                            </Link>
                        </div>

                        {plansLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : dietPlans?.length ? (
                            <div className="space-y-3">
                                {dietPlans.map(plan => (
                                    <Link
                                        key={plan.id}
                                        href={`/dashboard/diet-plans/${plan.id}`}
                                        className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium">{plan.name}</p>
                                            <StatusBadge status={plan.status} />
                                        </div>
                                        <p className="text-slate-500 text-sm mt-1">{plan.targetCalories} kcal/day</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-4">No diet plans</p>
                        )}
                    </div>
                </div>
            </main>

            {/* Add Metrics Modal */}
            {showMetricsModal && (
                <MetricsModal
                    onClose={() => setShowMetricsModal(false)}
                    onSubmit={async (data) => {
                        await addMetricsMutation.mutateAsync(data);
                        setShowMetricsModal(false);
                    }}
                    isLoading={addMetricsMutation.isPending}
                />
            )}
        </div>
    );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="p-4 rounded-xl bg-white/5 text-center">
            <span className="text-2xl">{icon}</span>
            <p className="text-xl font-bold text-white mt-2">{value}</p>
            <p className="text-slate-500 text-sm">{label}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        DRAFT: 'bg-amber-500/20 text-amber-400',
        ACTIVE: 'bg-emerald-500/20 text-emerald-400',
        COMPLETED: 'bg-blue-500/20 text-blue-400',
        CANCELLED: 'bg-red-500/20 text-red-400',
    };
    return (
        <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors.DRAFT}`}>
            {status}
        </span>
    );
}

function MetricsModal({ onClose, onSubmit, isLoading }: {
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
}) {
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        bodyFat: '',
        waist: '',
        hip: '',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            weight: parseFloat(formData.weight),
            height: parseFloat(formData.height),
            bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
            waist: formData.waist ? parseFloat(formData.waist) : undefined,
            hip: formData.hip ? parseFloat(formData.hip) : undefined,
            notes: formData.notes || undefined,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">Add Health Metrics</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-400">Weight (kg) *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.weight}
                                onChange={(e) => setFormData(f => ({ ...f, weight: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Height (cm) *</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.height}
                                onChange={(e) => setFormData(f => ({ ...f, height: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-slate-400">Body Fat %</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.bodyFat}
                                onChange={(e) => setFormData(f => ({ ...f, bodyFat: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Waist (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.waist}
                                onChange={(e) => setFormData(f => ({ ...f, waist: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400">Hip (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.hip}
                                onChange={(e) => setFormData(f => ({ ...f, hip: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-400">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                            rows={2}
                            className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 text-white font-medium disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Save Metrics'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
