import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET single schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        es.*,
        e.name as employee_name,
        e.role as employee_role,
        e.hourly_rate,
        o.order_number,
        o.event_date,
        c.name as customer_name,
        c.company as customer_company
      FROM employee_schedules es
      LEFT JOIN employees e ON es.employee_id = e.id
      LEFT JOIN orders o ON es.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE es.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

// PUT update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      employee_id, order_id, schedule_date, required_time_in, required_time_out,
      actual_time_in, actual_time_out, hours_worked, overtime_hours, notes, status
    } = body;

    if (!employee_id || !schedule_date) {
      return NextResponse.json({ error: 'Employee ID and schedule date are required' }, { status: 400 });
    }

    await pool.query<ResultSetHeader>(
      `UPDATE employee_schedules
       SET employee_id = ?, order_id = ?, schedule_date = ?, required_time_in = ?,
           required_time_out = ?, actual_time_in = ?, actual_time_out = ?,
           hours_worked = ?, overtime_hours = ?, notes = ?, status = ?
       WHERE id = ?`,
      [employee_id, order_id || null, schedule_date, required_time_in || null,
       required_time_out || null, actual_time_in || null, actual_time_out || null,
       hours_worked || null, overtime_hours || 0, notes || null, status || 'scheduled', id]
    );

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
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

// DELETE schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM employee_schedules WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Schedule deleted' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}
