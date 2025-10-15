import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendOrderEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const db = supabaseAdmin ?? supabase;
    let query = db.from('custom_requests').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ requests: data || [] });
  } catch (err: any) {
    console.error('Custom request GET error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      occasion,
      event_date,
      area,
      budget,
      description,
      image_urls = [],
    } = body || {};

    if (!name || !email || !phone || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Ensure table exists and insert
    const db = supabaseAdmin ?? supabase;
    const { data, error } = await db
      .from('custom_requests')
      .insert({
        customer_name: name,
        customer_email: email,
        customer_phone: phone || null,
        occasion: occasion || null,
        event_date: event_date || null,
        area: area || null,
        budget: budget || null,
        description,
        image_urls,
        status: 'submitted',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Custom request insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optional notification email to store owner
    try {
      const to = process.env.GMAIL_USER || '';
      if (to) {
        await sendOrderEmail(to, 'orderConfirmed', {
          // reuse basic template to notify; minimal fields
          customer_first_name: name,
          customer_email: email,
          total: 0,
          delivery_date: event_date || null,
          special_instructions: description,
        });
      }
    } catch (e) {
      console.warn('Notification email failed (non-blocking):', e);
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Custom request POST error:', err);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}


