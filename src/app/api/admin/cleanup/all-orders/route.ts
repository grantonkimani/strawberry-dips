import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { withAdminAuth } from '@/lib/auth-middleware';

async function getAllOrders() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting all orders:', error);
      return NextResponse.json({ error: 'Failed to get orders' }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });

  } catch (error) {
    console.error('Error getting all orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Protected admin endpoint
export const GET = withAdminAuth(getAllOrders);
