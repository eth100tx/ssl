'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { Reservation, Equipment, ReservationStatus } from '@/lib/types';

interface ReservationWithEquipment extends Reservation {
  equipment_name?: string;
  equipment_serial?: string;
  equipment_category?: string;
}

const statusColors: Record<ReservationStatus, string> = {
  reserved: 'bg-yellow-500',
  out: 'bg-blue-500',
  returned: 'bg-green-500',
  cancelled: 'bg-gray-400',
};

const statusLabels: { value: ReservationStatus; label: string }[] = [
  { value: 'reserved', label: 'Reserved' },
  { value: 'out', label: 'Out' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<ReservationWithEquipment[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationWithEquipment | null>(null);
  const [formData, setFormData] = useState({
    equipment_id: '',
    customer_name: '',
    event_date: '',
    time_out: '',
    time_due_in: '',
    status: 'reserved' as ReservationStatus,
    condition_notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [currentDate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const start = new Date(year, month, 1).toISOString().split('T')[0];
      const end = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const res = await fetch(`/api/reservations?start=${start}&end=${end}`);
      const data = await res.json();
      setReservations(data);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getReservationsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.filter((r) => r.event_date?.split('T')[0] === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedReservation(null);
    setFormData({
      equipment_id: '',
      customer_name: '',
      event_date: dateStr,
      time_out: '',
      time_due_in: '',
      status: 'reserved',
      condition_notes: '',
    });
    setIsModalOpen(true);
  };

  const handleReservationClick = (reservation: ReservationWithEquipment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReservation(reservation);
    setSelectedDate(null);
    setFormData({
      equipment_id: reservation.equipment_id.toString(),
      customer_name: reservation.customer_name || '',
      event_date: reservation.event_date?.split('T')[0] || '',
      time_out: reservation.time_out || '',
      time_due_in: reservation.time_due_in || '',
      status: reservation.status,
      condition_notes: reservation.condition_notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.equipment_id || !formData.event_date) return;

    setSaving(true);
    try {
      const url = selectedReservation
        ? `/api/reservations/${selectedReservation.id}`
        : '/api/reservations';
      const method = selectedReservation ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          equipment_id: parseInt(formData.equipment_id),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchReservations();
        fetchEquipment(); // Refresh equipment status
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save reservation:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReservation || !confirm('Delete this reservation?')) return;

    try {
      const res = await fetch(`/api/reservations/${selectedReservation.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchReservations();
        fetchEquipment();
      }
    } catch (error) {
      console.error('Failed to delete reservation:', error);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Equipment Calendar</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-sm">
          {statusLabels.map((s) => (
            <div key={s.value} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${statusColors[s.value]}`}></div>
              <span className="text-gray-600">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading calendar...</div>
          ) : (
            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const dayReservations = day ? getReservationsForDate(day) : [];
                const isToday =
                  day &&
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-b border-r p-1 ${
                      day ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50'
                    }`}
                    onClick={() => day && handleDayClick(day)}
                  >
                    {day && (
                      <>
                        <div
                          className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                            isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                          }`}
                        >
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayReservations.slice(0, 3).map((res) => (
                            <div
                              key={res.id}
                              onClick={(e) => handleReservationClick(res, e)}
                              className={`${statusColors[res.status]} text-white text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80`}
                              title={`${res.equipment_name} - ${res.customer_name || 'No customer'}`}
                            >
                              {res.equipment_name}
                            </div>
                          ))}
                          {dayReservations.length > 3 && (
                            <div className="text-xs text-gray-500 px-1">
                              +{dayReservations.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reservation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedReservation ? 'Edit Reservation' : 'New Reservation'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.equipment_id}
              onChange={(e) => setFormData({ ...formData, equipment_id: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select equipment...</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} {eq.serial_number ? `(${eq.serial_number})` : ''} - {eq.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Out</label>
              <input
                type="time"
                value={formData.time_out}
                onChange={(e) => setFormData({ ...formData, time_out: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Due In</label>
              <input
                type="time"
                value={formData.time_due_in}
                onChange={(e) => setFormData({ ...formData, time_due_in: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ReservationStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {statusLabels.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition Notes</label>
            <textarea
              value={formData.condition_notes}
              onChange={(e) => setFormData({ ...formData, condition_notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t">
            <div>
              {selectedReservation && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : selectedReservation ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
