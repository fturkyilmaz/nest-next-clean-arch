'use client';

import { useEvents } from '@/lib/api-hooks';
import Link from 'next/link';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';

export default function EventsPage() {
    const { data: events, isLoading } = useEvents();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <Link
                        href="/dashboard/events/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Create Event
                    </Link>
                </div>
                <p className="text-gray-600">Manage calendar events and activities</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : events?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events?.map((event) => (
                        <Link
                            key={event.id}
                            href={`/dashboard/events/${event.id}`}
                            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                                    {event.eventType}
                                </span>
                            </div>

                            {event.description && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <CalendarIcon className="w-4 h-4" />
                                <span>
                                    {formatDate(event.startDate)}
                                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
