import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET /api/wine-liquor-products
export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    let query = supabaseAdmin
      .from('wine_liquor_products')
      .select(`
        *,
        wine_liquor_categories (
          id,
          name,
          description,
          icon,
          display_order
        )
      `)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: wineLiquorProducts, error } = await query;

    if (error) {
      console.error('Error fetching wine/liquor products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch wine/liquor products' },
        { status: 500 }
      );
    }

    return NextResponse.json({ wineLiquorProducts });
  } catch (error) {
    console.error('Error in wine/liquor products API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/wine-liquor-products
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      category,
      wine_liquor_category_id,
      image_url,
      alcohol_content,
      volume,
      vintage,
      region,
      producer,
      grape_variety,
      spirit_type,
      serving_temperature,
      food_pairing,
      tasting_notes,
      is_active,
      requires_age_verification
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Product name and price are required' },
        { status: 400 }
      );
    }

    // Prepare insert data, handling empty strings for UUID fields
    const insertData: any = {
      name,
      description,
      price: parseFloat(price),
      category,
      image_url,
      alcohol_content,
      volume,
      vintage,
      region,
      producer,
      grape_variety,
      spirit_type,
      serving_temperature,
      food_pairing,
      tasting_notes,
      is_active: is_active !== undefined ? is_active : true,
      requires_age_verification: requires_age_verification !== undefined ? requires_age_verification : true
    };

    // Only include wine_liquor_category_id if it's not empty
    if (wine_liquor_category_id && wine_liquor_category_id.trim() !== '') {
      insertData.wine_liquor_category_id = wine_liquor_category_id;
    }

    const { data: wineLiquorProduct, error } = await supabaseAdmin
      .from('wine_liquor_products')
      .insert(insertData)
      .select(`
        *,
        wine_liquor_categories (
          id,
          name,
          description,
          icon,
          display_order
        )
      `)
      .single();

    if (error) {
      console.error('Error creating wine/liquor product:', error);
      return NextResponse.json(
        { error: 'Failed to create wine/liquor product', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ wineLiquorProduct }, { status: 201 });
  } catch (error) {
    console.error('Error in wine/liquor products POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT /api/wine-liquor-products
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      id,
      name,
      description,
      price,
      category,
      wine_liquor_category_id,
      image_url,
      alcohol_content,
      volume,
      vintage,
      region,
      producer,
      grape_variety,
      spirit_type,
      serving_temperature,
      food_pairing,
      tasting_notes,
      is_active,
      requires_age_verification
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (wine_liquor_category_id !== undefined) updateData.wine_liquor_category_id = wine_liquor_category_id;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (alcohol_content !== undefined) updateData.alcohol_content = alcohol_content;
    if (volume !== undefined) updateData.volume = volume;
    if (vintage !== undefined) updateData.vintage = vintage;
    if (region !== undefined) updateData.region = region;
    if (producer !== undefined) updateData.producer = producer;
    if (grape_variety !== undefined) updateData.grape_variety = grape_variety;
    if (spirit_type !== undefined) updateData.spirit_type = spirit_type;
    if (serving_temperature !== undefined) updateData.serving_temperature = serving_temperature;
    if (food_pairing !== undefined) updateData.food_pairing = food_pairing;
    if (tasting_notes !== undefined) updateData.tasting_notes = tasting_notes;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (requires_age_verification !== undefined) updateData.requires_age_verification = requires_age_verification;

    const { data: wineLiquorProduct, error } = await supabaseAdmin
      .from('wine_liquor_products')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        wine_liquor_categories (
          id,
          name,
          description,
          icon,
          display_order
        )
      `)
      .single();

    if (error) {
      console.error('Error updating wine/liquor product:', error);
      return NextResponse.json(
        { error: 'Failed to update wine/liquor product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ wineLiquorProduct });
  } catch (error) {
    console.error('Error in wine/liquor products PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/wine-liquor-products
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // First check if the table exists
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('wine_liquor_products')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table check error:', tableError);
      return NextResponse.json(
        { error: 'Wine/liquor products table does not exist. Please run the database migration first.' },
        { status: 500 }
      );
    }

    const { error } = await supabaseAdmin
      .from('wine_liquor_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting wine/liquor product:', error);
      return NextResponse.json(
        { error: 'Failed to delete wine/liquor product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in wine/liquor products DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
