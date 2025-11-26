'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { Equipment, EquipmentCategory, EquipmentStatus } from '@/lib/types';

interface OrderHistoryItem {
  id: number;
  order_id: number;
  item_type: 'sale' | 'rental';
  quantity: number;
  unit_price: number;
  rental_start: string | null;
  rental_end: string | null;
  total: number;
  order_number: string;
  event_date: string | null;
  order_status: string;
  customer_name: string;
  customer_company: string | null;
}

interface ReservationHistoryItem {
  id: number;
  reservation_date: string;
  event_date: string;
  time_out: string | null;
  time_due_in: string | null;
  time_returned: string | null;
  status: string;
  condition_notes: string | null;
  order_number?: string;
  customer_name?: string;
  customer_company?: string | null;
}

const categoryColors: Record<EquipmentCategory, string> = {
  audio: 'var(--color-info)',
  video: 'var(--color-secondary)',
  lighting: 'var(--color-warning)',
  other: 'var(--color-text-muted)',
};

const statusColors: Record<EquipmentStatus, string> = {
  available: 'var(--color-success)',
  reserved: 'var(--color-info)',
  out: 'var(--color-warning)',
  maintenance: 'var(--color-danger)',
};

export default function EquipmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [reservationHistory, setReservationHistory] = useState<ReservationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    serial_number: '',
    name: '',
    category: 'audio' as EquipmentCategory,
    sale_price: '',
    rental_rate: '',
    description: '',
    specifications: '',
    status: 'available' as EquipmentStatus,
    maintenance_due_date: '',
  });

  useEffect(() => {
    fetchEquipment();
    fetchHistory();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/equipment/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEquipment(data);
        setFormData({
          serial_number: data.serial_number || '',
          name: data.name || '',
          category: data.category || 'audio',
          sale_price: data.sale_price?.toString() || '',
          rental_rate: data.rental_rate?.toString() || '',
          description: data.description || '',
          specifications: data.specifications || '',
          status: data.status || 'available',
          maintenance_due_date: data.maintenance_due_date?.split('T')[0] || '',
        });
      } else {
        router.push('/equipment');
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/equipment/${id}/history`);
      if (res.ok) {
        const data = await res.json();
        setOrderHistory(data.order_items || []);
        setReservationHistory(data.reservations || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
          rental_rate: formData.rental_rate ? parseFloat(formData.rental_rate) : null,
          maintenance_due_date: formData.maintenance_due_date || null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEquipment(updated);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to save equipment:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  // Calculate totals
  const totalRentals = orderHistory.filter((h) => h.item_type === 'rental').length;
  const totalSales = orderHistory.filter((h) => h.item_type === 'sale').length;
  const totalRevenue = orderHistory.reduce((sum, h) => sum + (Number(h.total) || 0), 0);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton h-8 w-48" />
              <div className="skeleton h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-10 w-20" />
              <div className="skeleton h-10 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="skeleton h-64" />
              <div className="skeleton h-48" />
            </div>
            <div className="skeleton h-64" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!equipment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p style={{ color: 'var(--color-text-muted)' }}>Equipment not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                {equipment.name}
              </h1>
              <span
                className="badge"
                style={{
                  backgroundColor: `${statusColors[equipment.status]}20`,
                  color: statusColors[equipment.status],
                }}
              >
                {equipment.status}
              </span>
            </div>
            {equipment.serial_number && (
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                S/N: {equipment.serial_number}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/equipment')} className="btn btn-secondary">
              Back
            </button>
            <button onClick={() => setIsEditModalOpen(true)} className="btn btn-primary">
              Edit Equipment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Equipment Details */}
            <div className="card p-6">
              <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Equipment Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Category</p>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: `${categoryColors[equipment.category]}20`,
                      color: categoryColors[equipment.category],
                    }}
                  >
                    {equipment.category}
                  </span>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Serial Number</p>
                  <p style={{ color: 'var(--color-text-primary)' }}>{equipment.serial_number || '-'}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Sale Price</p>
                  <p style={{ color: 'var(--color-accent)' }}>{formatCurrency(equipment.sale_price)}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Rental Rate</p>
                  <p style={{ color: 'var(--color-accent)' }}>
                    {equipment.rental_rate ? `${formatCurrency(equipment.rental_rate)}/day` : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Description</p>
                  <p style={{ color: 'var(--color-text-primary)' }}>{equipment.description || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Specifications</p>
                  <p className="whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>
                    {equipment.specifications || '-'}
                  </p>
                </div>
                {equipment.maintenance_due_date && (
                  <div className="col-span-2">
                    <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Maintenance Due</p>
                    <p style={{ color: 'var(--color-warning)' }}>{formatDate(equipment.maintenance_due_date)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order History */}
            <div className="card p-6">
              <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Order History
              </h2>
              {orderHistory.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 mx-auto mb-3"
                    style={{ color: 'var(--color-text-muted)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p style={{ color: 'var(--color-text-muted)' }}>No order history for this equipment.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((item, index) => (
                        <tr key={item.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                          <td>
                            <Link
                              href={`/orders/${item.order_id}`}
                              className="font-medium transition-colors"
                              style={{ color: 'var(--color-accent)' }}
                            >
                              {item.order_number}
                            </Link>
                          </td>
                          <td>
                            <div style={{ color: 'var(--color-text-primary)' }}>{item.customer_name}</div>
                            {item.customer_company && (
                              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {item.customer_company}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-neutral capitalize">{item.item_type}</span>
                          </td>
                          <td style={{ color: 'var(--color-text-secondary)' }}>
                            {formatDate(item.event_date)}
                          </td>
                          <td className="text-right font-medium" style={{ color: 'var(--color-success)' }}>
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Reservation History */}
            {reservationHistory.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  Reservation History
                </h2>
                <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Event Date</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Times</th>
                        <th>Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservationHistory.map((res, index) => (
                        <tr key={res.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                          <td style={{ color: 'var(--color-text-primary)' }}>
                            {formatDate(res.event_date)}
                          </td>
                          <td>
                            <div style={{ color: 'var(--color-text-primary)' }}>
                              {res.customer_name || res.order_number || '-'}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                res.status === 'returned' ? 'badge-success' :
                                res.status === 'out' ? 'badge-warning' :
                                res.status === 'reserved' ? 'badge-info' : 'badge-neutral'
                              }`}
                            >
                              {res.status}
                            </span>
                          </td>
                          <td className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {res.time_out && <div>Out: {res.time_out}</div>}
                            {res.time_due_in && <div>Due: {res.time_due_in}</div>}
                            {res.time_returned && <div>Back: {res.time_returned}</div>}
                          </td>
                          <td className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {res.condition_notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="card p-6">
              <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Usage Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--color-text-muted)' }}>Total Rentals</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--color-info)' }}>
                    {totalRentals}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--color-text-muted)' }}>Total Sales</span>
                  <span className="text-xl font-bold" style={{ color: 'var(--color-success)' }}>
                    {totalSales}
                  </span>
                </div>
                <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Revenue</span>
                    <span className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      {formatCurrency(totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, status: 'maintenance' }));
                    setIsEditModalOpen(true);
                  }}
                  className="btn btn-secondary w-full justify-start"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Mark for Maintenance
                </button>
                <Link href="/reservations" className="btn btn-secondary w-full justify-start">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Create Reservation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Equipment"
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Name <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EquipmentCategory })}
                className="input select"
              >
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="lighting">Lighting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Sale Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  className="input pl-7"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Rental Rate (per day)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rental_rate}
                  onChange={(e) => setFormData({ ...formData, rental_rate: e.target.value })}
                  className="input pl-7"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EquipmentStatus })}
                className="input select"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="out">Out</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Maintenance Due Date
              </label>
              <input
                type="date"
                value={formData.maintenance_due_date}
                onChange={(e) => setFormData({ ...formData, maintenance_due_date: e.target.value })}
                className="input"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="input"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Specifications
              </label>
              <textarea
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                rows={3}
                className="input"
              />
            </div>
          </div>

          <div
            className="flex justify-end gap-3 pt-4 mt-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
