'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateEvent } from '@/lib/api-hooks';
import { Calendar, FileText, Tag, ArrowLeft, Loader2 } from 'lucide-react';

type EventType = 'WORKOUT' | 'APPOINTMENT' | 'MEAL' | 'OTHER';

export default function NewEventPage() {
    const router = useRouter();
    const createEvent = useCreateEvent();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: 'OTHER' as EventType,
        startDate: '',
        endDate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createEvent.mutateAsync({
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            });

            router.push('/dashboard/events');
        } catch (error) {
            console.error('Failed to create event:', error);
        }
    };

    const eventTypes: { value: EventType; label: string; color: string }[] = [
        { value: 'WORKOUT', label: 'Workout', color: 'bg-red-100 text-red-800' },
        { value: 'APPOINTMENT', label: 'Appointment', color: 'bg-blue-100 text-blue-800' },
        { value: 'MEAL', label: 'Meal', color: 'bg-green-100 text-green-800' },
        { value: 'OTHER', label: 'Other', color: 'bg-purple-100 text-purple-800' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>

                <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
                <p className="text-gray-600 mt-2">Schedule a new event or activity</p>
            </div>

            {/* Form Card */}
            <div className="max-w-2xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText className="w-4 h-4" />
                                Event Title
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="e.g., Morning Workout Session"
                            />
                        </div>

                        {/* Event Type */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Tag className="w-4 h-4" />
                                Event Type
                            </label>
                            <select
                                required
                                value={formData.eventType}
                                onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                {eventTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    Start Date
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4" />
                                    End Date
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <FileText className="w-4 h-4" />
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                placeholder="Add event details, notes, or instructions..."
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createEvent.isPending}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {createEvent.isPending && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Create Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
