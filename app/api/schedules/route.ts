import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET all schedules with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employee_id = searchParams.get('employee_id');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const status = searchParams.get('status');

    let query = `
      SELECT
        es.*,
        e.name as employee_name,
        e.role as employee_role,
        o.order_number,
        c.name as customer_name,
        c.company as customer_company
      FROM employee_schedules es
      LEFT JOIN employees e ON es.employee_id = e.id
      LEFT JOIN orders o ON es.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (employee_id) {
      query += ' AND es.employee_id = ?';
      params.push(employee_id);
    }

    if (start) {
      query += ' AND es.schedule_date >= ?';
      params.push(start);
    }

    if (end) {
      query += ' AND es.schedule_date <= ?';
      params.push(end);
    }

    if (status) {
      query += ' AND es.status = ?';
      params.push(status);
    }

    query += ' ORDER BY es.schedule_date ASC, es.required_time_in ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}

// POST create schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employee_id, order_id, schedule_date, required_time_in, required_time_out,
      actual_time_in, actual_time_out, hours_worked, overtime_hours, notes, status
    } = body;

    if (!employee_id || !schedule_date) {
      return NextResponse.json({ error: 'Employee ID and schedule date are required' }, { status: 400 });
    }

    // Check for schedule conflicts
    const [conflicts] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM employee_schedules
       WHERE employee_id = ? AND schedule_date = ? AND status != 'cancelled'`,
      [employee_id, schedule_date]
    );

    if (conflicts.length > 0) {
      return NextResponse.json({
        error: 'Employee already has a schedule for this date',
        conflict: conflicts[0]
      }, { status: 409 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO employee_schedules
       (employee_id, order_id, schedule_date, required_time_in, required_time_out,
        actual_time_in, actual_time_out, hours_worked, overtime_hours, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, order_id || null, schedule_date, required_time_in || null, required_time_out || null,
       actual_time_in || null, actual_time_out || null, hours_worked || null,
       overtime_hours || 0, notes || null, status || 'scheduled']
    );

    // Fetch the created schedule with joins
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        es.*,
        e.name as employee_name,
        e.role as employee_role,
        o.order_number,
        c.name as customer_name
      FROM employee_schedules es
      LEFT JOIN employees e ON es.employee_id = e.id
      LEFT JOIN orders o ON es.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE es.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
