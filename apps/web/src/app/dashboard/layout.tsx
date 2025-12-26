'use client';

import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-900">
            <Sidebar />
            <div className="flex-1 ml-64 min-h-screen bg-slate-100 flex flex-col">
                {/* We can add a sub-header here if needed, or just padding */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
