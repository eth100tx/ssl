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

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8 text-gray-500">Loading order...</div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-8 text-gray-500">Order not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="text-gray-600">
              {order.customer_name} {order.customer_company && `(${order.customer_company})`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/orders')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSaveOrder}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <select
                    value={order.customer_id}
                    onChange={(e) => setOrder({ ...order, customer_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={order.type}
                    onChange={(e) => setOrder({ ...order, type: e.target.value as OrderType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {orderTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={order.status}
                    onChange={(e) => setOrder({ ...order, status: e.target.value as OrderStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {orderStatuses.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={order.event_date?.split('T')[0] || ''}
                    onChange={(e) => setOrder({ ...order, event_date: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={order.payment_method || ''}
                    onChange={(e) => setOrder({ ...order, payment_method: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={order.payment_terms || ''}
                    onChange={(e) => setOrder({ ...order, payment_terms: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <textarea
                    value={order.comments || ''}
                    onChange={(e) => setOrder({ ...order, comments: e.target.value || null })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Event Location */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={order.event_address || ''}
                    onChange={(e) => setOrder({ ...order, event_address: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={order.event_city || ''}
                    onChange={(e) => setOrder({ ...order, event_city: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={order.event_state || ''}
                      onChange={(e) => setOrder({ ...order, event_state: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                    <input
                      type="text"
                      value={order.event_zip || ''}
                      onChange={(e) => setOrder({ ...order, event_zip: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
                <button
                  onClick={() => setIsItemModalOpen(true)}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  + Add Item
                </button>
              </div>

              {(!order.items || order.items.length === 0) ? (
                <p className="text-gray-500 text-center py-4">No items added yet.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty/Hrs</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm capitalize">{item.item_type}</td>
                        <td className="px-4 py-2 text-sm">
                          {item.equipment_name || item.description || '-'}
                          {item.equipment_serial && (
                            <span className="text-gray-500 text-xs ml-1">({item.equipment_serial})</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {item.item_type === 'operator' ? item.hours : item.quantity}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(item.total)}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Sidebar - Totals */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Equipment Sales</span>
                  <span className="font-medium">{formatCurrency(order.sales_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Equipment Rentals</span>
                  <span className="font-medium">{formatCurrency(order.rental_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Operator Support</span>
                  <span className="font-medium">{formatCurrency(order.operator_total)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {formatCurrency(order.total_cost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Info</h2>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.customer_name}</p>
                {order.customer_company && <p className="text-gray-600">{order.customer_company}</p>}
                {order.customer_phone && <p className="text-gray-600">{order.customer_phone}</p>}
                {order.customer_address && (
                  <p className="text-gray-600">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Type</label>
            <select
              value={itemForm.item_type}
              onChange={(e) => setItemForm({ ...itemForm, item_type: e.target.value as OrderItemType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="sale">Equipment Sale</option>
              <option value="rental">Equipment Rental</option>
              <option value="operator">Operator Support</option>
            </select>
          </div>

          {itemForm.item_type !== 'operator' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
              <select
                value={itemForm.equipment_id}
                onChange={(e) => handleEquipmentSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {itemForm.item_type === 'operator' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.unit_price}
                  onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={itemForm.hours}
                  onChange={(e) => setItemForm({ ...itemForm, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {itemForm.item_type === 'rental' ? 'Rate ($/day)' : 'Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.unit_price}
                    onChange={(e) => setItemForm({ ...itemForm, unit_price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {itemForm.item_type === 'rental' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rental Start</label>
                    <input
                      type="date"
                      value={itemForm.rental_start}
                      onChange={(e) => setItemForm({ ...itemForm, rental_start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rental End</label>
                    <input
                      type="date"
                      value={itemForm.rental_end}
                      onChange={(e) => setItemForm({ ...itemForm, rental_end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add Item
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
