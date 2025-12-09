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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-white">Diet Management</span>
                        </div>
                        <nav className="flex items-center gap-6">
                            <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
                            <Link href="/dashboard/clients" className="text-slate-400 hover:text-white transition">Clients</Link>
                            <Link href="/dashboard/diet-plans" className="text-slate-400 hover:text-white transition">Diet Plans</Link>
                            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                                <span className="text-sm text-slate-400">{user?.firstName} {user?.lastName}</span>
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-400 hover:text-white transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Welcome back, {user?.firstName}!</h1>
                    <p className="text-slate-400 mt-1">Here's what's happening with your clients today.</p>
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
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Recent Clients</h2>
                            <Link href="/dashboard/clients" className="text-emerald-400 hover:text-emerald-300 text-sm">
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
                                        className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-semibold">
                                            {client.firstName[0]}{client.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{client.firstName} {client.lastName}</p>
                                            <p className="text-slate-400 text-sm">{client.email}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${client.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
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
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Recent Diet Plans</h2>
                            <Link href="/dashboard/diet-plans" className="text-emerald-400 hover:text-emerald-300 text-sm">
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
                                        className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{plan.name}</p>
                                            <p className="text-slate-400 text-sm">{plan.targetCalories} kcal/day</p>
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
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-400 text-sm">{title}</p>
                    {loading ? (
                        <div className="h-8 w-16 bg-white/10 rounded animate-pulse mt-1" />
                    ) : (
                        <p className="text-3xl font-bold text-white mt-1">{value}</p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
            </div>
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
