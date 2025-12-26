'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReport } from '@/lib/api-hooks';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { useState } from 'react';
import {
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  generateNutritionChartData,
  generateWeightChartData,
  generateMacroDistributionData,
} from '@/components/charts/ChartComponents';
import { generatePDF, generateNutritionReportSections } from '@/lib/pdf-export';

export default function ReportDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: report, isLoading } = useReport(params.id as string);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const sections = generateNutritionReportSections(
                'Client Name',
                {
                    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    end: new Date(),
                },
                {}
            );

            await generatePDF({
                title: report?.title || 'Report',
                subtitle: `Type: ${report?.reportType}`,
                metadata: {
                    'Report ID': report?.id || 'N/A',
                    'Generated': new Date(report?.generatedAt || Date.now()).toLocaleDateString(),
                },
                sections,
                generatedDate: new Date(),
            });
        } catch (error) {
            console.error('Error exporting PDF:', error);
        } finally {
            setIsExporting(false);
        }
    };

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

    const nutritionData = generateNutritionChartData(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 7);
    const weightData = generateWeightChartData(new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000), 12);
    const macroData = generateMacroDistributionData();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
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
                        <button 
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                        >
                            <Download className="w-5 h-5" />
                            {isExporting ? 'Exporting...' : 'Export PDF'}
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

                    {/* Charts Section */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nutrition Analysis</h2>
                            <LineChartComponent
                                data={nutritionData}
                                title="Daily Nutritional Intake (7 days)"
                                className="bg-white border border-gray-200 rounded-lg p-4"
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Weight Tracking</h2>
                            <LineChartComponent
                                data={weightData}
                                title="Weight Progress (12 weeks)"
                                className="bg-white border border-gray-200 rounded-lg p-4"
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Macro Distribution</h2>
                            <PieChartComponent
                                data={macroData}
                                title="Target Macronutrient Distribution"
                                className="bg-white border border-gray-200 rounded-lg p-4"
                            />
                        </div>

                        {/* Summary Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li>• Average daily caloric intake: 2,100 kcal</li>
                                <li>• Protein consumption: 70g per day on average</li>
                                <li>• Weight progress: -2.5 kg over the past 12 weeks</li>
                                <li>• Macronutrient distribution is within target ranges</li>
                                <li>• Recommended action: Increase protein intake by 10-15g daily</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
