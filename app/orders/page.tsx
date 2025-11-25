'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { Order, OrderType, OrderStatus, Customer } from '@/lib/types';

const orderTypes: { value: OrderType; label: string; icon: string }[] = [
  { value: 'proposal', label: 'Proposal', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { value: 'order', label: 'Order', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { value: 'invoice', label: 'Invoice', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
];

const orderStatuses: { value: OrderStatus; label: string; badge: string }[] = [
  { value: 'draft', label: 'Draft', badge: 'badge-neutral' },
  { value: 'sent', label: 'Sent', badge: 'badge-info' },
  { value: 'accepted', label: 'Accepted', badge: 'badge-success' },
  { value: 'completed', label: 'Completed', badge: 'badge-accent' },
  { value: 'cancelled', label: 'Cancelled', badge: 'badge-danger' },
];

interface OrderWithCustomer extends Order {
  customer_name?: string;
  customer_company?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    type: 'proposal' as OrderType,
    event_date: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterStatus) params.set('status', filterStatus);

      const url = `/api/orders${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterType, filterStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) return;

    setSaving(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: parseInt(formData.customer_id),
          type: formData.type,
          event_date: formData.event_date || null,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        setIsModalOpen(false);
        window.location.href = `/orders/${order.id}`;
      }
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    return orderStatuses.find((s) => s.value === status)?.badge || 'badge-neutral';
  };

  const getTypeInfo = (type: OrderType) => {
    return orderTypes.find((t) => t.value === type) || orderTypes[0];
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
              Orders
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Manage proposals, orders, and invoices
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({ customer_id: '', type: 'proposal', event_date: '' });
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Order
          </button>
        </div>

        {/* Type Stats */}
        <div className="grid grid-cols-3 gap-4">
          {orderTypes.map((type) => {
            const count = orders.filter((o) => o.type === type.value).length;
            const total = orders
              .filter((o) => o.type === type.value)
              .reduce((sum, o) => sum + (Number(o.total_cost) || 0), 0);
            return (
              <button
                key={type.value}
                onClick={() => setFilterType(filterType === type.value ? '' : type.value)}
                className={`card p-4 text-left transition-all ${
                  filterType === type.value ? 'card-glow' : ''
                }`}
                style={{
                  borderColor: filterType === type.value ? 'var(--color-accent-dim)' : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: filterType === type.value
                          ? 'rgba(245, 166, 35, 0.2)'
                          : 'var(--color-bg-tertiary)',
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        style={{ color: filterType === type.value ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={type.icon} />
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {count}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {type.label}s
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                      {formatCurrency(total)}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input select w-auto"
          >
            <option value="">All Status</option>
            {orderStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {(filterType || filterStatus) && (
            <button
              onClick={() => {
                setFilterType('');
                setFilterStatus('');
              }}
              className="btn btn-ghost"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton h-12 w-32" />
                  <div className="skeleton h-12 w-48" />
                  <div className="skeleton h-12 w-32" />
                  <div className="skeleton h-12 w-24" />
                  <div className="skeleton h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: 'var(--color-text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p style={{ color: 'var(--color-text-muted)' }}>
                No orders found. Create one to get started.
              </p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Type / Status</th>
                  <th>Event Date</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const typeInfo = getTypeInfo(order.type);
                  return (
                    <tr key={order.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                      <td>
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-medium transition-colors"
                          style={{ color: 'var(--color-accent)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-bright)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td>
                        <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {order.customer_name}
                        </div>
                        {order.customer_company && (
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {order.customer_company}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-2 mb-1">
                          <svg
                            className="w-4 h-4"
                            style={{ color: 'var(--color-text-muted)' }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={typeInfo.icon} />
                          </svg>
                          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <span className={`badge ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {formatDate(order.event_date)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span
                          className="font-medium"
                          style={{ color: Number(order.total_cost) > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                        >
                          {formatCurrency(Number(order.total_cost) || 0)}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/orders/${order.id}`}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-accent)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 166, 35, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-danger)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Order"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Customer <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              required
              className="input select"
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as OrderType })}
              className="input select"
            >
              {orderTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Event Date
            </label>
            <input
              type="date"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="input"
            />
          </div>

          <div
            className="flex justify-end gap-3 pt-4 mt-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.customer_id}
              className="btn btn-primary"
            >
              {saving ? 'Creating...' : 'Create & Edit'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
