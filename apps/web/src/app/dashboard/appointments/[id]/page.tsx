'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAppointment } from '@/lib/api-hooks';
import { Calendar, Clock, User, FileText, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: appointment, isLoading } = useAppointment(params.id as string);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment not found</h2>
                    <Link href="/dashboard/appointments" className="text-indigo-600 hover:text-indigo-700">
                        ← Back to appointments
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
            COMPLETED: 'bg-green-100 text-green-700 border-green-200',
            CANCELLED: 'bg-red-100 text-red-700 border-red-200',
        };
        const icons = {
            SCHEDULED: <Clock className="w-5 h-5" />,
            COMPLETED: <CheckCircle className="w-5 h-5" />,
            CANCELLED: <XCircle className="w-5 h-5" />,
        };
        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold border ${styles[status as keyof typeof styles]}`}>
                {icons[status as keyof typeof icons]}
                {status}
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{appointment.title}</h1>
                                {getStatusBadge(appointment.status)}
                            </div>
                        </div>

                        {/* Main Info Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Date & Time */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-indigo-600 rounded-full p-2">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>
                                </div>
                                <p className="text-gray-700 font-medium mb-2">
                                    {formatDate(appointment.scheduledAt)}
                                </p>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>Duration: {appointment.duration} minutes</span>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-purple-600 rounded-full p-2">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Client</h3>
                                </div>
                                <p className="text-gray-700 font-mono">
                                    ID: {appointment.clientId.slice(0, 8)}...
                                </p>
                                <Link
                                    href={`/dashboard/clients/${appointment.clientId}`}
                                    className="inline-flex items-center gap-2 mt-3 text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    View Client Profile →
                                </Link>
                            </div>
                        </div>

                        {/* Description */}
                        {appointment.description && (
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{appointment.description}</p>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                            <div>
                                <p className="text-sm text-gray-500">Created</p>
                                <p className="text-gray-900 font-medium">
                                    {new Date(appointment.createdAt).toLocaleDateString('en-US')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Updated</p>
                                <p className="text-gray-900 font-medium">
                                    {new Date(appointment.updatedAt).toLocaleDateString('en-US')}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {appointment.status === 'SCHEDULED' && (
                            <div className="flex gap-3 mt-6">
                                <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Mark as Completed
                                </button>
                                <button className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                    <XCircle className="w-5 h-5" />
                                    Cancel Appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
