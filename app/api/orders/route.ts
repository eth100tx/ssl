import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}-${random}`;
}

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');

    let query = `
      SELECT o.*, c.name as customer_name, c.company as customer_company
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (type) {
      query += ' AND o.type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (customerId) {
      query += ' AND o.customer_id = ?';
      params.push(parseInt(customerId));
    }

    query += ' ORDER BY o.created_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_id, type, status, event_date, event_address, event_city, event_state, event_zip,
      shipping_address, shipping_city, shipping_state, shipping_zip, ship_date, ship_method,
      payment_method, payment_terms, tax_exempt_number, comments
    } = body;

    if (!customer_id) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }

    const order_number = generateOrderNumber();

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO orders
       (customer_id, order_number, type, status, event_date, event_address, event_city, event_state, event_zip,
        shipping_address, shipping_city, shipping_state, shipping_zip, ship_date, ship_method,
        payment_method, payment_terms, tax_exempt_number, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_id, order_number, type || 'proposal', status || 'draft',
        event_date || null, event_address || null, event_city || null, event_state || null, event_zip || null,
        shipping_address || null, shipping_city || null, shipping_state || null, shipping_zip || null,
        ship_date || null, ship_method || null, payment_method || null, payment_terms || null,
        tax_exempt_number || null, comments || null
      ]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT o.*, c.name as customer_name, c.company as customer_company
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.id = ?`,
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
