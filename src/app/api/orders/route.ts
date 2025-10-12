import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      console.warn('Supabase not configured, returning empty orders');
      return NextResponse.json({ 
        orders: [],
        message: 'Supabase not configured. Please set up your environment variables.' 
      });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = searchParams.get('limit') || '50';

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
    });

    const queryPromise = (async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (status) {
        query = query.eq('status', status);
      }

      const { data: orders, error } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      return orders;
    })();

    const orders = await Promise.race([queryPromise, timeoutPromise]);

    console.log('Orders fetched successfully:', Array.isArray(orders) ? orders.length : 0);
    return NextResponse.json({ orders: orders || [] });

  } catch (error) {
    console.error('Error fetching orders:', error);
    
    // Return more specific error messages
    let errorMessage = 'Failed to fetch orders';
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout - please try again';
      } else if (error.message.includes('connection')) {
        errorMessage = 'Database connection error - please try again';
      } else {
        errorMessage = `Failed to fetch orders: ${error.message}`;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
