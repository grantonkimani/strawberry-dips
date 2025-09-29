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
		const { data, error } = await supabase
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


