import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Ensure Node runtime for Buffer support
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
    }
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.startsWith('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
    }

    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    // Basic size cap; skip strict type checks to avoid client mime quirks
    const type = file.type || 'video/mp4'
    const name = file.name || `upload-${Date.now()}.mp4`
    const maxBytes = 25 * 1024 * 1024 // 25MB cap to avoid local dev limits
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'Video too large (max 25MB)' }, { status: 400 })
    }

    // Convert to Buffer (Edge runtimes sometimes restrict this)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = (file.name.split('.').pop() || 'mp4').toLowerCase()
    const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // Use existing "product-images" bucket for simplicity (stores videos under /videos)
    // Avoids failures if a separate "product-videos" bucket hasn't been created yet
    const bucket = 'product-images'
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type })
    if (uploadError) {
      console.error('Video upload error:', uploadError)
      // Provide clearer errors for common misconfigurations
      if (uploadError.message?.toLowerCase().includes('not found')) {
        return NextResponse.json({ error: 'Storage bucket not found. Please ensure the bucket exists and is public.' }, { status: 500 })
      }
      return NextResponse.json({ error: uploadError.message || 'Upload failed' }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)
    if (!data?.publicUrl) {
      return NextResponse.json({ error: 'Failed to obtain public URL' }, { status: 500 })
    }
    return NextResponse.json({ url: data.publicUrl, path })
  } catch (err: any) {
    console.error('Upload video route error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to upload' }, { status: 500 })
  }
}


