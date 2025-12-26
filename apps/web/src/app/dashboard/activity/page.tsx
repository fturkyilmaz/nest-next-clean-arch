'use client';

import { useAudits } from '@/lib/api-hooks';
import { Activity, Filter } from 'lucide-react';
import { useState } from 'react';

export default function ActivityPage() {
    const { data: audits, isLoading } = useAudits();
    const [filterAction, setFilterAction] = useState<string>('');
    const [filterEntity, setFilterEntity] = useState<string>('');

    const filteredAudits = audits?.filter((audit) => {
        const actionMatch = !filterAction || audit.action.toLowerCase().includes(filterAction.toLowerCase());
        const entityMatch = !filterEntity || audit.entity.toLowerCase().includes(filterEntity.toLowerCase());
        return actionMatch && entityMatch;
    });

    const actions = Array.from(new Set(audits?.map((a) => a.action) || []));
    const entities = Array.from(new Set(audits?.map((a) => a.entity) || []));

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActionColor = (action: string) => {
        const actionLower = action.toLowerCase();
        if (actionLower.includes('create')) return 'bg-green-100 text-green-700';
        if (actionLower.includes('delete')) return 'bg-red-100 text-red-700';
        if (actionLower.includes('update')) return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
                <p className="text-gray-600">View system activity and audit trail</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Actions</option>
                            {actions.map((action) => (
                                <option key={action} value={action}>
                                    {action}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                        <select
                            value={filterEntity}
                            onChange={(e) => setFilterEntity(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Entities</option>
                            {entities.map((entity) => (
                                <option key={entity} value={entity}>
                                    {entity}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Activity Timeline */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredAudits?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No activity logs found</h3>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAudits?.map((audit, index) => (
                        <div key={audit.id} className="relative">
                            {/* Timeline line */}
                            {index < (filteredAudits?.length || 0) - 1 && (
                                <div className="absolute left-6 top-12 w-0.5 h-12 bg-gray-300"></div>
                            )}

                            {/* Activity item */}
                            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    {/* Timeline dot */}
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 border-4 border-white shadow">
                                            <Activity className="h-6 w-6 text-indigo-600" />
                                        </div>
                                    </div>

                                    {/* Activity content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(audit.action)}`}>
                                                {audit.action}
                                            </span>
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                                {audit.entity}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                            <div>
                                                <span className="font-semibold">User:</span>{' '}
                                                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                                                    {audit.userId.substring(0, 8)}
                                                </code>
                                            </div>
                                            {audit.entityId && (
                                                <div>
                                                    <span className="font-semibold">ID:</span>{' '}
                                                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                                                        {audit.entityId.substring(0, 8)}
                                                    </code>
                                                </div>
                                            )}
                                            {audit.ipAddress && (
                                                <div>
                                                    <span className="font-semibold">IP:</span> {audit.ipAddress}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs text-gray-500">
                                            {formatDate(audit.createdAt)}
                                        </div>

                                        {audit.changes && Object.keys(audit.changes).length > 0 && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded text-xs">
                                                <span className="font-semibold">Changes:</span>
                                                <pre className="mt-1 whitespace-pre-wrap break-words">
                                                    {JSON.stringify(audit.changes, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="text-center pt-6 pb-4 text-sm text-gray-500">
                        Showing {filteredAudits?.length || 0} of {audits?.length || 0} activity logs
                    </div>
                </div>
            )}
        </div>
    );
}
