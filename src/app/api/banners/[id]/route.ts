import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from('banners')
    .update(body)
    .eq('id', params.id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabaseAdmin
    .from('banners')
    .delete()
    .eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


