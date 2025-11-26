'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { Employee, EmployeeRole, EmployeeStatus, EmployeeSchedule, Order } from '@/lib/types';

const emptyEmployee = {
  name: '',
  role: 'contract' as EmployeeRole,
  phone: '',
  beeper: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  email: '',
  skills: '',
  hourly_rate: '',
  status: 'active' as EmployeeStatus,
  notes: '',
};

const roleLabels: Record<EmployeeRole, string> = {
  president: 'President',
  secretary: 'Secretary',
  technician: 'Technician',
  contract: 'Contract Worker',
};

const roleColors: Record<EmployeeRole, string> = {
  president: 'var(--color-accent)',
  secretary: 'var(--color-info)',
  technician: 'var(--color-success)',
  contract: 'var(--color-warning)',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [formData, setFormData] = useState(emptyEmployee);
  const [scheduleFormData, setScheduleFormData] = useState({
    order_id: '',
    schedule_date: '',
    required_time_in: '',
    required_time_out: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchOrders();
  }, []);

  const fetchEmployees = async (searchQuery = '', role = '') => {
    try {
      setLoading(true);
      let url = '/api/employees?';
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (role) url += `role=${role}&`;
      const res = await fetch(url);
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchSchedules = async (employeeId: number) => {
    try {
      const res = await fetch(`/api/schedules?employee_id=${employeeId}`);
      const data = await res.json();
      setSchedules(data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees(search, roleFilter);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    fetchEmployees(search, role);
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData(emptyEmployee);
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name || '',
      role: employee.role || 'contract',
      phone: employee.phone || '',
      beeper: employee.beeper || '',
      address: employee.address || '',
      city: employee.city || '',
      state: employee.state || '',
      zip: employee.zip || '',
      email: employee.email || '',
      skills: employee.skills || '',
      hourly_rate: employee.hourly_rate?.toString() || '',
      status: employee.status || 'active',
      notes: employee.notes || '',
    });
    setIsModalOpen(true);
  };

  const openScheduleModal = async (employee: Employee) => {
    setSelectedEmployee(employee);
    await fetchSchedules(employee.id);
    setScheduleFormData({
      order_id: '',
      schedule_date: '',
      required_time_in: '08:00',
      required_time_out: '17:00',
      notes: '',
    });
    setIsScheduleModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchEmployees(search, roleFilter);
      }
    } catch (error) {
      console.error('Failed to save employee:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setSaving(true);

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: selectedEmployee.id,
          order_id: scheduleFormData.order_id || null,
          schedule_date: scheduleFormData.schedule_date,
          required_time_in: scheduleFormData.required_time_in,
          required_time_out: scheduleFormData.required_time_out,
          notes: scheduleFormData.notes,
        }),
      });

      if (res.ok) {
        await fetchSchedules(selectedEmployee.id);
        setScheduleFormData({
          order_id: '',
          schedule_date: '',
          required_time_in: '08:00',
          required_time_out: '17:00',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEmployees(search, roleFilter);
      }
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm('Delete this schedule entry?')) return;

    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (res.ok && selectedEmployee) {
        await fetchSchedules(selectedEmployee.id);
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  // Group employees by role
  const roleCounts = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
              Employees
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Manage staff and contract workers
            </p>
          </div>
          <button onClick={openCreateModal} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>

        {/* Role Filter Cards */}
        <div className="grid grid-cols-5 gap-4">
          <button
            onClick={() => handleRoleFilter('')}
            className={`card p-4 text-left transition-all ${!roleFilter ? 'ring-2' : ''}`}
            style={{
              borderColor: !roleFilter ? 'var(--color-accent)' : 'var(--color-border)',
              boxShadow: !roleFilter ? '0 0 0 2px var(--color-accent)' : undefined,
            }}
          >
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {employees.length}
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              All Employees
            </div>
          </button>
          {(['president', 'secretary', 'technician', 'contract'] as EmployeeRole[]).map((role) => (
            <button
              key={role}
              onClick={() => handleRoleFilter(role)}
              className={`card p-4 text-left transition-all ${roleFilter === role ? 'ring-2' : ''}`}
              style={{
                borderColor: roleFilter === role ? roleColors[role] : 'var(--color-border)',
                boxShadow: roleFilter === role ? `0 0 0 2px ${roleColors[role]}` : undefined,
              }}
            >
              <div className="text-2xl font-bold" style={{ color: roleColors[role] }}>
                {roleCounts[role] || 0}
              </div>
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {roleLabels[role]}
              </div>
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
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
              placeholder="Search by name, skills, or email..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
          {(search || roleFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                fetchEmployees();
              }}
              className="btn btn-ghost"
            >
              Clear
            </button>
          )}
        </form>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="skeleton h-12 w-48" />
                  <div className="skeleton h-12 w-32" />
                  <div className="skeleton h-12 w-40" />
                  <div className="skeleton h-12 flex-1" />
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: 'var(--color-text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p style={{ color: 'var(--color-text-muted)' }}>
                {search || roleFilter ? 'No employees found matching your criteria.' : 'No employees yet. Add one to get started.'}
              </p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={employee.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                    <td>
                      <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {employee.name}
                      </div>
                      {employee.skills && (
                        <div className="text-xs mt-1 truncate max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {employee.skills}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: `${roleColors[employee.role]}20`,
                          color: roleColors[employee.role],
                        }}
                      >
                        {roleLabels[employee.role]}
                      </span>
                    </td>
                    <td>
                      {employee.phone && (
                        <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {employee.phone}
                        </div>
                      )}
                      {employee.beeper && (
                        <div className="text-xs" style={{ color: 'var(--color-info)' }}>
                          Beeper: {employee.beeper}
                        </div>
                      )}
                      {employee.email && (
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {employee.email}
                        </div>
                      )}
                    </td>
                    <td>
                      {employee.hourly_rate && (
                        <span style={{ color: 'var(--color-accent)' }}>
                          ${Number(employee.hourly_rate).toFixed(2)}/hr
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${employee.status === 'active' ? 'badge-success' : 'badge-neutral'}`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openScheduleModal(employee)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: 'var(--color-secondary)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          title="View Schedule"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(employee)}
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
                          onClick={() => handleDelete(employee.id)}
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
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
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                className="input"
              >
                <option value="president">President</option>
                <option value="secretary">Secretary</option>
                <option value="technician">Technician</option>
                <option value="contract">Contract Worker</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Hourly Rate
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  className="input pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Beeper/Pager
              </label>
              <input
                type="tel"
                value={formData.beeper}
                onChange={(e) => setFormData({ ...formData, beeper: e.target.value })}
                className="input"
                placeholder="For field technicians"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                  ZIP
                </label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Skills / Description
              </label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                rows={2}
                className="input"
                placeholder="Audio equipment, lighting setup, etc..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {saving ? 'Saving...' : editingEmployee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={`Schedule - ${selectedEmployee?.name || ''}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Add Schedule Form */}
          <form onSubmit={handleScheduleSubmit} className="card p-4 space-y-4" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Add Schedule Entry
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Date <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  value={scheduleFormData.schedule_date}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, schedule_date: e.target.value })}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Order (Optional)
                </label>
                <select
                  value={scheduleFormData.order_id}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, order_id: e.target.value })}
                  className="input"
                >
                  <option value="">-- No Order --</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Time In
                </label>
                <input
                  type="time"
                  value={scheduleFormData.required_time_in}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, required_time_in: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Time Out
                </label>
                <input
                  type="time"
                  value={scheduleFormData.required_time_out}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, required_time_out: e.target.value })}
                  className="input"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Notes
                </label>
                <input
                  type="text"
                  value={scheduleFormData.notes}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, notes: e.target.value })}
                  className="input"
                  placeholder="Event details, special instructions..."
                />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? 'Adding...' : 'Add to Schedule'}
            </button>
          </form>

          {/* Schedule List */}
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Scheduled Work ({schedules.length})
            </h3>
            {schedules.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No scheduled work yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {new Date(schedule.schedule_date).toLocaleDateString()}
                        </span>
                        <span
                          className={`badge ${
                            schedule.status === 'completed' ? 'badge-success' :
                            schedule.status === 'cancelled' ? 'badge-danger' : 'badge-info'
                          }`}
                        >
                          {schedule.status}
                        </span>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {schedule.required_time_in && schedule.required_time_out && (
                          <span>{schedule.required_time_in} - {schedule.required_time_out}</span>
                        )}
                        {(schedule as any).order_number && (
                          <span className="ml-2">• Order: {(schedule as any).order_number}</span>
                        )}
                        {(schedule as any).customer_name && (
                          <span className="ml-2">• {(schedule as any).customer_name}</span>
                        )}
                      </div>
                      {schedule.notes && (
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {schedule.notes}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--color-danger)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
