import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET all reservations (with optional date range)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const equipmentId = searchParams.get('equipment_id');

    let query = `
      SELECT r.*, e.name as equipment_name, e.serial_number as equipment_serial, e.category as equipment_category
      FROM reservations r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (start) {
      query += ' AND r.event_date >= ?';
      params.push(start);
    }

    if (end) {
      query += ' AND r.event_date <= ?';
      params.push(end);
    }

    if (equipmentId) {
      query += ' AND r.equipment_id = ?';
      params.push(parseInt(equipmentId));
    }

    query += ' ORDER BY r.event_date ASC, r.time_out ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

// POST create reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      equipment_id, order_id, customer_name, reservation_date, event_date,
      time_out, time_due_in, status
    } = body;

    if (!equipment_id || !event_date) {
      return NextResponse.json({ error: 'Equipment and event date are required' }, { status: 400 });
    }

    // Check for conflicts
    const [conflicts] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM reservations
       WHERE equipment_id = ? AND event_date = ? AND status NOT IN ('returned', 'cancelled')`,
      [equipment_id, event_date]
    );

    if (conflicts.length > 0) {
      return NextResponse.json({ error: 'Equipment is already reserved for this date' }, { status: 409 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO reservations
       (equipment_id, order_id, customer_name, reservation_date, event_date, time_out, time_due_in, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        equipment_id,
        order_id || null,
        customer_name || null,
        reservation_date || new Date().toISOString().split('T')[0],
        event_date,
        time_out || null,
        time_due_in || null,
        status || 'reserved'
      ]
    );

    // Update equipment status
    await pool.query(
      'UPDATE equipment SET status = ? WHERE id = ?',
      ['reserved', equipment_id]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, e.name as equipment_name, e.serial_number as equipment_serial
       FROM reservations r
       LEFT JOIN equipment e ON r.equipment_id = e.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
