import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/auth-middleware';

// Admin endpoint: Update offer
async function updateOffer(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { product_id, offer_price, discount_percentage, start_date, end_date, is_active } = body;

    // Check if offer exists
    const { data: existingOffer, error: fetchError } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingOffer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (product_id !== undefined) updateData.product_id = product_id;
    if (offer_price !== undefined) updateData.offer_price = parseFloat(offer_price);
    if (discount_percentage !== undefined) updateData.discount_percentage = parseFloat(discount_percentage);
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    // Validate dates if provided
    const finalStartDate = start_date || existingOffer.start_date;
    const finalEndDate = end_date || existingOffer.end_date;
    if (new Date(finalEndDate) < new Date(finalStartDate)) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Note: discount_percentage is now auto-calculated from offer_price, so we don't validate it separately

    // If product_id or offer_price changed, validate and recalculate percentage
    if (product_id || offer_price !== undefined) {
      const finalProductId = product_id || existingOffer.product_id;
      const { data: product } = await supabase
        .from('products')
        .select('base_price')
        .eq('id', finalProductId)
        .single();

      if (product) {
        const finalOfferPrice = offer_price !== undefined ? parseFloat(offer_price) : existingOffer.offer_price;
        if (finalOfferPrice >= product.base_price) {
          return NextResponse.json(
            { error: 'Offer price must be less than the product base price' },
            { status: 400 }
          );
        }
        
        // Auto-calculate discount percentage when offer_price changes
        const calculatedDiscount = ((product.base_price - finalOfferPrice) / product.base_price) * 100;
        updateData.discount_percentage = parseFloat(calculatedDiscount.toFixed(2));
      }
    }

    // Update offer
    const { data, error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', id)
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
      console.error('Error updating offer:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ offer: data });
  } catch (error) {
    console.error('Error in updateOffer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin endpoint: Delete offer
async function deleteOffer(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting offer:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to delete offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in deleteOffer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin PUT - update offer
export const PUT = withAdminAuth(updateOffer);

// Admin DELETE - delete offer
export const DELETE = withAdminAuth(deleteOffer);

