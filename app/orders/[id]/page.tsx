'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { Order, OrderItem, OrderType, OrderStatus, Customer, Equipment, OrderItemType } from '@/lib/types';

const orderTypes: { value: OrderType; label: string }[] = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'order', label: 'Order' },
  { value: 'invoice', label: 'Invoice' },
];

const orderStatuses: { value: OrderStatus; label: string; badge: string }[] = [
  { value: 'draft', label: 'Draft', badge: 'badge-neutral' },
  { value: 'sent', label: 'Sent', badge: 'badge-info' },
  { value: 'accepted', label: 'Accepted', badge: 'badge-success' },
  { value: 'completed', label: 'Completed', badge: 'badge-accent' },
  { value: 'cancelled', label: 'Cancelled', badge: 'badge-danger' },
];

interface OrderWithDetails extends Order {
  customer_name?: string;
  customer_company?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_zip?: string;
  items?: (OrderItem & { equipment_name?: string; equipment_serial?: string })[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    item_type: 'rental' as OrderItemType,
    equipment_id: '',
    description: '',
    quantity: '1',
    unit_price: '',
    rental_start: '',
    rental_end: '',
    hours: '',
  });

  useEffect(() => {
    fetchOrder();
    fetchCustomers();
    fetchEquipment();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        router.push('/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
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

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/equipment');
      const data = await res.json();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  const handleSaveOrder = async () => {
    if (!order) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrder({ ...order, ...updated });
      }
    } catch (error) {
      console.error('Failed to save order:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/orders/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemForm,
          equipment_id: itemForm.equipment_id ? parseInt(itemForm.equipment_id) : null,
          quantity: parseInt(itemForm.quantity) || 1,
          unit_price: parseFloat(itemForm.unit_price) || 0,
          hours: itemForm.hours ? parseFloat(itemForm.hours) : null,
        }),
      });

      if (res.ok) {
        setIsItemModalOpen(false);
        setItemForm({
          item_type: 'rental',
          equipment_id: '',
          description: '',
          quantity: '1',
          unit_price: '',
          rental_start: '',
          rental_end: '',
          hours: '',
        });
        fetchOrder();
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Remove this item?')) return;

    try {
      const res = await fetch(`/api/orders/${id}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleEquipmentSelect = (equipmentId: string) => {
    setItemForm({ ...itemForm, equipment_id: equipmentId });
    if (equipmentId) {
      const eq = equipment.find((e) => e.id === parseInt(equipmentId));
      if (eq) {
        setItemForm({
          ...itemForm,
          equipment_id: equipmentId,
          description: eq.name,
          unit_price: itemForm.item_type === 'sale'
            ? (eq.sale_price?.toString() || '')
            : (eq.rental_rate?.toString() || ''),
        });
      }
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: OrderStatus) => {
    return orderStatuses.find((s) => s.value === status)?.badge || 'badge-neutral';
  };

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

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--color-text-muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p style={{ color: 'var(--color-text-muted)' }}>Order not found</p>
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
                {order.order_number}
              </h1>
              <span className={`badge ${getStatusBadge(order.status)}`}>{order.status}</span>
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {order.customer_name} {order.customer_company && `(${order.customer_company})`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/orders')}
              className="btn btn-secondary"
            >
              Back
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card p-6">
              <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Order Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Customer
                  </label>
                  <select
                    value={order.customer_id}
                    onChange={(e) => setOrder({ ...order, customer_id: parseInt(e.target.value) })}
                    className="input select"
                  >
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
                    value={order.type}
                    onChange={(e) => setOrder({ ...order, type: e.target.value as OrderType })}
                    className="input select"
                  >
                    {orderTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => setOrder({ ...order, status: e.target.value as OrderStatus })}
                    className="input select"
                  >
                    {orderStatuses.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={order.event_date?.split('T')[0] || ''}
                    onChange={(e) => setOrder({ ...order, event_date: e.target.value || null })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={order.payment_method || ''}
                    onChange={(e) => setOrder({ ...order, payment_method: e.target.value || null })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={order.payment_terms || ''}
                    onChange={(e) => setOrder({ ...order, payment_terms: e.target.value || null })}
                    className="input"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Comments
                  </label>
                  <textarea
                    value={order.comments || ''}
                    onChange={(e) => setOrder({ ...order, comments: e.target.value || null })}
                    rows={3}
                    className="input"
                  />
                </div>
              </div>
            </div>

            {/* Event Location */}
            <div className="card p-6">
              <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Event Location
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={order.event_address || ''}
                    onChange={(e) => setOrder({ ...order, event_address: e.target.value || null })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={order.event_city || ''}
                    onChange={(e) => setOrder({ ...order, event_city: e.target.value || null })}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      State
                    </label>
                    <input
                      type="text"
                      value={order.event_state || ''}
                      onChange={(e) => setOrder({ ...order, event_state: e.target.value || null })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={order.event_zip || ''}
                      onChange={(e) => setOrder({ ...order, event_zip: e.target.value || null })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                  Line Items
                </h2>
                <button
                  onClick={() => setIsItemModalOpen(true)}
                  className="btn btn-primary text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>

              {(!order.items || order.items.length === 0) ? (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 mx-auto mb-3"
                    style={{ color: 'var(--color-text-muted)' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p style={{ color: 'var(--color-text-muted)' }}>No items added yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Description</th>
                        <th className="text-right">Qty/Hrs</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={item.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                          <td>
                            <span className="badge badge-neutral capitalize">{item.item_type}</span>
                          </td>
                          <td>
                            <span style={{ color: 'var(--color-text-primary)' }}>
                              {item.equipment_name || item.description || '-'}
                            </span>
                            {item.equipment_serial && (
                              <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                                ({item.equipment_serial})
                              </span>
                            )}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            {item.item_type === 'operator' ? item.hours : item.quantity}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="text-right font-medium" style={{ color: 'var(--color-accent)' }}>
                            {formatCurrency(item.total)}
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 rounded transition-colors"
                              style={{ color: 'var(--color-danger)' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Totals */}
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>Equipment Sales</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(order.sales_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>Equipment Rentals</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(order.rental_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-muted)' }}>Operator Support</span>
                  <span style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(order.operator_total)}</span>
                </div>
                <div className="pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg tracking-wider" style={{ color: 'var(--color-text-primary)' }}>Total</span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {formatCurrency(order.total_cost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="card p-6">
              <h2 className="text-lg tracking-wider mb-4" style={{ color: 'var(--color-text-primary)' }}>
                Customer Info
              </h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{order.customer_name}</p>
                {order.customer_company && (
                  <p style={{ color: 'var(--color-text-muted)' }}>{order.customer_company}</p>
                )}
                {order.customer_phone && (
                  <p style={{ color: 'var(--color-text-muted)' }}>{order.customer_phone}</p>
                )}
                {order.customer_address && (
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    {order.customer_address}<br />
                    {[order.customer_city, order.customer_state, order.customer_zip].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Add Line Item"
        size="md"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Item Type
            </label>
            <select
              value={itemForm.item_type}
              onChange={(e) => setItemForm({ ...itemForm, item_type: e.target.value as OrderItemType })}
              className="input select"
            >
              <option value="sale">Equipment Sale</option>
              <option value="rental">Equipment Rental</option>
              <option value="operator">Operator Support</option>
            </select>
          </div>

          {itemForm.item_type !== 'operator' && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Equipment
              </label>
              <select
                value={itemForm.equipment_id}
                onChange={(e) => handleEquipmentSelect(e.target.value)}
                className="input select"
              >
                <option value="">Select equipment...</option>
                {equipment.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} {eq.serial_number ? `(${eq.serial_number})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              Description
            </label>
            <input
              type="text"
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="input"
            />
          </div>

          {itemForm.item_type === 'operator' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.unit_price}
                  onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={itemForm.hours}
                  onChange={(e) => setItemForm({ ...itemForm, hours: e.target.value })}
                  className="input"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {itemForm.item_type === 'rental' ? 'Rate ($/day)' : 'Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.unit_price}
                    onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              {itemForm.item_type === 'rental' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Rental Start
                    </label>
                    <input
                      type="date"
                      value={itemForm.rental_start}
                      onChange={(e) => setItemForm({ ...itemForm, rental_start: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Rental End
                    </label>
                    <input
                      type="date"
                      value={itemForm.rental_end}
                      onChange={(e) => setItemForm({ ...itemForm, rental_end: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div
            className="flex justify-end gap-3 pt-4 mt-4"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
