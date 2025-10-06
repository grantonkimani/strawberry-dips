import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename for Supabase Storage
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `gift-${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gift-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      
      // Provide more helpful error messages
      if (uploadError.message.includes('Bucket not found')) {
        return NextResponse.json(
          { error: 'Storage bucket not configured. Please contact administrator to set up image storage.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('gift-images')
      .getPublicUrl(fileName);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error('Failed to get public URL for uploaded image');
      return NextResponse.json(
        { error: 'Failed to get public URL for uploaded image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: publicUrlData.publicUrl,
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
