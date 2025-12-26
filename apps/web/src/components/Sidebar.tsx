'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardList,
    UtensilsCrossed,
    Apple,
    Flag,
    FileBarChart,
    History,
    Activity,
    Settings,
    ChevronRight
} from 'lucide-react';

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Diet Plans', href: '/dashboard/diet-plans', icon: ClipboardList },
    { name: 'Meals', href: '/dashboard/meals', icon: UtensilsCrossed },
    { name: 'Foods', href: '/dashboard/foods', icon: Apple },
    { name: 'Events', href: '/dashboard/events', icon: Flag },
    { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
    { name: 'Activity Logs', href: '/dashboard/activity', icon: History },
    { name: 'Metrics', href: '/dashboard/metrics', icon: Activity },
    { name: 'Users', href: '/dashboard/users', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 min-h-screen bg-slate-900 border-r border-white/10 flex flex-col fixed left-0 top-16 z-40">
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'group-hover:text-white'}`} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                        </Link>
                    );
                })}
            </div>

            {/* User Info / Profile bit at bottom if needed */}
            <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white uppercase shadow-lg shadow-emerald-500/20">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Admin Account</p>
                        <p className="text-xs text-slate-500 truncate">System Manager</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
