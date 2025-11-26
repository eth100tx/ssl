import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET all employees
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM employees WHERE 1=1';
    const params: string[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR skills LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY role ASC, name ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// POST create employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, phone, beeper, address, city, state, zip, email, skills, hourly_rate, status, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO employees (name, role, phone, beeper, address, city, state, zip, email, skills, hourly_rate, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, role || 'contract', phone || null, beeper || null, address || null, city || null,
       state || null, zip || null, email || null, skills || null,
       hourly_rate || null, status || 'active', notes || null]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM employees WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
