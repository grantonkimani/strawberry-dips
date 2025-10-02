import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: 'Tracking code is required' },
        { status: 400 }
      );
    }

    // Search for order by tracking code
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('tracking_code', code.toUpperCase())
      .single();

    if (error || !order) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order not found with this tracking code' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error fetching order by tracking code:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch order details' 
      },
      { status: 500 }
    );
  }
}
