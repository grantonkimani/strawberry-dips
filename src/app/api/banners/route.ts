import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      console.warn('Supabase admin client not configured - returning empty banners');
      return NextResponse.json({ 
        banners: [],
        message: 'Supabase not configured. Please set up your environment variables in .env.local'
      });
    }
    
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });
      
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ banners: data ?? [] });
  } catch (error) {
    console.error('Banners GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!supabaseAdmin) {
      console.warn('Supabase admin client not configured');
      return NextResponse.json({ 
        error: 'Supabase not configured. Please set up your environment variables in .env.local' 
      }, { status: 500 });
    }
    
    // Validate required fields
    if (!body.image_url || body.image_url.trim() === '') {
      return NextResponse.json({ 
        error: 'Image URL is required. Please upload an image or provide a valid URL.' 
      }, { status: 400 });
    }
    
    // Check if banners table exists by trying a simple query first
    const { error: tableCheckError } = await supabaseAdmin
      .from('banners')
      .select('id')
      .limit(1);
      
    if (tableCheckError) {
      console.error('Banners table check failed:', tableCheckError);
      return NextResponse.json({ 
        error: `Database table error: ${tableCheckError.message}` 
      }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin.from('banners').insert({
      image_url: body.image_url,
      alt: body.alt ?? '',
      headline: body.headline ?? '',
      subtext: body.subtext ?? '',
      cta_label: body.cta_label ?? '',
      cta_href: body.cta_href ?? '',
      overlay: body.overlay ?? 0.45,
      display_order: body.display_order ?? 0,
      active: body.active ?? true,
      start_at: body.start_at ?? null,
      end_at: body.end_at ?? null,
    }).select('*').single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ banner: data });
  } catch (error) {
    console.error('Banners POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


