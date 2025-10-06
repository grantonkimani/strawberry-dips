import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/gift-categories/[id] - Get a specific gift category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('gift_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching gift category:', error);
      return NextResponse.json(
        { error: 'Gift category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ giftCategory: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/gift-categories/[id] - Update a gift category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, display_order, is_active } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('gift_categories')
      .update({
        name,
        description: description || '',
        icon: icon || '🎁',
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gift category:', error);
      return NextResponse.json(
        { error: 'Failed to update gift category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftCategory: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/gift-categories/[id] - Delete a gift category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if there are any gift products using this category
    const { data: products, error: productsError } = await supabase
      .from('gift_products')
      .select('id')
      .eq('gift_category_id', id)
      .limit(1);

    if (productsError) {
      console.error('Error checking gift products:', productsError);
      return NextResponse.json(
        { error: 'Failed to check gift products' },
        { status: 500 }
      );
    }

    if (products && products.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category. There are gift products using this category.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('gift_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting gift category:', error);
      return NextResponse.json(
        { error: 'Failed to delete gift category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Gift category deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
