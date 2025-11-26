import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET reports - consolidated reporting endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'summary';
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Default date range: last 30 days
    const endDate = end || new Date().toISOString().split('T')[0];
    const startDate = start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    switch (reportType) {
      case 'equipment-utilization':
        return await getEquipmentUtilization(startDate, endDate);
      case 'customer-revenue':
        return await getCustomerRevenue(startDate, endDate);
      case 'employee-hours':
        return await getEmployeeHours(startDate, endDate);
      case 'revenue-summary':
        return await getRevenueSummary(startDate, endDate);
      case 'summary':
      default:
        return await getDashboardSummary(startDate, endDate);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

// Equipment utilization report
async function getEquipmentUtilization(start: string, end: string) {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      e.id,
      e.name,
      e.serial_number,
      e.category,
      e.rental_rate,
      COUNT(DISTINCT oi.id) as rental_count,
      COALESCE(SUM(oi.total), 0) as total_revenue,
      COUNT(DISTINCT r.id) as reservation_count
    FROM equipment e
    LEFT JOIN order_items oi ON e.id = oi.equipment_id AND oi.item_type = 'rental'
    LEFT JOIN orders o ON oi.order_id = o.id AND o.event_date BETWEEN ? AND ?
    LEFT JOIN reservations r ON e.id = r.equipment_id AND r.event_date BETWEEN ? AND ?
    GROUP BY e.id
    ORDER BY rental_count DESC, total_revenue DESC
  `, [start, end, start, end]);

  // Convert DECIMAL strings to numbers
  const data = rows.map(row => ({
    ...row,
    rental_rate: Number(row.rental_rate) || 0,
    total_revenue: Number(row.total_revenue) || 0,
  }));

  return NextResponse.json({
    type: 'equipment-utilization',
    period: { start, end },
    data,
  });
}

// Customer revenue report
async function getCustomerRevenue(start: string, end: string) {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      c.id,
      c.name,
      c.company,
      COUNT(DISTINCT o.id) as order_count,
      COALESCE(SUM(o.sales_total), 0) as sales_total,
      COALESCE(SUM(o.rental_total), 0) as rental_total,
      COALESCE(SUM(o.operator_total), 0) as operator_total,
      COALESCE(SUM(o.total_cost), 0) as total_revenue
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
      AND o.event_date BETWEEN ? AND ?
      AND o.status IN ('accepted', 'completed')
    GROUP BY c.id
    HAVING order_count > 0 OR total_revenue > 0
    ORDER BY total_revenue DESC
  `, [start, end]);

  // Convert DECIMAL strings to numbers
  const data = rows.map(row => ({
    ...row,
    sales_total: Number(row.sales_total) || 0,
    rental_total: Number(row.rental_total) || 0,
    operator_total: Number(row.operator_total) || 0,
    total_revenue: Number(row.total_revenue) || 0,
  }));

  return NextResponse.json({
    type: 'customer-revenue',
    period: { start, end },
    data,
  });
}

// Employee hours report
async function getEmployeeHours(start: string, end: string) {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      e.id,
      e.name,
      e.role,
      e.hourly_rate,
      COUNT(DISTINCT es.id) as shift_count,
      COALESCE(SUM(es.hours_worked), 0) as total_hours,
      COALESCE(SUM(es.overtime_hours), 0) as overtime_hours,
      COALESCE(SUM(es.hours_worked) * e.hourly_rate, 0) as estimated_pay
    FROM employees e
    LEFT JOIN employee_schedules es ON e.id = es.employee_id
      AND es.schedule_date BETWEEN ? AND ?
      AND es.status = 'completed'
    GROUP BY e.id
    ORDER BY total_hours DESC
  `, [start, end]);

  // Convert DECIMAL strings to numbers
  const data = rows.map(row => ({
    ...row,
    hourly_rate: Number(row.hourly_rate) || 0,
    total_hours: Number(row.total_hours) || 0,
    overtime_hours: Number(row.overtime_hours) || 0,
    estimated_pay: Number(row.estimated_pay) || 0,
  }));

  return NextResponse.json({
    type: 'employee-hours',
    period: { start, end },
    data,
  });
}

// Revenue summary report
async function getRevenueSummary(start: string, end: string) {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT
      COALESCE(SUM(sales_total), 0) as sales_total,
      COALESCE(SUM(rental_total), 0) as rental_total,
      COALESCE(SUM(operator_total), 0) as operator_total,
      COALESCE(SUM(total_cost), 0) as grand_total,
      COUNT(*) as order_count
    FROM orders
    WHERE event_date BETWEEN ? AND ?
      AND status IN ('accepted', 'completed')
  `, [start, end]);

  const totals = {
    sales_total: Number(rows[0].sales_total) || 0,
    rental_total: Number(rows[0].rental_total) || 0,
    operator_total: Number(rows[0].operator_total) || 0,
    grand_total: Number(rows[0].grand_total) || 0,
    order_count: rows[0].order_count || 0,
  };

  // Monthly breakdown
  const [monthly] = await pool.query<RowDataPacket[]>(`
    SELECT
      DATE_FORMAT(event_date, '%Y-%m') as month,
      COALESCE(SUM(sales_total), 0) as sales_total,
      COALESCE(SUM(rental_total), 0) as rental_total,
      COALESCE(SUM(operator_total), 0) as operator_total,
      COALESCE(SUM(total_cost), 0) as total,
      COUNT(*) as order_count
    FROM orders
    WHERE event_date BETWEEN ? AND ?
      AND status IN ('accepted', 'completed')
    GROUP BY DATE_FORMAT(event_date, '%Y-%m')
    ORDER BY month ASC
  `, [start, end]);

  const monthlyData = monthly.map(row => ({
    ...row,
    sales_total: Number(row.sales_total) || 0,
    rental_total: Number(row.rental_total) || 0,
    operator_total: Number(row.operator_total) || 0,
    total: Number(row.total) || 0,
  }));

  return NextResponse.json({
    type: 'revenue-summary',
    period: { start, end },
    totals,
    monthly: monthlyData,
  });
}

// Dashboard summary
async function getDashboardSummary(start: string, end: string) {
  // Get counts
  const [[customerCount]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM customers');
  const [[equipmentCount]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM equipment');
  const [[employeeCount]] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM employees WHERE status = "active"');

  // Get orders in period
  const [[orderStats]] = await pool.query<RowDataPacket[]>(`
    SELECT
      COUNT(*) as order_count,
      COALESCE(SUM(total_cost), 0) as total_revenue
    FROM orders
    WHERE event_date BETWEEN ? AND ?
      AND status IN ('accepted', 'completed')
  `, [start, end]);

  // Get upcoming events
  const [upcomingEvents] = await pool.query<RowDataPacket[]>(`
    SELECT
      o.id,
      o.order_number,
      o.event_date,
      c.name as customer_name,
      o.total_cost
    FROM orders o
    LEFT JOIN customers c ON o.customer_id = c.id
    WHERE o.event_date >= CURDATE()
      AND o.status IN ('draft', 'sent', 'accepted')
    ORDER BY o.event_date ASC
    LIMIT 5
  `);

  return NextResponse.json({
    type: 'summary',
    period: { start, end },
    counts: {
      customers: customerCount.count,
      equipment: equipmentCount.count,
      employees: employeeCount.count,
    },
    revenue: {
      order_count: orderStats.order_count || 0,
      total: Number(orderStats.total_revenue) || 0,
    },
    upcomingEvents: upcomingEvents.map(e => ({
      ...e,
      total_cost: Number(e.total_cost) || 0,
    })),
  });
}
