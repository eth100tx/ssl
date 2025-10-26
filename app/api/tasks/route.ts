import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// GET /api/tasks - List all tasks
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create new task
export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (title) VALUES (?)',
      [title]
    );

    return NextResponse.json(
      { id: (result as any).insertId, title, completed: false },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
