import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
	try {
		console.log('GET /api/products - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
		console.log('GET /api/products - Supabase Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
		
		// Check if Supabase is configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
			console.log('Supabase not configured, returning sample products');
			// Return sample products when Supabase is not configured
			const sampleProducts = [
				{
					id: "1",
					name: "Classic Milk Chocolate Strawberries",
					description: "Fresh strawberries dipped in premium milk chocolate",
					base_price: 25.99,
					category: "Classic",
					image_url: null,
					is_available: true,
					created_at: new Date().toISOString(),
				},
				{
					id: "2",
					name: "Dark Chocolate Delight",
					description: "Rich dark chocolate covered strawberries with sea salt",
					base_price: 28.99,
					category: "Premium",
					image_url: null,
					is_available: true,
					created_at: new Date().toISOString(),
				},
				{
					id: "3",
					name: "White Chocolate Dreams",
					description: "Creamy white chocolate with colorful sprinkles",
					base_price: 26.99,
					category: "Sweet",
					image_url: null,
					is_available: true,
					created_at: new Date().toISOString(),
				}
			];
			return NextResponse.json(sampleProducts);
		}

		const { searchParams } = new URL(request.url)
		const category = searchParams.get('category')
		const availableOnly = searchParams.get('available') === 'true'
		const limit = Number(searchParams.get('limit') ?? '100')

		let query = supabase
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
			.order('created_at', { ascending: false })
			.limit(limit)

		if (category) {
			// If category is a UUID, search by category_id
			// If category is a string, search by category name
			if (category.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
				query = query.eq('category_id', category)
			} else {
				query = query.eq('categories.name', category)
			}
		}
		if (availableOnly) query = query.eq('is_available', true)

		const { data, error } = await query
		if (error) throw error

		return NextResponse.json(data)
	} catch (error) {
		console.error('GET /api/products error:', error)
		return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
	}
}

export async function POST(request: NextRequest) {
	try {
		console.log('POST /api/products - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
		
		// Check if Supabase is configured
		if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
			console.log('Supabase not configured, cannot create products');
			return NextResponse.json({ error: 'Database not configured. Please set up Supabase environment variables.' }, { status: 500 })
		}

    const body = await request.json()
    const { name, description, base_price, category_id, image_url, video_url, poster_url, is_available = true } = body

		if (!name || !base_price || !category_id) {
			return NextResponse.json({ error: 'Missing required fields: name, base_price, and category_id are required' }, { status: 400 })
		}

    const { data, error } = await supabase
			.from('products')
      .insert({ name, description, base_price, category_id, image_url, video_url, poster_url, is_available })
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

		if (error) {
			console.error('Supabase error:', error)
			return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 })
		}

		return NextResponse.json({ product: data })
	} catch (error) {
		console.error('POST /api/products error:', error)
		return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
	}
}

