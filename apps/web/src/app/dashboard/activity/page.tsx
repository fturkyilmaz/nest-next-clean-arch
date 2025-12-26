'use client';

import { useAudits } from '@/lib/api-hooks';
import { History, User } from 'lucide-react';

export default function ActivityPage() {
    const { data: audits, isLoading } = useAudits();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
                <p className="text-gray-600">View system activity and audit trail</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : audits?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity logs found</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {audits?.map((audit) => (
                        <div key={audit.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                            {audit.action}
                                        </span>
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                            {audit.entity}
                                        </span>
                                    </div>

                                    {audit.entityId && (
                                        <p className="text-sm text-gray-600 mb-2">
                                            Entity ID: <code className="bg-gray-100 px-2 py-1 rounded">{audit.entityId}</code>
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span>User: {audit.userId.slice(0, 8)}...</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <History className="w-4 h-4" />
                                            <span>{formatDate(audit.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
