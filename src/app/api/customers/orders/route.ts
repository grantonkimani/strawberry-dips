import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production';
function getJwtSecretKey(): Uint8Array {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('customer-session')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey());
      
      if (payload.type !== 'customer') {
        return NextResponse.json(
          { error: 'Invalid token type' },
          { status: 401 }
        );
      }

      // Get customer orders
      const db = supabaseAdmin ?? supabase;
      const customerId = payload.customerId as string;

      // Try legacy schema first (customer_account_id). If column missing, fallback to customer_id
      let { data: orders, error } = await db
        .from('orders')
        .select(`
          id,
          status,
          total,
          created_at,
          delivery_date,
          tracking_code,
          payment_status
        `)
        .eq('customer_account_id', customerId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error && (error as any).code === '42703') {
        // Column customer_account_id does not exist, use customer_id instead
        const fallback = await db
          .from('orders')
          .select(`
            id,
            status,
            total,
            created_at,
            delivery_date,
            tracking_code,
            payment_status
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(20);
        orders = fallback.data as any;
        error = fallback.error as any;
      }

      if (error) {
        console.error('Orders fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch orders' },
          { status: 500 }
        );
      }

      const response = NextResponse.json({
        success: true,
        orders: orders || []
      });
      
      // Add caching headers to improve performance
      response.headers.set('Cache-Control', 'private, max-age=60'); // Cache for 1 minute
      return response;

    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
