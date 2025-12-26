'use client';

import { useCurrentUser, useClients, useDietPlans, useLogout } from '@/lib/api-hooks';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { data: clients, isLoading: clientsLoading } = useClients();
    const { data: dietPlans, isLoading: plansLoading } = useDietPlans();
    const logoutMutation = useLogout();

    const handleLogout = async () => {
        await logoutMutation.mutateAsync();
        router.push('/login');
    };

    if (userLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    const activePlans = dietPlans?.filter(p => p.status === 'ACTIVE').length || 0;
    const totalClients = clients?.length || 0;

    return (
        <div className="bg-slate-100 min-h-full">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-900">Welcome back, {user?.firstName}! ✨</h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Here's a quick overview of your practice statistics.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Clients"
                        value={totalClients}
                        icon="👥"
                        color="from-blue-500 to-blue-600"
                        loading={clientsLoading}
                    />
                    <StatCard
                        title="Active Plans"
                        value={activePlans}
                        icon="📋"
                        color="from-emerald-500 to-emerald-600"
                        loading={plansLoading}
                    />
                    <StatCard
                        title="Draft Plans"
                        value={dietPlans?.filter(p => p.status === 'DRAFT').length || 0}
                        icon="✏️"
                        color="from-amber-500 to-amber-600"
                        loading={plansLoading}
                    />
                    <StatCard
                        title="Completed"
                        value={dietPlans?.filter(p => p.status === 'COMPLETED').length || 0}
                        icon="✅"
                        color="from-purple-500 to-purple-600"
                        loading={plansLoading}
                    />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Clients */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">Recent Clients</h2>
                            <Link href="/dashboard/clients" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                View all →
                            </Link>
                        </div>
                        {clientsLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {clients?.slice(0, 5).map(client => (
                                    <Link
                                        key={client.id}
                                        href={`/dashboard/clients/${client.id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-indigo-200 transition-all duration-200"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {client.firstName[0]}{client.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 font-semibold">{client.firstName} {client.lastName}</p>
                                            <p className="text-slate-500 text-sm font-medium">{client.email}</p>
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${client.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {client.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </Link>
                                ))}
                                {clients?.length === 0 && (
                                    <p className="text-slate-400 text-center py-4">No clients yet</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent Diet Plans */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-slate-900">Recent Diet Plans</h2>
                            <Link href="/dashboard/diet-plans" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                View all →
                            </Link>
                        </div>
                        {plansLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dietPlans?.slice(0, 5).map(plan => (
                                    <Link
                                        key={plan.id}
                                        href={`/dashboard/diet-plans/${plan.id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:border-indigo-200 transition-all duration-200"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-sm">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 font-semibold">{plan.name}</p>
                                            <p className="text-slate-500 text-sm font-medium">{plan.targetCalories} kcal/day</p>
                                        </div>
                                        <StatusBadge status={plan.status} />
                                    </Link>
                                ))}
                                {dietPlans?.length === 0 && (
                                    <p className="text-slate-400 text-center py-4">No diet plans yet</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color, loading }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    loading?: boolean;
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{title}</p>
                    {loading ? (
                        <div className="h-8 w-16 bg-slate-100 rounded animate-pulse mt-2" />
                    ) : (
                        <p className="text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
                    )}
                </div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-lg`}>
                    <span className="drop-shadow-sm">{icon}</span>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
        ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        COMPLETED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        CANCELLED: 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return (
        <span className={`text-xs px-3 py-1 rounded-full font-bold border ${colors[status] || colors.DRAFT}`}>
            {status}
        </span>
    );
}
