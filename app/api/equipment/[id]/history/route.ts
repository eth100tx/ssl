import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET rental history for equipment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get order items that reference this equipment (both sales and rentals)
    const [orderItems] = await pool.query<RowDataPacket[]>(
      `SELECT oi.*, o.order_number, o.event_date, o.status as order_status,
              c.name as customer_name, c.company as customer_company
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN customers c ON o.customer_id = c.id
       WHERE oi.equipment_id = ?
       ORDER BY o.event_date DESC, o.created_at DESC`,
      [id]
    );

    // Get reservations for this equipment
    const [reservations] = await pool.query<RowDataPacket[]>(
      `SELECT r.*, o.order_number, c.name as customer_name, c.company as customer_company
       FROM reservations r
       LEFT JOIN orders o ON r.order_id = o.id
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE r.equipment_id = ?
       ORDER BY r.event_date DESC, r.created_at DESC`,
      [id]
    );

    return NextResponse.json({
      order_items: orderItems,
      reservations: reservations,
    });
  } catch (error) {
    console.error('Error fetching equipment history:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment history' }, { status: 500 });
  }
}
