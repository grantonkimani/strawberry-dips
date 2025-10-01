'use client';

import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { CategoryTabs } from "./CategoryTabs";
import { CategorySection } from "./CategorySection";

interface ApiProduct {
	id: string;
	name: string;
	description: string | null;
	base_price: number;
	category_id: string | null;
	image_url: string | null;
	categories?: {
		id: string;
		name: string;
		description?: string;
		display_order: number;
	};
	// Legacy support
	category?: string;
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
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch products and categories in parallel
				const [productsRes, categoriesRes] = await Promise.all([
					fetch('/api/products?available=true&limit=100'),
					fetch('/api/categories')
				]);

				const productsData = await productsRes.json();
				const categoriesData = await categoriesRes.json();

				// Set products
				if (Array.isArray(productsData)) {
					setProducts(productsData);
				} else if (productsData.products) {
					setProducts(productsData.products);
				} else {
					setError(productsData.error || 'Failed to load products');
					return;
				}

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

	// Filter products based on selected category
	const filteredProducts = selectedCategory 
		? groupedProducts[selectedCategory] || []
		: transformedProducts;

	// Get categories with products
	const categoriesWithProducts = categories.filter(cat => 
		groupedProducts[cat.id] && groupedProducts[cat.id].length > 0
	);

	return (
		<section className="py-16 px-4 bg-gray-50">
			<div className="max-w-7xl mx-auto">
				{/* Section Header */}
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						Our Premium Collection
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Hand-crafted chocolate covered strawberries made with the finest ingredients 
						and delivered fresh to your door.
					</p>
				</div>

				{loading ? (
					<div className="text-center text-gray-600">Loading products...</div>
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
								{filteredProducts.map((product) => (
									<ProductCard
										key={product.id}
										product={{
											id: product.id,
											name: product.name,
											description: product.description ?? '',
											base_price: product.base_price,
											image_url: product.image_url ?? '/api/placeholder/300/300',
											categories: product.categories,
											category: product.category, // Legacy support
										}}
									/>
								))}
							</div>
						) : (
							// Show all categories in sections
							<div>
								{categoriesWithProducts
									.sort((a, b) => a.display_order - b.display_order)
									.map((category) => (
										<CategorySection
											key={category.id}
											category={category}
											products={groupedProducts[category.id] || []}
										/>
									))}
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}
