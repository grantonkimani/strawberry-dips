import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

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

    // Validate mime and size
    const allowedTypes = ['video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only MP4 or WebM videos allowed' }, { status: 400 })
    }
    const maxBytes = 50 * 1024 * 1024 // 50MB cap
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'Video too large (max 50MB)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ext = (file.name.split('.').pop() || 'mp4').toLowerCase()
    const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-videos')
      .upload(path, buffer, { contentType: file.type })
    if (uploadError) {
      console.error('Video upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from('product-videos').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl, path })
  } catch (err: any) {
    console.error('Upload video route error:', err)
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 })
  }
}


