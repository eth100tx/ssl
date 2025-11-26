import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

// DELETE remove worker from order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workerId: string }> }
) {
  try {
    const { workerId } = await params;
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM order_workers WHERE id = ?',
      [workerId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Worker assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Worker removed from order' });
  } catch (error) {
    console.error('Error removing worker from order:', error);
    return NextResponse.json({ error: 'Failed to remove worker' }, { status: 500 });
  }
}
