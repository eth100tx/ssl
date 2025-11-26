import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Recalculate order totals
async function recalculateOrderTotals(orderId: number) {
  const [items] = await pool.query<RowDataPacket[]>(
    'SELECT item_type, total FROM order_items WHERE order_id = ?',
    [orderId]
  );

  let sales_total = 0;
  let rental_total = 0;
  let operator_total = 0;

  items.forEach((item) => {
    const total = parseFloat(item.total) || 0;
    switch (item.item_type) {
      case 'sale':
        sales_total += total;
        break;
      case 'rental':
        rental_total += total;
        break;
      case 'operator':
        operator_total += total;
        break;
    }
  });

  const total_cost = sales_total + rental_total + operator_total;

  await pool.query(
    'UPDATE orders SET sales_total = ?, rental_total = ?, operator_total = ?, total_cost = ? WHERE id = ?',
    [sales_total, rental_total, operator_total, total_cost, orderId]
  );
}

// POST add item to order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    const body = await request.json();
    const {
      equipment_id, item_type, description, skill, quantity, unit_price,
      rental_start, rental_end, hours
    } = body;

    if (!item_type) {
      return NextResponse.json({ error: 'Item type is required' }, { status: 400 });
    }

    // Calculate total based on item type
    let total = 0;
    const qty = quantity || 1;
    const price = parseFloat(unit_price) || 0;

    if (item_type === 'operator') {
      const hrs = parseFloat(hours) || 0;
      total = price * hrs;
    } else if (item_type === 'rental' && rental_start && rental_end) {
      const start = new Date(rental_start);
      const end = new Date(rental_end);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      total = price * days * qty;
    } else {
      total = price * qty;
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO order_items
       (order_id, equipment_id, item_type, description, skill, quantity, unit_price, rental_start, rental_end, hours, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, equipment_id || null, item_type, description || null, skill || null,
        qty, price || null, rental_start || null, rental_end || null, hours || null, total
      ]
    );

    // Recalculate order totals
    await recalculateOrderTotals(orderId);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT oi.*, e.name as equipment_name, e.serial_number as equipment_serial
       FROM order_items oi
       LEFT JOIN equipment e ON oi.equipment_id = e.id
       WHERE oi.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding order item:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}
