import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET single reservation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, e.name as equipment_name, e.serial_number as equipment_serial
       FROM reservations r
       LEFT JOIN equipment e ON r.equipment_id = e.id
       WHERE r.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 });
  }
}

// PUT update reservation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      equipment_id, customer_name, event_date, time_out, time_due_in,
      time_returned, condition_notes, status
    } = body;

    // Get current reservation to check equipment change
    const [current] = await pool.query<RowDataPacket[]>(
      'SELECT equipment_id, status FROM reservations WHERE id = ?',
      [id]
    );

    if (current.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Check for conflicts if equipment or date changed
    if (equipment_id !== current[0].equipment_id || event_date) {
      const [conflicts] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM reservations
         WHERE equipment_id = ? AND event_date = ? AND id != ? AND status NOT IN ('returned', 'cancelled')`,
        [equipment_id, event_date, id]
      );

      if (conflicts.length > 0) {
        return NextResponse.json({ error: 'Equipment is already reserved for this date' }, { status: 409 });
      }
    }

    await pool.query<ResultSetHeader>(
      `UPDATE reservations SET
       equipment_id = ?, customer_name = ?, event_date = ?,
       time_out = ?, time_due_in = ?, time_returned = ?,
       condition_notes = ?, status = ?
       WHERE id = ?`,
      [
        equipment_id,
        customer_name || null,
        event_date,
        time_out || null,
        time_due_in || null,
        time_returned || null,
        condition_notes || null,
        status || 'reserved',
        id
      ]
    );

    // Update equipment status based on reservation status
    if (status === 'out') {
      await pool.query('UPDATE equipment SET status = ? WHERE id = ?', ['out', equipment_id]);
    } else if (status === 'returned' || status === 'cancelled') {
      await pool.query('UPDATE equipment SET status = ? WHERE id = ?', ['available', equipment_id]);
    } else {
      await pool.query('UPDATE equipment SET status = ? WHERE id = ?', ['reserved', equipment_id]);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, e.name as equipment_name, e.serial_number as equipment_serial
       FROM reservations r
       LEFT JOIN equipment e ON r.equipment_id = e.id
       WHERE r.id = ?`,
      [id]
    );

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

// DELETE reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get reservation to update equipment status
    const [reservation] = await pool.query<RowDataPacket[]>(
      'SELECT equipment_id FROM reservations WHERE id = ?',
      [id]
    );

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM reservations WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Check if equipment has other active reservations
    if (reservation.length > 0) {
      const [otherReservations] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM reservations
         WHERE equipment_id = ? AND status NOT IN ('returned', 'cancelled')`,
        [reservation[0].equipment_id]
      );

      if (otherReservations.length === 0) {
        await pool.query(
          'UPDATE equipment SET status = ? WHERE id = ?',
          ['available', reservation[0].equipment_id]
        );
      }
    }

    return NextResponse.json({ message: 'Reservation deleted' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
