import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const { data, error } = await supabase
			.from('products')
			.select(`
				*,
				categories (
					id,
					name,
					description,
					display_order
				)
			`)
			.eq('id', id)
			.single()
		if (error) throw error
		return NextResponse.json({ product: data })
	} catch (error) {
		console.error('GET /api/products/[id] error:', error)
		return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
	}
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
    const updates = await request.json()
    // Handle image_urls normalization and enforce max 3; keep image_url synced to first
    if (Array.isArray(updates.image_urls)) {
      const seen = new Set<string>()
      const normalized = updates.image_urls
        .filter((u: any) => typeof u === 'string' && u.trim())
        .map((u: string) => normalizePublicUrl(u.trim()))
        .filter((u: string) => (seen.has(u) ? false : (seen.add(u), true)))
        .slice(0, 3)
      updates.image_urls = normalized
      if (!updates.image_url && normalized.length > 0) {
        updates.image_url = normalized[0]
      }
    } else if (typeof updates.image_url === 'string') {
      updates.image_url = normalizePublicUrl(updates.image_url)
    }

	let { data, error } = await supabase
			.from('products')
			.update(updates)
			.eq('id', id)
			.select(`
				*,
				categories (
					id,
					name,
					description,
					display_order
				)
			`)
			.single()

	// Fallback if image_urls column doesn't exist yet
	if (error && (error.message?.includes('image_urls') || error.message?.includes('column') || (error as any).code === '42703')) {
		try { delete (updates as any).image_urls } catch {}
		const retry = await supabase
			.from('products')
			.update(updates)
			.eq('id', id)
			.select(`
				*,
				categories (
					id,
					name,
					description,
					display_order
				)
			`)
			.single()
	data = retry.data as any
	error = retry.error as any
	}
		if (error) throw error
		return NextResponse.json({ product: data })
	} catch (error) {
		console.error('PATCH /api/products/[id] error:', error)
		return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const { error } = await supabase
			.from('products')
			.delete()
			.eq('id', id)
		if (error) throw error
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('DELETE /api/products/[id] error:', error)
		return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
	}
}

function normalizePublicUrl(url?: string | null): string {
  if (!url) return ''
  if (url.includes('/object/public/product-images/')) return url
  const marker = '/storage/v1/object/product-images/'
  if (url.includes(marker)) {
    return url.replace('/storage/v1/object/product-images/', '/storage/v1/object/public/product-images/')
  }
  return url
}
