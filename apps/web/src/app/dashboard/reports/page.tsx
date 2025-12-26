'use client';

import { useReports } from '@/lib/api-hooks';
import Link from 'next/link';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportButton, type ExportFormat } from '@/components/ui/export-button';
import { useExport } from '@/hooks/useExport';

export default function ReportsPage() {
    const { data: reports, isLoading } = useReports();
    const { exportTable } = useExport({ defaultFileName: 'reports' });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleExportReports = async (format: ExportFormat) => {
        if (!reports || reports.length === 0) {
            alert('No reports to export');
            return;
        }

        const exportData = reports.map(report => ({
            Title: report.title,
            Type: report.reportType,
            Generated: formatDate(report.generatedAt),
            Status: 'Completed'
        }));

        await exportTable(exportData, `reports-${new Date().toISOString().split('T')[0]}`, format);
    };

    return (
        <div className="p-8">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
                    <p className="text-gray-600">View and generate reports</p>
                </div>
                <ExportButton
                    onExport={handleExportReports}
                    formats={['excel', 'csv']}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : reports?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports?.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div className="text-sm font-medium text-gray-900">{report.title}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                                            {report.reportType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(report.generatedAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <Link href={`/dashboard/reports/${report.id}`} className="text-indigo-600 hover:text-indigo-900 inline-block">
                                            View Report
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
