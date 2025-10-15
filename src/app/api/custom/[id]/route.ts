import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } } | any
) {
  try {
    const { id } = context.params;
    const db = supabaseAdmin ?? supabase;
    const { error } = await db.from('custom_requests').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Custom request DELETE error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete' }, { status: 500 });
  }
}


