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

// GET single order with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get order with customer info
    const [orders] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, c.name as customer_name, c.company as customer_company,
              c.phone as customer_phone, c.address as customer_address,
              c.city as customer_city, c.state as customer_state, c.zip as customer_zip
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get order items with equipment info
    const [items] = await pool.query<RowDataPacket[]>(
      `SELECT oi.*, e.name as equipment_name, e.serial_number as equipment_serial
       FROM order_items oi
       LEFT JOIN equipment e ON oi.equipment_id = e.id
       WHERE oi.order_id = ?
       ORDER BY oi.created_at ASC`,
      [id]
    );

    const order = orders[0];
    order.items = items;

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PUT update order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      customer_id, type, status, event_date, event_address, event_city, event_state, event_zip,
      shipping_address, shipping_city, shipping_state, shipping_zip, ship_date, ship_method,
      payment_method, payment_terms, tax_exempt_number, comments
    } = body;

    await pool.query<ResultSetHeader>(
      `UPDATE orders SET
       customer_id = ?, type = ?, status = ?, event_date = ?,
       event_address = ?, event_city = ?, event_state = ?, event_zip = ?,
       shipping_address = ?, shipping_city = ?, shipping_state = ?, shipping_zip = ?,
       ship_date = ?, ship_method = ?, payment_method = ?, payment_terms = ?,
       tax_exempt_number = ?, comments = ?
       WHERE id = ?`,
      [
        customer_id, type || 'proposal', status || 'draft', event_date || null,
        event_address || null, event_city || null, event_state || null, event_zip || null,
        shipping_address || null, shipping_city || null, shipping_state || null, shipping_zip || null,
        ship_date || null, ship_method || null, payment_method || null, payment_terms || null,
        tax_exempt_number || null, comments || null, id
      ]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, c.name as customer_name, c.company as customer_company
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

// DELETE order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM orders WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order deleted' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
