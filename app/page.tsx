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

      // Fetch all data in parallel
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

      // Calculate stats
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

      // Recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));

      // Today's reservations
      setTodayReservations(todayRes);

      // Equipment needing attention (maintenance due or out)
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8 text-gray-500">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to SSL Inc. Business Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link href="/customers" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalCustomers}</div>
            <div className="text-sm text-gray-600">Customers</div>
          </Link>

          <Link href="/equipment" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-indigo-600">{stats.totalEquipment}</div>
            <div className="text-sm text-gray-600">Equipment</div>
          </Link>

          <Link href="/equipment?status=out" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-blue-600">{stats.equipmentOut}</div>
            <div className="text-sm text-gray-600">Equipment Out</div>
          </Link>

          <Link href="/orders" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-green-600">{stats.activeOrders}</div>
            <div className="text-sm text-gray-600">Active Orders</div>
          </Link>

          <Link href="/calendar" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-yellow-600">{stats.todayEvents}</div>
            <div className="text-sm text-gray-600">Today&apos;s Events</div>
          </Link>

          <Link href="/orders?type=proposal&status=sent" className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-purple-600">{stats.pendingProposals}</div>
            <div className="text-sm text-gray-600">Pending Proposals</div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Reservations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Reservations</h2>
              <Link href="/calendar" className="text-sm text-indigo-600 hover:text-indigo-800">
                View Calendar
              </Link>
            </div>
            <div className="p-6">
              {todayReservations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No reservations for today</p>
              ) : (
                <div className="space-y-3">
                  {todayReservations.map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{res.equipment_name}</div>
                        <div className="text-sm text-gray-500">
                          {res.customer_name || 'No customer'} {res.time_out && `- ${res.time_out}`}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        res.status === 'out' ? 'bg-blue-100 text-blue-800' :
                        res.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/orders" className="text-sm text-indigo-600 hover:text-indigo-800">
                View All
              </Link>
            </div>
            <div className="p-6">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{order.order_number}</div>
                        <div className="text-sm text-gray-500">
                          {order.customer_name} - {formatDate(order.event_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{formatCurrency(order.total_cost)}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'sent' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.type} - {order.status}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Equipment Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Equipment Alerts</h2>
              <Link href="/equipment?status=maintenance" className="text-sm text-indigo-600 hover:text-indigo-800">
                View All
              </Link>
            </div>
            <div className="p-6">
              {equipmentAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No equipment alerts</p>
              ) : (
                <div className="space-y-3">
                  {equipmentAlerts.map((eq) => (
                    <div key={eq.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{eq.name}</div>
                        <div className="text-sm text-gray-500">
                          {eq.serial_number && `SN: ${eq.serial_number}`}
                          {eq.maintenance_due_date && ` - Maintenance: ${formatDate(eq.maintenance_due_date)}`}
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {eq.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Link
                href="/customers"
                className="p-4 bg-indigo-50 rounded-lg text-center hover:bg-indigo-100 transition-colors"
              >
                <div className="text-indigo-600 font-medium">+ New Customer</div>
              </Link>
              <Link
                href="/equipment"
                className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
              >
                <div className="text-green-600 font-medium">+ New Equipment</div>
              </Link>
              <Link
                href="/orders"
                className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
              >
                <div className="text-blue-600 font-medium">+ New Order</div>
              </Link>
              <Link
                href="/calendar"
                className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors"
              >
                <div className="text-yellow-600 font-medium">+ New Reservation</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
