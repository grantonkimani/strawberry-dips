import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    // Use admin client if available, fallback to regular client
    const client = supabaseAdmin || supabase;
    
    let query = client
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ categories: data });
    
    // Only cache for a short time to allow immediate updates when categories are added
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60')
    
    return response;
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      console.error('supabaseAdmin is null - missing SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json(
        { error: 'Server configuration error. Please check environment variables.' },
        { status: 500 }
      );
    }

    const { name, description, display_order } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    console.log('Creating category:', { name, description, display_order });

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name,
        description: description || null,
        display_order: display_order || 0,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json(
        { error: `Failed to create category: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Category created successfully:', data);
    return NextResponse.json({ category: data }, { status: 201 });
  } catch (error) {
    console.error('Create category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

