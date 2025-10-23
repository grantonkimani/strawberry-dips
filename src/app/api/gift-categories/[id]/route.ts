import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

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

    // Use admin client for consistent behavior
    const db = supabaseAdmin;

    // If this is a fallback ID (generated from product categories), create or map to a real row
    if (id.startsWith('fallback-')) {
      // Try to find an existing real category by name
      const { data: existingByName, error: findError } = await db
        .from('gift_categories')
        .select('*')
        .ilike('name', name)
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error('Error looking up gift category by name:', findError);
        return NextResponse.json({ error: 'Failed to update gift category' }, { status: 500 });
      }

      if (existingByName) {
        // Update the existing real record
        const { data: updated, error: updateExistingError } = await db
          .from('gift_categories')
          .update({
            name,
            description: description || '',
            icon: icon || '🎁',
            display_order: display_order || 0,
            is_active: is_active !== undefined ? is_active : true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingByName.id)
          .select()
          .single();

        if (updateExistingError) {
          console.error('Error updating existing gift category:', updateExistingError);
          const message = updateExistingError.message?.toLowerCase().includes('permission')
            ? 'Permission denied updating gift category. Check Supabase RLS policies.'
            : 'Failed to update gift category';
          return NextResponse.json({ error: message }, { status: 500 });
        }

        return NextResponse.json({ giftCategory: updated });
      }

      // Insert a new real record
      const { data: created, error: insertError } = await db
        .from('gift_categories')
        .insert([
          {
            name,
            description: description || '',
            icon: icon || '🎁',
            display_order: display_order || 0,
            is_active: is_active !== undefined ? is_active : true
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating gift category from fallback:', insertError);
        const message = insertError.message?.toLowerCase().includes('permission')
          ? 'Permission denied creating gift category. Check Supabase RLS policies.'
          : 'Failed to create gift category';
        return NextResponse.json({ error: message }, { status: 500 });
      }

      return NextResponse.json({ giftCategory: created });
    }

    const { data, error } = await db
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
      const message = error.message?.toLowerCase().includes('permission')
        ? 'Permission denied updating gift category. Check Supabase RLS policies.'
        : 'Failed to update gift category';
      return NextResponse.json({ error: message }, { status: 500 });
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
    const { data: products, error: productsError } = await supabaseAdmin
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

    // Use admin client for consistent behavior with other operations
    const db = supabaseAdmin;
    
    const { error } = await db
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
