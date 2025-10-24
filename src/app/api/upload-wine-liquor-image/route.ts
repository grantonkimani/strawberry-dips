import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const productType = data.get('productType') as string || 'wine-liquor';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const path = `${productType}/${fileName}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(path);

    return NextResponse.json({ 
      success: true, 
      imageUrl: urlData.publicUrl,
      fileName: fileName 
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');
    const productType = searchParams.get('productType') || 'wine-liquor';

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Extract filename from URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
    }

    // Delete file from Supabase storage
    const path = `${productType}/${fileName}`;
    const { error: deleteError } = await supabaseAdmin.storage
      .from('product-images')
      .remove([path]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
