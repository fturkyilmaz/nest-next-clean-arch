'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReport } from '@/lib/api-hooks';
import { ArrowLeft, FileText, Download } from 'lucide-react';

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: report, isLoading } = useReport(params.id as string);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!report) {
        return <div className="p-8">Report not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">{report.title}</h1>
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                {report.reportType}
                            </span>
                        </div>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            <Download className="w-5 h-5" />
                            Export PDF
                        </button>
                    </div>

                    {/* Report Info */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 mb-8 border border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-600 rounded-full p-2">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Report Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Generated</p>
                                <p className="text-gray-900 font-semibold">
                                    {new Date(report.generatedAt).toLocaleString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Type</p>
                                <p className="text-gray-900 font-semibold">{report.reportType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Report Content Placeholder */}
                    <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300 text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Report Data Visualization</h3>
                        <p className="text-gray-600">
                            Chart and data visualization would appear here
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Integrate with a chart library like Recharts or Chart.js
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
