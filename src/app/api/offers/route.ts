import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/auth-middleware';

// Public endpoint: Get active offers
async function getActiveOffers(_request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        products (
          id,
          name,
          base_price,
          image_url
        )
      `)
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active offers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch offers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ offers: data || [] });
  } catch (error) {
    console.error('Error in getActiveOffers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin endpoint: Get all offers
async function getAllOffers(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        *,
        products (
          id,
          name,
          base_price,
          image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch offers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ offers: data || [] });
  } catch (error) {
    console.error('Error in getAllOffers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin endpoint: Create offer
async function createOffer(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, offer_price, start_date, end_date, is_active = true } = body;

    // Validation
    if (!product_id || !offer_price || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields: product_id, offer_price, start_date, and end_date are required' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, base_price')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate offer price is less than base price
    if (offer_price >= product.base_price) {
      return NextResponse.json(
        { error: 'Offer price must be less than the product base price' },
        { status: 400 }
      );
    }

    // Auto-calculate discount percentage from prices
    const calculatedDiscount = ((product.base_price - offer_price) / product.base_price) * 100;

    // Check for existing active offer for this product
    const today = new Date().toISOString().split('T')[0];
    const { data: existingOffer } = await supabase
      .from('offers')
      .select('id')
      .eq('product_id', product_id)
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)
      .maybeSingle();

    if (existingOffer) {
      return NextResponse.json(
        { error: 'This product already has an active offer. Please deactivate the existing offer first.' },
        { status: 400 }
      );
    }

    // Create offer with auto-calculated percentage
    const { data, error } = await supabase
      .from('offers')
      .insert({
        product_id,
        offer_price: parseFloat(offer_price),
        discount_percentage: parseFloat(calculatedDiscount.toFixed(2)),
        start_date,
        end_date,
        is_active
      })
      .select(`
        *,
        products (
          id,
          name,
          base_price,
          image_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ offer: data }, { status: 201 });
  } catch (error) {
    console.error('Error in createOffer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Public GET - active offers only
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get('admin') === 'true';
  
  if (admin) {
    return withAdminAuth(getAllOffers)(request);
  }
  
  return getActiveOffers(request);
}

// Admin POST - create offer
export const POST = withAdminAuth(createOffer);

