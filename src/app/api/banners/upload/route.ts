import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }
    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
    const maxBytes = 6 * 1024 * 1024; // 6MB
    if (file.size > maxBytes) return NextResponse.json({ error: 'Image too large (max 6MB)' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(path, buffer, { contentType: file.type });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (err: any) {
    console.error('Banner upload error:', err);
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}


