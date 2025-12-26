'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEvent } from '@/lib/api-hooks';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: event, isLoading } = useEvent(params.id as string);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!event) {
        return <div className="p-8">Event not found</div>;
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
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">{event.title}</h1>
                            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                {event.eventType}
                            </span>
                        </div>
                    </div>

                    {/* Date Range Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-6 border border-indigo-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-indigo-600 rounded-full p-2">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Date Range</h3>
                        </div>
                        <p className="text-gray-700 font-medium mb-2">
                            Start: {new Date(event.startDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                        {event.endDate && (
                            <p className="text-gray-700 font-medium">
                                End: {new Date(event.endDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                                <FileText className="w-5 h-5 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
