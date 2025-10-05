import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/gift-products - Get all active gift products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase
      .from('gift_products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching gift products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gift products' },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftProducts: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/gift-products - Create a new gift product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category, image_url } = body;

    // Basic validation
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('gift_products')
      .insert([
        {
          name,
          description: description || '',
          price: parseFloat(price),
          category,
          image_url: image_url || null,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating gift product:', error);
      return NextResponse.json(
        { error: 'Failed to create gift product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftProduct: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
