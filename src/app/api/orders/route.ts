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
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const pageSizeParam = parseInt(searchParams.get('pageSize') || '20', 10);
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const pageSize = Number.isNaN(pageSizeParam) || pageSizeParam < 1 ? 20 : Math.min(pageSizeParam, 100);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
    });

    const queryPromise = (async () => {
      // Only fetch fields needed for list view (exclude heavy nested relations)
      let query = supabase
        .from('orders')
        .select(
          `id, stripe_payment_intent_id, status, payment_status, subtotal, delivery_fee, total, customer_email, customer_first_name, customer_last_name, customer_phone, delivery_address, delivery_city, delivery_state, delivery_zip_code, delivery_date, delivery_time, special_instructions, created_at`,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: orders, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      return { orders, count: count || 0 };
    })();

    const result = (await Promise.race([queryPromise, timeoutPromise])) as { orders: any[]; count: number };

    const total = result?.count || 0;
    const hasMore = from + (result?.orders?.length || 0) < total;

    console.log('Orders fetched successfully:', Array.isArray(result?.orders) ? result.orders.length : 0);
    return NextResponse.json({ orders: result?.orders || [], page, pageSize, total, hasMore });

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
