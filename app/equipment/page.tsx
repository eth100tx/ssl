'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { Equipment, EquipmentCategory, EquipmentStatus } from '@/lib/types';

const categories: { value: EquipmentCategory; label: string; icon: string }[] = [
  { value: 'audio', label: 'Audio', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
  { value: 'video', label: 'Video', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { value: 'lighting', label: 'Lighting', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  { value: 'other', label: 'Other', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
];

const statuses: { value: EquipmentStatus; label: string; badge: string }[] = [
  { value: 'available', label: 'Available', badge: 'badge-success' },
  { value: 'reserved', label: 'Reserved', badge: 'badge-warning' },
  { value: 'out', label: 'Out', badge: 'badge-info' },
  { value: 'maintenance', label: 'Maintenance', badge: 'badge-danger' },
];

const emptyEquipment = {
  serial_number: '',
  name: '',
  category: 'other' as EquipmentCategory,
  sale_price: '',
  rental_rate: '',
  description: '',
  specifications: '',
  status: 'available' as EquipmentStatus,
  maintenance_due_date: '',
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState(emptyEquipment);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterCategory) params.set('category', filterCategory);
      if (filterStatus) params.set('status', filterStatus);

      const url = `/api/equipment${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setEquipment(data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [filterCategory, filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEquipment();
  };

  const openCreateModal = () => {
    setEditingEquipment(null);
    setFormData(emptyEquipment);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Equipment) => {
    setEditingEquipment(item);
    setFormData({
      serial_number: item.serial_number || '',
      name: item.name || '',
      category: item.category || 'other',
      sale_price: item.sale_price?.toString() || '',
      rental_rate: item.rental_rate?.toString() || '',
      description: item.description || '',
      specifications: item.specifications || '',
      status: item.status || 'available',
      maintenance_due_date: item.maintenance_due_date?.split('T')[0] || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingEquipment
        ? `/api/equipment/${editingEquipment.id}`
        : '/api/equipment';
      const method = editingEquipment ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        rental_rate: formData.rental_rate ? parseFloat(formData.rental_rate) : null,
        maintenance_due_date: formData.maintenance_due_date || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchEquipment();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save equipment:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;

    try {
      const res = await fetch(`/api/equipment/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEquipment();
      }
    } catch (error) {
      console.error('Failed to delete equipment:', error);
    }
  };

  const getStatusBadge = (status: EquipmentStatus) => {
    return statuses.find((s) => s.value === status)?.badge || 'badge-neutral';
  };

  const getCategoryInfo = (category: EquipmentCategory) => {
    return categories.find((c) => c.value === category) || categories[3];
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
              Equipment
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Manage your inventory and track equipment status
            </p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Equipment
          </button>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const count = equipment.filter((e) => e.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(filterCategory === cat.value ? '' : cat.value)}
                className={`card p-4 text-left transition-all ${
                  filterCategory === cat.value ? 'card-glow' : ''
                }`}
                style={{
                  borderColor: filterCategory === cat.value ? 'var(--color-accent-dim)' : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: filterCategory === cat.value
                        ? 'rgba(245, 166, 35, 0.2)'
                        : 'var(--color-bg-tertiary)',
                    }}
                  >
                    <svg
                      className="w-5 h-5"
                      style={{ color: filterCategory === cat.value ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cat.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {count}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {cat.label}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--color-text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, serial number..."
                className="input pl-10"
              />
            </div>
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input select w-auto"
          >
            <option value="">All Status</option>
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {(filterCategory || filterStatus || search) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('');
                setSearch('');
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
                  <div className="skeleton h-12 w-48" />
                  <div className="skeleton h-12 w-24" />
                  <div className="skeleton h-12 w-32" />
                  <div className="skeleton h-12 w-24" />
                  <div className="skeleton h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : equipment.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: 'var(--color-text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p style={{ color: 'var(--color-text-muted)' }}>
                No equipment found. Add some to get started.
              </p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Pricing</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item, index) => {
                  const catInfo = getCategoryInfo(item.category);
                  return (
                    <tr key={item.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--color-bg-tertiary)' }}
                          >
                            <svg
                              className="w-5 h-5"
                              style={{ color: 'var(--color-accent)' }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={catInfo.icon} />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {item.name}
                            </div>
                            {item.serial_number && (
                              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                SN: {item.serial_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{catInfo.label}</span>
                      </td>
                      <td>
                        {item.sale_price && (
                          <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                            ${Number(item.sale_price).toFixed(2)}
                          </div>
                        )}
                        {item.rental_rate && (
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            ${Number(item.rental_rate).toFixed(2)}/day
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/equipment/${item.id}`}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-info)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            title="View Details & History"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: 'var(--color-accent)' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 166, 35, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as EquipmentCategory })
                }
                className="input select"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Sale Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Rental Rate ($/day)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.rental_rate}
                onChange={(e) => setFormData({ ...formData, rental_rate: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as EquipmentStatus })
                }
                className="input select"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Maintenance Due Date
              </label>
              <input
                type="date"
                value={formData.maintenance_due_date}
                onChange={(e) =>
                  setFormData({ ...formData, maintenance_due_date: e.target.value })
                }
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
                rows={2}
                className="input"
              />
            </div>
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
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : editingEquipment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
