import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/gift-categories - Get all gift categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let query = supabase
      .from('gift_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching gift categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gift categories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftCategories: data || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/gift-categories - Create a new gift category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, display_order } = body;

    // Basic validation
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('gift_categories')
      .insert([
        {
          name,
          description: description || '',
          icon: icon || '🎁',
          display_order: display_order || 0,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating gift category:', error);
      return NextResponse.json(
        { error: 'Failed to create gift category' },
        { status: 500 }
      );
    }

    return NextResponse.json({ giftCategory: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
