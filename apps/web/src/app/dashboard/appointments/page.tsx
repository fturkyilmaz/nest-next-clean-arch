/**
 * Appointments Dashboard Page
 *
 * Display and manage nutritionist appointments with reminders.
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocketEvent, WebSocketEventType } from '@diet/shared';
import { formatDistanceToNow, format, isBefore } from 'date-fns';
import Link from 'next/link';

interface Appointment {
  id: string;
  title: string;
  scheduledTime: Date;
  nutritionistId: string;
  nutritionistName: string;
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  reminderMinutes: number;
  createdAt: Date;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  // Fetch appointments
  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', user?.id, filter],
    queryFn: async () => {
      const res = await apiClient.get('/api/appointments', {
        params: { filter, limit: 50 },
      });
      return res.data.data || [];
    },
    enabled: !!user?.id,
  });

  // Real-time appointment updates
  useWebSocketEvent(WebSocketEventType.APPOINTMENT_CREATED, (data) => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  });

  useWebSocketEvent(WebSocketEventType.APPOINTMENT_UPDATED, (data) => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  });

  useWebSocketEvent(WebSocketEventType.APPOINTMENT_REMINDER, (reminder) => {
    // Show browser notification for appointment reminder
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Appointment Reminder: ${reminder.title}`, {
        body: `Your appointment is in ${reminder.reminderMinutesBefore} minutes`,
        tag: `appointment-${reminder.appointmentId}`,
      });
    }
  });

  // Cancel appointment
  const { mutate: cancelAppointment } = useMutation({
    mutationFn: (appointmentId: string) =>
      apiClient.patch(`/api/appointments/${appointmentId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Reschedule appointment
  const { mutate: rescheduleAppointment } = useMutation({
    mutationFn: ({ appointmentId, newTime }: { appointmentId: string; newTime: Date }) =>
      apiClient.patch(`/api/appointments/${appointmentId}`, {
        scheduledTime: newTime,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const appointments = appointmentsData || [];

  const getAppointmentColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusBadge = (appointment: Appointment) => {
    const isUpcoming = isBefore(new Date(), new Date(appointment.scheduledTime));

    if (appointment.status === 'CANCELLED') {
      return <span className="text-red-600 text-xs font-semibold">CANCELLED</span>;
    } else if (appointment.status === 'COMPLETED') {
      return <span className="text-green-600 text-xs font-semibold">COMPLETED</span>;
    } else if (isUpcoming) {
      return <span className="text-blue-600 text-xs font-semibold">UPCOMING</span>;
    } else {
      return <span className="text-gray-600 text-xs font-semibold">PAST</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your nutritionist appointments</p>
        </div>
        <Link href="/dashboard/appointments/new">
          <Button>Schedule Appointment</Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {(['upcoming', 'past', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              filter === f
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No appointments found. Schedule one now to get started.
          </Card>
        ) : (
          appointments.map((appointment: Appointment) => (
            <Card key={appointment.id} className="p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{appointment.title}</h3>
                    {getStatusBadge(appointment)}
                  </div>

                  <p className="text-gray-600 mt-1">
                    With {appointment.nutritionistName}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-gray-600">Date & Time:</span>
                      <p className="font-semibold">
                        {format(new Date(appointment.scheduledTime), 'PPp')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Reminder:</span>
                      <p className="font-semibold">
                        {appointment.reminderMinutes} minutes before
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Scheduled:</span>
                      <p className="font-semibold">
                        {formatDistanceToNow(new Date(appointment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>

                {appointment.status === 'SCHEDULED' && (
                  <div className="flex flex-col gap-2 ml-4">
                    <Link href={`/dashboard/appointments/${appointment.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
