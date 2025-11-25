import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET all equipment
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = 'SELECT * FROM equipment WHERE 1=1';
    const params: string[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR serial_number LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY name ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// POST create equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serial_number, name, category, sale_price, rental_rate,
      description, specifications, status, maintenance_due_date
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO equipment
       (serial_number, name, category, sale_price, rental_rate, description, specifications, status, maintenance_due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serial_number || null,
        name,
        category || 'other',
        sale_price || null,
        rental_rate || null,
        description || null,
        specifications || null,
        status || 'available',
        maintenance_due_date || null
      ]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM equipment WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating equipment:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Serial number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create equipment' }, { status: 500 });
  }
}
