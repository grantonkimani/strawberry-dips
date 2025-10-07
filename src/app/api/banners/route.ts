import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  if (!supabaseAdmin) return NextResponse.json({ banners: [] });
  const { data, error } = await supabaseAdmin
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banners: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
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
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}


