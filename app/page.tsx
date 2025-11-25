'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';

interface DashboardStats {
  totalCustomers: number;
  totalEquipment: number;
  equipmentOut: number;
  activeOrders: number;
  todayEvents: number;
  pendingProposals: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  type: string;
  status: string;
  total_cost: number;
  event_date: string | null;
}

interface TodayReservation {
  id: number;
  equipment_name: string;
  equipment_serial: string | null;
  customer_name: string | null;
  time_out: string | null;
  status: string;
}

interface EquipmentAlert {
  id: number;
  name: string;
  serial_number: string | null;
  status: string;
  maintenance_due_date: string | null;
}

const statCards = [
  { key: 'totalCustomers', label: 'Customers', href: '/customers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'accent' },
  { key: 'totalEquipment', label: 'Equipment', href: '/equipment', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'secondary' },
  { key: 'equipmentOut', label: 'Out Now', href: '/equipment?status=out', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'info' },
  { key: 'activeOrders', label: 'Active Orders', href: '/orders', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'success' },
  { key: 'todayEvents', label: 'Today', href: '/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'warning' },
  { key: 'pendingProposals', label: 'Proposals', href: '/orders?type=proposal', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'accent' },
];

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
  accent: { bg: 'rgba(245, 166, 35, 0.1)', text: '#f5a623', glow: 'rgba(245, 166, 35, 0.3)' },
  secondary: { bg: 'rgba(0, 212, 255, 0.1)', text: '#00d4ff', glow: 'rgba(0, 212, 255, 0.3)' },
  success: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
  info: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
  danger: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalEquipment: 0,
    equipmentOut: 0,
    activeOrders: 0,
    todayEvents: 0,
    pendingProposals: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [todayReservations, setTodayReservations] = useState<TodayReservation[]>([]);
  const [equipmentAlerts, setEquipmentAlerts] = useState<EquipmentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [customersRes, equipmentRes, ordersRes, reservationsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/equipment'),
        fetch('/api/orders'),
        fetch(`/api/reservations?start=${today}&end=${today}`),
      ]);

      const customers = await customersRes.json();
      const equipment = await equipmentRes.json();
      const orders = await ordersRes.json();
      const todayRes = await reservationsRes.json();

      const equipmentOut = equipment.filter((e: { status: string }) => e.status === 'out' || e.status === 'reserved').length;
      const activeOrders = orders.filter((o: { status: string }) => ['draft', 'sent', 'accepted'].includes(o.status)).length;
      const pendingProposals = orders.filter((o: { type: string; status: string }) => o.type === 'proposal' && o.status === 'sent').length;

      setStats({
        totalCustomers: customers.length,
        totalEquipment: equipment.length,
        equipmentOut,
        activeOrders,
        todayEvents: todayRes.length,
        pendingProposals,
      });

      setRecentOrders(orders.slice(0, 5));
      setTodayReservations(todayRes);

      const alerts = equipment.filter((e: EquipmentAlert) => {
        if (e.status === 'maintenance') return true;
        if (e.maintenance_due_date) {
          const dueDate = new Date(e.maintenance_due_date);
          const soon = new Date();
          soon.setDate(soon.getDate() + 7);
          return dueDate <= soon;
        }
        return false;
      });
      setEquipmentAlerts(alerts.slice(0, 5));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusBadge = (status: string, type?: string) => {
    const badges: Record<string, string> = {
      completed: 'badge-success',
      accepted: 'badge-info',
      sent: 'badge-warning',
      draft: 'badge-neutral',
      out: 'badge-info',
      reserved: 'badge-warning',
      maintenance: 'badge-danger',
    };
    return badges[status] || 'badge-neutral';
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          {/* Skeleton header */}
          <div className="space-y-2">
            <div className="skeleton h-10 w-64"></div>
            <div className="skeleton h-5 w-96"></div>
          </div>

          {/* Skeleton stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-8 w-16 mb-2"></div>
                <div className="skeleton h-4 w-20"></div>
              </div>
            ))}
          </div>

          {/* Skeleton cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-6 w-40 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="skeleton h-16 w-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
          <h1 className="text-4xl md:text-5xl gradient-text">Dashboard</h1>
          <p style={{ color: 'var(--color-text-secondary)' }} className="mt-2">
            Welcome back. Here&apos;s what&apos;s happening at SSL Inc.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, index) => {
            const colors = colorMap[card.color];
            const value = stats[card.key as keyof DashboardStats];
            return (
              <Link
                key={card.key}
                href={card.href}
                className={`card card-glow p-4 group animate-slide-up opacity-0 stagger-${index + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                    style={{ background: colors.bg }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: colors.text }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                    </svg>
                  </div>
                </div>
                <div
                  className="text-3xl font-bold transition-colors"
                  style={{ color: colors.text }}
                >
                  {value}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {card.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Reservations */}
          <div className="card animate-slide-up opacity-0 stagger-2" style={{ animationFillMode: 'forwards' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl" style={{ color: 'var(--color-text-primary)' }}>Today&apos;s Schedule</h2>
              <Link href="/calendar" className="text-sm hover:underline" style={{ color: 'var(--color-accent)' }}>
                View Calendar
              </Link>
            </div>
            <div className="p-6">
              {todayReservations.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-bg-tertiary)' }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-muted)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)' }}>No reservations for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayReservations.map((res) => (
                    <div
                      key={res.id}
                      className="flex items-center justify-between p-4 rounded-lg transition-colors"
                      style={{ background: 'var(--color-bg-secondary)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: res.status === 'out' ? 'var(--color-info)' : 'var(--color-warning)',
                            boxShadow: `0 0 10px ${res.status === 'out' ? 'var(--color-info)' : 'var(--color-warning)'}`
                          }}
                        />
                        <div>
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {res.equipment_name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {res.customer_name || 'No customer'} {res.time_out && `- ${res.time_out}`}
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${getStatusBadge(res.status)}`}>
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card animate-slide-up opacity-0 stagger-3" style={{ animationFillMode: 'forwards' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl" style={{ color: 'var(--color-text-primary)' }}>Recent Orders</h2>
              <Link href="/orders" className="text-sm hover:underline" style={{ color: 'var(--color-accent)' }}>
                View All
              </Link>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-bg-tertiary)' }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-muted)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)' }}>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between p-4 rounded-lg transition-all hover:translate-x-1"
                      style={{ background: 'var(--color-bg-secondary)' }}
                    >
                      <div>
                        <div className="font-medium" style={{ color: 'var(--color-accent)' }}>
                          {order.order_number}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {order.customer_name} - {formatDate(order.event_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                          {formatCurrency(order.total_cost)}
                        </div>
                        <span className={`badge ${getStatusBadge(order.status)}`}>
                          {order.type}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Equipment Alerts */}
          <div className="card animate-slide-up opacity-0 stagger-4" style={{ animationFillMode: 'forwards' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl" style={{ color: 'var(--color-text-primary)' }}>Equipment Alerts</h2>
              <Link href="/equipment?status=maintenance" className="text-sm hover:underline" style={{ color: 'var(--color-accent)' }}>
                View All
              </Link>
            </div>
            <div className="p-6">
              {equipmentAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-success)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p style={{ color: 'var(--color-success)' }}>All equipment in good condition</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipmentAlerts.map((eq) => (
                    <div
                      key={eq.id}
                      className="flex items-center justify-between p-4 rounded-lg"
                      style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-danger)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {eq.name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            {eq.serial_number && `SN: ${eq.serial_number}`}
                            {eq.maintenance_due_date && ` - Due: ${formatDate(eq.maintenance_due_date)}`}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-danger">{eq.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card animate-slide-up opacity-0 stagger-5" style={{ animationFillMode: 'forwards' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-xl" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: '/customers', label: 'New Customer', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', color: 'accent' },
                  { href: '/equipment', label: 'New Equipment', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', color: 'secondary' },
                  { href: '/orders', label: 'New Order', icon: 'M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'success' },
                  { href: '/calendar', label: 'New Reservation', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', color: 'warning' },
                ].map((action) => {
                  const colors = colorMap[action.color];
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="p-4 rounded-lg text-center transition-all hover:scale-105 group"
                      style={{ background: colors.bg, border: `1px solid ${colors.text}20` }}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: `${colors.text}20` }}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.text }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                        </svg>
                      </div>
                      <div className="font-medium" style={{ color: colors.text }}>
                        {action.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
