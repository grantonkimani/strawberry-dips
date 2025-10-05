import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/gift-products/[id] - Get a specific gift product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('gift_products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching gift product:', error);
      return NextResponse.json(
        { error: 'Gift product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ giftProduct: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/gift-products/[id] - Update a gift product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, price, category, image_url, is_active } = body;

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
      .update({
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gift product:', error);
      return NextResponse.json(
        { error: 'Failed to update gift product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftProduct: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/gift-products/[id] - Delete a gift product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('gift_products')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting gift product:', error);
      return NextResponse.json(
        { error: 'Failed to delete gift product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Gift product deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
