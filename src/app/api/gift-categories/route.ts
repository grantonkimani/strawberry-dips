import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/gift-categories - Get all gift categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // First, try to get from gift_categories table
    let query = supabase
      .from('gift_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    // If gift_categories table doesn't exist or is empty, fallback to existing categories
    if (error || !data || data.length === 0) {
      console.log('gift_categories table not found or empty, falling back to existing categories');
      
      // Get unique categories from existing gift products
      const { data: products, error: productsError } = await supabase
        .from('gift_products')
        .select('category')
        .not('category', 'is', null);

      if (productsError) {
        console.error('Error fetching gift products:', productsError);
        return NextResponse.json(
          { error: 'Failed to fetch gift categories' },
          { status: 500 }
        );
      }

      // Create category objects from existing product categories
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      const fallbackCategories = uniqueCategories.map((category, index) => ({
        id: `fallback-${category.toLowerCase()}`,
        name: category,
        description: `Existing ${category} category`,
        icon: getCategoryIcon(category),
        display_order: index + 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      return NextResponse.json({ giftCategories: fallbackCategories });
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

// Helper function to get category icon
function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'flowers': return '🌸';
    case 'liquor': return '🍷';
    case 'chocolates': return '🍫';
    case 'services': return '🎁';
    case 'cards': return '💌';
    default: return '🎁';
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

    // Check if gift_categories table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('gift_categories')
      .select('id')
      .limit(1);

    if (tableError) {
      return NextResponse.json(
        { 
          error: 'Gift categories table not set up yet. Please run the database migration first.',
          suggestion: 'Run the gift-categories-schema.sql migration in your Supabase dashboard'
        },
        { status: 500 }
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
