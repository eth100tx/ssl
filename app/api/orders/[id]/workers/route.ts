import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET workers assigned to an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ow.*, e.name as employee_name, e.role as employee_role,
              e.phone as employee_phone, e.beeper as employee_beeper, e.skills
       FROM order_workers ow
       JOIN employees e ON ow.employee_id = e.id
       WHERE ow.order_id = ?
       ORDER BY e.role ASC, e.name ASC`,
      [id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching order workers:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}

// POST add worker to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { employee_id, role, notes } = body;

    if (!employee_id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Check if worker is already assigned
    const [existing] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM order_workers WHERE order_id = ? AND employee_id = ?',
      [id, employee_id]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Worker already assigned to this order' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO order_workers (order_id, employee_id, role, notes)
       VALUES (?, ?, ?, ?)`,
      [id, employee_id, role || null, notes || null]
    );

    // Return the newly created worker with employee details
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ow.*, e.name as employee_name, e.role as employee_role,
              e.phone as employee_phone, e.beeper as employee_beeper, e.skills
       FROM order_workers ow
       JOIN employees e ON ow.employee_id = e.id
       WHERE ow.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding worker to order:', error);
    return NextResponse.json({ error: 'Failed to add worker' }, { status: 500 });
  }
}
