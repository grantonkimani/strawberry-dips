import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// PUT /api/wine-liquor-categories/[id] - Update wine/liquor category
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

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const { data: wineLiquorCategory, error } = await supabaseAdmin
      .from('wine_liquor_categories')
      .update({
        name,
        description,
        icon,
        display_order,
        is_active
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating wine/liquor category:', error);
      return NextResponse.json(
        { error: 'Failed to update wine/liquor category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ wineLiquorCategory });
  } catch (error) {
    console.error('Error in wine/liquor categories PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/wine-liquor-categories/[id] - Delete wine/liquor category
export async function DELETE(
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

    const { error } = await supabaseAdmin
      .from('wine_liquor_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting wine/liquor category:', error);
      return NextResponse.json(
        { error: 'Failed to delete wine/liquor category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in wine/liquor categories DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
