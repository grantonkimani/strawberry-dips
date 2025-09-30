import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return NextResponse.json({ 
        error: 'Supabase not configured. No data to clear.' 
      }, { status: 400 });
    }

    console.log('Starting test data cleanup...');

    // Clear order items first (due to foreign key constraints)
    const { error: orderItemsError } = await supabase
      .from('order_items')
      .delete()
      .neq('id', 'impossible-id'); // Delete all records

    if (orderItemsError) {
      console.error('Error clearing order items:', orderItemsError);
      throw new Error(`Failed to clear order items: ${orderItemsError.message}`);
    }

    // Clear orders
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .neq('id', 'impossible-id'); // Delete all records

    if (ordersError) {
      console.error('Error clearing orders:', ordersError);
      throw new Error(`Failed to clear orders: ${ordersError.message}`);
    }

    // Clear customers (optional - you might want to keep customer data)
    const { error: customersError } = await supabase
      .from('customers')
      .delete()
      .neq('id', 'impossible-id'); // Delete all records

    if (customersError) {
      console.error('Error clearing customers:', customersError);
      // Don't throw error for customers - it's optional
      console.warn('Customer data cleanup failed, but continuing...');
    }

    console.log('Test data cleanup completed successfully');

    return NextResponse.json({ 
      success: true,
      message: 'All test data has been cleared successfully. Your store is ready for real customers!' 
    });

  } catch (error) {
    console.error('Error during test data cleanup:', error);
    return NextResponse.json(
      { error: `Failed to clear test data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
