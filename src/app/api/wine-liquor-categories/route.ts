import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET /api/wine-liquor-categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabaseAdmin
      .from('wine_liquor_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: wineLiquorCategories, error } = await query;

    if (error) {
      console.error('Error fetching wine/liquor categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wine/liquor categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ wineLiquorCategories });
  } catch (error) {
    console.error('Error in wine/liquor categories API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/wine-liquor-categories
export async function POST(request: NextRequest) {
  try {
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
      .insert({
        name,
        description,
        icon: icon || '🍷',
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating wine/liquor category:', error);
      return NextResponse.json(
        { error: 'Failed to create wine/liquor category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ wineLiquorCategory }, { status: 201 });
  } catch (error) {
    console.error('Error in wine/liquor categories POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/wine-liquor-categories
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, icon, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: wineLiquorCategory, error } = await supabaseAdmin
      .from('wine_liquor_categories')
      .update(updateData)
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

// DELETE /api/wine-liquor-categories
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

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
