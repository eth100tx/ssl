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

// DELETE order item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const orderId = parseInt(id);

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM order_items WHERE id = ? AND order_id = ?',
      [itemId, orderId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Recalculate order totals
    await recalculateOrderTotals(orderId);

    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Error deleting order item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
