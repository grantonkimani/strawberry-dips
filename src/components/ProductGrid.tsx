'use client';

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { CategoryTabs } from "./CategoryTabs";
import { CategorySection } from "./CategorySection";
import { GiftProductGrid } from "./GiftProductGrid";
import Link from "next/link";
import { Button } from "./ui/Button";
import { Gift } from "lucide-react";

interface ApiProduct {
	id: string;
	name: string;
	description: string | null;
	base_price: number;
	category_id: string | null;
	image_url: string | null;
	video_url?: string | null;
	categories?: {
		id: string;
		name: string;
		description?: string;
		display_order: number;
	};
	// Legacy support
	category?: string;
	// Offer information
	offer?: {
		offer_price: number;
		discount_percentage: number;
		end_date: string;
	};
}

interface Category {
	id: string;
	name: string;
	description?: string;
	display_order: number;
}

export function ProductGrid() {
	const [products, setProducts] = useState<ApiProduct[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [search, setSearch] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Read query from URL (?q=) and react to changes
	const searchParams = useSearchParams();
	useEffect(() => {
		setSearch(searchParams.get('q') || '');
	}, [searchParams]);

	// Define fetchData function outside useEffect so it can be reused
	const fetchData = async () => {
		try {
			// Fetch products, categories, and offers in parallel with caching
			const [productsRes, categoriesRes, offersRes] = await Promise.all([
				fetch('/api/products?available=true&limit=1000', {
					cache: 'no-store', // Always fetch fresh data
					next: { revalidate: 0 } // No revalidation
				}),
				fetch('/api/categories', {
					cache: 'no-store', // Always fetch fresh data
					next: { revalidate: 0 }, // No revalidation
					headers: {
						'Cache-Control': 'no-cache, no-store, must-revalidate',
						'Pragma': 'no-cache',
						'Expires': '0'
					}
				}),
				fetch('/api/offers', {
					cache: 'no-store',
					next: { revalidate: 0 }
				})
			]);

			const productsData = await productsRes.json();
			const categoriesData = await categoriesRes.json();
			const offersData = await offersRes.json();

			// Get active offers
			const activeOffers = offersData.offers || [];
			
			// Create a map of product_id -> offer for quick lookup
			const offersMap = new Map<string, typeof activeOffers[0]>();
			const today = new Date().toISOString().split('T')[0];
			
			activeOffers.forEach((offer: any) => {
				if (offer.product_id && offer.is_active) {
					// Double-check date range on client side (in case of timezone issues)
					const startDate = offer.start_date;
					const endDate = offer.end_date;
					
					// Only include offers that are currently active (within date range)
					if (startDate <= today && endDate >= today) {
						offersMap.set(offer.product_id, offer);
					}
				}
			});

			// Merge offers with products
			let productsList: ApiProduct[] = [];
			if (Array.isArray(productsData)) {
				productsList = productsData;
			} else if (productsData.products) {
				productsList = productsData.products;
			} else {
				setError(productsData.error || 'Failed to load products');
				return;
			}

			// Attach offers to products
			const productsWithOffers = productsList.map((product: ApiProduct) => {
				const offer = offersMap.get(product.id);
				if (offer) {
					return {
						...product,
						offer: {
							offer_price: offer.offer_price,
							discount_percentage: offer.discount_percentage,
							end_date: offer.end_date
						}
					};
				}
				return product;
			});

			setProducts(productsWithOffers);

			// Set categories with product counts
			if (Array.isArray(categoriesData)) {
				const categoriesWithCounts = categoriesData.map(category => ({
					...category,
					product_count: productsData.filter((p: ApiProduct) => p.category_id === category.id).length
				}));
				setCategories(categoriesWithCounts);
			} else if (categoriesData.categories) {
				const categoriesWithCounts = categoriesData.categories.map((category: Category) => ({
					...category,
					product_count: productsData.filter((p: ApiProduct) => p.category_id === category.id).length
				}));
				setCategories(categoriesWithCounts);
			} else {
				console.warn('Failed to load categories:', categoriesData.error);
				setCategories([]);
			}
		} catch (e) {
			setError('Failed to load data');
			console.error('Error fetching data:', e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Transform products to ensure description is never null
	const transformedProducts = products.map(product => ({
		...product,
		description: product.description || ''
	}));

	// Group products by category
	const groupedProducts = transformedProducts.reduce((acc, product) => {
		const categoryId = product.category_id || 'uncategorized';
		if (!acc[categoryId]) {
			acc[categoryId] = [];
		}
		acc[categoryId].push(product);
		return acc;
	}, {} as Record<string, any[]>);

	// Filter products based on selected category and search
	const baseFiltered = selectedCategory 
		? groupedProducts[selectedCategory] || []
		: transformedProducts;

	const normalized = (s: string) => s.toLowerCase();
	const searchFiltered = useMemo(() => {
		const term = normalized(search.trim());
		if (!term) return baseFiltered;
		return baseFiltered.filter(p =>
			normalized(p.name).includes(term) ||
			normalized(p.description || '').includes(term) ||
			normalized(p.categories?.name || p.category || '').includes(term)
		);
	}, [baseFiltered, search]);

	// Get categories with products
	const categoriesWithProducts = categories.filter(cat => 
		groupedProducts[cat.id] && groupedProducts[cat.id].length > 0
	);

	return (
		<section className="py-16 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Section Header */}
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						Our Premium Collection
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
						Hand-crafted chocolate covered strawberries made with the finest ingredients 
						and delivered fresh to your door.
					</p>
				</div>

				{loading ? (
					<div>
						{/* Skeleton header spacing keeps layout stable */}
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
							{Array.from({ length: 10 }).map((_, i) => (
								<div key={i} className="animate-pulse">
									<div className="aspect-square rounded-lg bg-gray-200" />
									<div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
									<div className="mt-1 h-4 w-1/2 rounded bg-gray-200" />
									<div className="mt-3 h-9 w-full rounded-md bg-gray-200" />
								</div>
							))}
						</div>
					</div>
				) : error ? (
					<div className="text-center text-red-600">{error}</div>
				) : (
					<>
						{/* Category Tabs */}
						<CategoryTabs
							categories={categoriesWithProducts}
							selectedCategory={selectedCategory}
							onCategorySelect={setSelectedCategory}
						/>

					{/* Products Display */}
						{selectedCategory ? (
						// Show single category
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
								{searchFiltered.length === 0 ? (
									<div className="col-span-full text-center text-gray-600 py-8">
										No products found.
									</div>
								) : searchFiltered.map((product) => (
									<ProductCard
										key={product.id}
										product={{
											id: product.id,
											name: product.name,
											description: product.description ?? '',
											base_price: product.base_price,
										image_url: product.image_url ?? '/images/placeholder-gift.svg',
										video_url: product.video_url || undefined,
											categories: product.categories,
											category: product.category, // Legacy support
										}}
									/>
								))}
							</div>
						) : (
						// Show all categories in sections
							<div>
								{categoriesWithProducts.length === 0 ? (
									<div className="text-center text-gray-600 py-8">No products available yet. Please check back soon.</div>
								) : categoriesWithProducts
									.sort((a, b) => a.display_order - b.display_order)
									.map((category) => (
										<CategorySection
											key={category.id}
											category={category}
										products={(groupedProducts[category.id] || []).filter((p) =>
											search.trim()
												? (normalized(p.name).includes(normalized(search)) ||
												   normalized(p.description || '').includes(normalized(search)))
												: true
										)}
										/>
									))}
							</div>
						)}
					</>
				)}
				
				{/* Gift Collection Section - Only show when no specific category is selected */}
				{!selectedCategory && !loading && !error && (
					<div className="mt-20">
						{/* Gift Collection Header */}
						<div className="text-center mb-12">
							<div className="flex items-center justify-center mb-4">
								<Gift className="h-8 w-8 text-pink-600 mr-3" />
								<h2 className="text-4xl font-bold text-gray-900">
									Gift Collection
								</h2>
							</div>
							<p className="text-xl text-gray-600 max-w-2xl mx-auto">
								Perfect gifts for every occasion. Hand-crafted with love and delivered with care.
							</p>
						</div>
						
						{/* Gift Products Grid */}
						<GiftProductGrid limit={8} showCategory={true} />
						
						{/* View All Gifts Button */}
						<div className="text-center mt-8">
							<Link href="/gifts">
								<Button 
									variant="outline" 
									size="lg"
									className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border-0 px-8 py-3"
								>
									<Gift className="h-5 w-5 mr-2" />
									View All Gifts
								</Button>
							</Link>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
