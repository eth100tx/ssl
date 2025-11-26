'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

interface ReportData {
  type: string;
  period: { start: string; end: string };
  data?: any[];
  totals?: any;
  monthly?: any[];
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('revenue-summary');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/reports?type=${reportType}&start=${startDate}&end=${endDate}`
      );
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const reportTypes = [
    { id: 'revenue-summary', label: 'Revenue Summary', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'equipment-utilization', label: 'Equipment Utilization', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'customer-revenue', label: 'Customer Revenue', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'employee-hours', label: 'Employee Hours', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
            Reports
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Business analytics and insights
          </p>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`card p-4 text-left transition-all ${reportType === type.id ? 'ring-2' : ''}`}
              style={{
                borderColor: reportType === type.id ? 'var(--color-accent)' : 'var(--color-border)',
                ringColor: reportType === type.id ? 'var(--color-accent)' : undefined,
              }}
            >
              <svg
                className="w-6 h-6 mb-2"
                style={{ color: reportType === type.id ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={type.icon} />
              </svg>
              <div
                className="text-sm font-medium"
                style={{ color: reportType === type.id ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
              >
                {type.label}
              </div>
            </button>
          ))}
        </div>

        {/* Date Range */}
        <div className="card p-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 30);
                  setStartDate(d.toISOString().split('T')[0]);
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
                className="btn btn-ghost btn-sm"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - 3);
                  setStartDate(d.toISOString().split('T')[0]);
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
                className="btn btn-ghost btn-sm"
              >
                Last 3 Months
              </button>
              <button
                onClick={() => {
                  const d = new Date();
                  d.setFullYear(d.getFullYear() - 1);
                  setStartDate(d.toISOString().split('T')[0]);
                  setEndDate(new Date().toISOString().split('T')[0]);
                }}
                className="btn btn-ghost btn-sm"
              >
                Last Year
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="card p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Revenue Summary Report */}
            {reportType === 'revenue-summary' && reportData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="card p-4">
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sales</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                      {formatCurrency(reportData.totals?.sales_total || 0)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {((reportData.totals?.sales_total || 0) / Math.max(reportData.totals?.grand_total || 1, 1) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Rentals</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-info)' }}>
                      {formatCurrency(reportData.totals?.rental_total || 0)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {((reportData.totals?.rental_total || 0) / Math.max(reportData.totals?.grand_total || 1, 1) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Operator Support</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>
                      {formatCurrency(reportData.totals?.operator_total || 0)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {((reportData.totals?.operator_total || 0) / Math.max(reportData.totals?.grand_total || 1, 1) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="card p-4">
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Grand Total</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      {formatCurrency(reportData.totals?.grand_total || 0)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {reportData.totals?.order_count || 0} orders
                    </div>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className="card overflow-hidden">
                  <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Monthly Breakdown
                    </h3>
                  </div>
                  {!reportData.monthly || reportData.monthly.length === 0 ? (
                    <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                      No revenue data for this period
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th className="text-right">Sales</th>
                          <th className="text-right">Rentals</th>
                          <th className="text-right">Operator</th>
                          <th className="text-right">Total</th>
                          <th className="text-right">Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.monthly.map((row: any) => (
                          <tr key={row.month}>
                            <td style={{ color: 'var(--color-text-primary)' }}>
                              {new Date(row.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                            </td>
                            <td className="text-right" style={{ color: 'var(--color-success)' }}>
                              {formatCurrency(row.sales_total)}
                            </td>
                            <td className="text-right" style={{ color: 'var(--color-info)' }}>
                              {formatCurrency(row.rental_total)}
                            </td>
                            <td className="text-right" style={{ color: 'var(--color-warning)' }}>
                              {formatCurrency(row.operator_total)}
                            </td>
                            <td className="text-right font-medium" style={{ color: 'var(--color-accent)' }}>
                              {formatCurrency(row.total)}
                            </td>
                            <td className="text-right" style={{ color: 'var(--color-text-muted)' }}>
                              {row.order_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* Equipment Utilization Report */}
            {reportType === 'equipment-utilization' && reportData && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Equipment Utilization
                  </h3>
                </div>
                {!reportData.data || reportData.data.length === 0 ? (
                  <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    No equipment data available
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Equipment</th>
                        <th>Category</th>
                        <th className="text-right">Rental Rate</th>
                        <th className="text-right">Rentals</th>
                        <th className="text-right">Reservations</th>
                        <th className="text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((row: any) => (
                        <tr key={row.id}>
                          <td>
                            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {row.name}
                            </div>
                            {row.serial_number && (
                              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {row.serial_number}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-neutral capitalize">{row.category}</span>
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            {row.rental_rate ? formatCurrency(row.rental_rate) : '-'}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-info)' }}>
                            {row.rental_count}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-warning)' }}>
                            {row.reservation_count}
                          </td>
                          <td className="text-right font-medium" style={{ color: 'var(--color-accent)' }}>
                            {formatCurrency(row.total_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Customer Revenue Report */}
            {reportType === 'customer-revenue' && reportData && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Revenue by Customer
                  </h3>
                </div>
                {!reportData.data || reportData.data.length === 0 ? (
                  <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    No customer revenue data for this period
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th className="text-right">Orders</th>
                        <th className="text-right">Sales</th>
                        <th className="text-right">Rentals</th>
                        <th className="text-right">Operator</th>
                        <th className="text-right">Total Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((row: any) => (
                        <tr key={row.id}>
                          <td>
                            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              {row.name}
                            </div>
                            {row.company && (
                              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {row.company}
                              </div>
                            )}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-text-muted)' }}>
                            {row.order_count}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-success)' }}>
                            {formatCurrency(row.sales_total)}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-info)' }}>
                            {formatCurrency(row.rental_total)}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-warning)' }}>
                            {formatCurrency(row.operator_total)}
                          </td>
                          <td className="text-right font-medium" style={{ color: 'var(--color-accent)' }}>
                            {formatCurrency(row.total_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Employee Hours Report */}
            {reportType === 'employee-hours' && reportData && (
              <div className="card overflow-hidden">
                <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    Employee Hours Summary
                  </h3>
                </div>
                {!reportData.data || reportData.data.length === 0 ? (
                  <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    No employee hours data for this period
                  </div>
                ) : (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Role</th>
                        <th className="text-right">Hourly Rate</th>
                        <th className="text-right">Shifts</th>
                        <th className="text-right">Hours</th>
                        <th className="text-right">Overtime</th>
                        <th className="text-right">Est. Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((row: any) => (
                        <tr key={row.id}>
                          <td style={{ color: 'var(--color-text-primary)' }}>{row.name}</td>
                          <td>
                            <span className="badge badge-neutral capitalize">{row.role}</span>
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-text-secondary)' }}>
                            {row.hourly_rate ? formatCurrency(row.hourly_rate) : '-'}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-text-muted)' }}>
                            {row.shift_count}
                          </td>
                          <td className="text-right" style={{ color: 'var(--color-info)' }}>
                            {row.total_hours.toFixed(1)}
                          </td>
                          <td className="text-right" style={{ color: row.overtime_hours > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                            {row.overtime_hours.toFixed(1)}
                          </td>
                          <td className="text-right font-medium" style={{ color: 'var(--color-accent)' }}>
                            {formatCurrency(row.estimated_pay)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
