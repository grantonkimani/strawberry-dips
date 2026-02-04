"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Trash2, Pencil, Save, X } from 'lucide-react'

interface Offer {
	id: string
	product_id: string
	offer_price: number
	discount_percentage: number
	start_date: string
	end_date: string
	is_active: boolean
	created_at: string
	products?: {
		id: string
		name: string
		base_price: number
		image_url: string | null
	}
}

interface Product {
	id: string
	name: string
	base_price: number
	image_url: string | null
}

// Get default dates (today and 30 days from now)
const getDefaultDates = () => {
	const today = new Date();
	const future = new Date();
	future.setDate(today.getDate() + 30);
	return {
		start_date: today.toISOString().split('T')[0],
		end_date: future.toISOString().split('T')[0],
	};
};

const emptyForm = {
	product_id: '',
	offer_price: '',
	start_date: getDefaultDates().start_date,
	end_date: getDefaultDates().end_date,
	is_active: true,
}

export default function AdminOffersPage() {
	const [offers, setOffers] = useState<Offer[]>([])
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)
	const [form, setForm] = useState<typeof emptyForm>(emptyForm)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editForm, setEditForm] = useState<Partial<Offer>>({})

	useEffect(() => {
		fetchOffers()
		fetchProducts()
	}, [])

	async function fetchOffers() {
		setLoading(true)
		try {
			const res = await fetch('/api/offers?admin=true', {
				cache: 'no-store',
				headers: {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
				},
			})
			const data = await res.json()
			if (data.offers) {
				setOffers(data.offers)
			} else if (data.error) {
				setError(data.error)
			}
		} catch (error) {
			console.error('Error fetching offers:', error)
			setError('Failed to fetch offers')
		} finally {
			setLoading(false)
		}
	}

	async function fetchProducts() {
		try {
			const res = await fetch('/api/products?limit=1000', {
				cache: 'no-store',
			})
			const data = await res.json()
			if (Array.isArray(data)) {
				setProducts(data)
			}
		} catch (error) {
			console.error('Error fetching products:', error)
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		const { name, value } = e.target
		setForm(prev => ({
			...prev,
			[name]: value,
		}))
	}

	function handleEditChange(field: keyof Offer, value: any) {
		setEditForm(prev => ({
			...prev,
			[field]: value,
		}))
	}

	async function createOffer() {
		setError(null)
		
		// Validation
		if (!form.product_id) {
			setError('Please select a product')
			return
		}
		if (!form.offer_price || Number(form.offer_price) <= 0) {
			setError('Offer price must be greater than 0')
			return
		}
		if (!form.start_date || !form.end_date) {
			setError('Please select both start and end dates')
			return
		}
		if (new Date(form.end_date) < new Date(form.start_date)) {
			setError('End date must be after start date')
			return
		}

		// Check if offer price is less than base price
		const selectedProduct = products.find(p => p.id === form.product_id)
		if (selectedProduct && Number(form.offer_price) >= selectedProduct.base_price) {
			setError('Offer price must be less than the product base price')
			return
		}

		// Calculate discount percentage automatically
		const calculatedDiscount = selectedProduct 
			? ((selectedProduct.base_price - Number(form.offer_price)) / selectedProduct.base_price) * 100
			: 0;

		try {
			const res = await fetch('/api/offers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					product_id: form.product_id,
					offer_price: parseFloat(form.offer_price),
					discount_percentage: calculatedDiscount, // Auto-calculated
					start_date: form.start_date,
					end_date: form.end_date,
					is_active: form.is_active,
				}),
			})
			const data = await res.json()
			if (data.offer) {
				setOffers(prev => [data.offer, ...prev])
				setForm(emptyForm)
				setIsCreating(false)
				setError(null)
			} else if (data.error) {
				setError(data.error)
			} else {
				setError('Failed to create offer')
			}
		} catch {
			setError('Failed to create offer')
		}
	}

	function startEditing(offer: Offer) {
		setEditingId(offer.id)
		setEditForm({
			product_id: offer.product_id,
			offer_price: offer.offer_price,
			discount_percentage: offer.discount_percentage,
			start_date: offer.start_date,
			end_date: offer.end_date,
			is_active: offer.is_active,
		})
	}

	function cancelEditing() {
		setEditingId(null)
		setEditForm({})
		setError(null)
	}

	async function updateOffer(id: string) {
		setError(null)
		
		// Validation
		if (editForm.discount_percentage !== undefined && (editForm.discount_percentage < 0 || editForm.discount_percentage > 100)) {
			setError('Discount percentage must be between 0 and 100')
			return
		}
		if (editForm.start_date && editForm.end_date && new Date(editForm.end_date) < new Date(editForm.start_date)) {
			setError('End date must be after start date')
			return
		}

		try {
			const res = await fetch(`/api/offers/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editForm),
			})
			const data = await res.json()
			if (data.offer) {
				setOffers(prev => prev.map(o => (o.id === id ? data.offer : o)))
				setEditingId(null)
				setEditForm({})
				setError(null)
			} else if (data.error) {
				setError(data.error)
			} else {
				setError('Failed to update offer')
			}
		} catch (error) {
			setError('Failed to update offer')
		}
	}

	async function deleteOffer(id: string) {
		if (!id || id === 'undefined') {
			alert('Cannot delete offer: missing offer ID');
			return;
		}
		if (!confirm('Delete this offer?')) return
		try {
			const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' })
			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.error || 'Failed to delete offer')
			}
			setOffers(prev => prev.filter(o => o.id !== id))
		} catch (err) {
			console.error('Delete offer error:', err)
			alert(`Failed to delete offer: ${err instanceof Error ? err.message : 'Unknown error'}`)
		}
	}

	function getOfferStatus(offer: Offer): string {
		const today = new Date().toISOString().split('T')[0]
		if (!offer.is_active) return 'Inactive'
		if (offer.start_date > today) return 'Upcoming'
		if (offer.end_date < today) return 'Expired'
		return 'Active'
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'Active': return 'bg-green-100 text-green-800'
			case 'Expired': return 'bg-gray-100 text-gray-800'
			case 'Upcoming': return 'bg-blue-100 text-blue-800'
			case 'Inactive': return 'bg-red-100 text-red-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50">
			<div className="bg-white border-b border-pink-100 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Manage Offers</h1>
						<p className="text-sm sm:text-base text-gray-600">Create and manage product discounts and special offers</p>
					</div>
					<Button
						onClick={() => {
							setForm(emptyForm)
							setIsCreating(prev => !prev)
						}}
						className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto"
					>
						{isCreating ? <X className="h-4 w-4 mr-2"/> : <Plus className="h-4 w-4 mr-2"/>}
						{isCreating ? 'Cancel' : 'Create Offer'}
					</Button>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
						{error}
					</div>
				)}

				{isCreating && (
					<Card>
						<CardHeader>
							<CardTitle>New Offer</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">Product *</label>
									<select
										name="product_id"
										value={form.product_id}
										onChange={handleChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
									>
										<option value="">Select a product</option>
										{products.map(p => (
											<option key={p.id} value={p.id}>
												{p.name} - KES {p.base_price.toFixed(2)}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">Offer Price (KES) *</label>
									<input
										name="offer_price"
										type="number"
										min={0}
										step={0.01}
										value={form.offer_price}
										onChange={handleChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
									/>
									{form.product_id && (
										<p className="text-xs text-gray-500 mt-1">
											Original: KES {products.find(p => p.id === form.product_id)?.base_price.toFixed(2) || '0.00'}
										</p>
									)}
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">Discount Percentage (Auto-calculated)</label>
									{form.product_id && form.offer_price ? (
										<div className="w-full px-3 py-2 border-2 border-green-300 bg-green-50 rounded-md">
											<span className="text-lg font-bold text-green-700">
												{(() => {
													const product = products.find(p => p.id === form.product_id);
													if (product && Number(form.offer_price) > 0) {
														const discount = ((product.base_price - Number(form.offer_price)) / product.base_price) * 100;
														return `${discount.toFixed(2)}%`;
													}
													return '0%';
												})()}
											</span>
											<p className="text-xs text-gray-600 mt-1">
												Calculated from: KES {products.find(p => p.id === form.product_id)?.base_price.toFixed(2) || '0.00'} → KES {Number(form.offer_price).toFixed(2)}
											</p>
										</div>
									) : (
										<div className="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-500">
											Select a product and enter offer price to see discount
										</div>
									)}
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">Start Date *</label>
									<input
										name="start_date"
										type="date"
										value={form.start_date}
										onChange={handleChange}
										required
										min={new Date().toISOString().split('T')[0]}
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
									/>
									<p className="text-xs text-gray-500 mt-1">Must be today or in the future</p>
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">End Date *</label>
									<input
										name="end_date"
										type="date"
										value={form.end_date}
										onChange={handleChange}
										required
										min={form.start_date || new Date().toISOString().split('T')[0]}
										className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
									/>
									<p className="text-xs text-gray-500 mt-1">Must be after start date</p>
								</div>
								<div className="flex items-center">
									<label className="flex items-center space-x-2 cursor-pointer">
										<input
											name="is_active"
											type="checkbox"
											checked={form.is_active}
											onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
											className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
										/>
										<span className="text-sm font-semibold text-gray-800">Active</span>
									</label>
								</div>
							</div>
							<div className="mt-6">
								<Button onClick={createOffer} className="bg-pink-600 hover:bg-pink-700">
									<Save className="h-4 w-4 mr-2" />
									Create Offer
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{loading ? (
					<div className="text-center py-8 text-gray-600">Loading offers...</div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>All Offers</CardTitle>
						</CardHeader>
						<CardContent>
							{offers.length === 0 ? (
								<div className="text-center py-8 text-gray-600">No offers yet. Create your first offer above.</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b border-gray-200">
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Original Price</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Offer Price</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Discount</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
											</tr>
										</thead>
										<tbody>
											{offers.map((offer) => {
												const isEditing = editingId === offer.id
												const status = getOfferStatus(offer)
												const product = offer.products || products.find(p => p.id === offer.product_id)

												return (
													<tr key={offer.id} className="border-b border-gray-100 hover:bg-gray-50">
														<td className="py-3 px-4">
															{isEditing ? (
																<select
																	value={editForm.product_id || offer.product_id}
																	onChange={(e) => handleEditChange('product_id', e.target.value)}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
																>
																	{products.map(p => (
																		<option key={p.id} value={p.id}>
																			{p.name}
																		</option>
																	))}
																</select>
															) : (
																<div className="font-medium text-gray-900">{product?.name || 'Unknown Product'}</div>
															)}
														</td>
														<td className="py-3 px-4">
															{isEditing ? (
																<input
																	type="number"
																	min={0}
																	step={0.01}
																	value={editForm.offer_price ?? offer.offer_price}
																	onChange={(e) => handleEditChange('offer_price', parseFloat(e.target.value))}
																	className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
																/>
															) : (
																<span className="text-gray-600">KES {product?.base_price.toFixed(2) || '0.00'}</span>
															)}
														</td>
														<td className="py-3 px-4">
															{isEditing ? (
																<div className="text-sm text-gray-600">
																	KES {editForm.offer_price?.toFixed(2) || offer.offer_price.toFixed(2)}
																</div>
															) : (
																<span className="font-semibold text-pink-600">KES {offer.offer_price.toFixed(2)}</span>
															)}
														</td>
														<td className="py-3 px-4">
															{isEditing ? (
																<div className="text-sm">
																	<span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
																		{(() => {
																			const product = products.find(p => p.id === (editForm.product_id || offer.product_id));
																			const offerPrice = editForm.offer_price ?? offer.offer_price;
																			if (product && offerPrice) {
																				const discount = ((product.base_price - offerPrice) / product.base_price) * 100;
																				return `${discount.toFixed(2)}%`;
																			}
																			return `${offer.discount_percentage.toFixed(2)}%`;
																		})()}
																	</span>
																	<p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
																</div>
															) : (
																<span className="text-gray-700 font-semibold">{offer.discount_percentage.toFixed(1)}%</span>
															)}
														</td>
														<td className="py-3 px-4">
															{isEditing ? (
																<div className="space-y-1">
																	<input
																		type="date"
																		value={editForm.start_date || offer.start_date}
																		onChange={(e) => handleEditChange('start_date', e.target.value)}
																		className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
																	/>
																	<input
																		type="date"
																		value={editForm.end_date || offer.end_date}
																		onChange={(e) => handleEditChange('end_date', e.target.value)}
																		className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
																	/>
																</div>
															) : (
																<div className="text-sm text-gray-600">
																	<div>{new Date(offer.start_date).toLocaleDateString()}</div>
																	<div className="text-xs text-gray-400">to</div>
																	<div>{new Date(offer.end_date).toLocaleDateString()}</div>
																</div>
															)}
														</td>
														<td className="py-3 px-4">
															<span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
																{status}
															</span>
														</td>
														<td className="py-3 px-4">
															{isEditing ? (
																<div className="flex space-x-2">
																	<Button
																		onClick={() => updateOffer(offer.id)}
																		size="sm"
																		className="bg-green-600 hover:bg-green-700"
																	>
																		<Save className="h-3 w-3" />
																	</Button>
																	<Button
																		onClick={cancelEditing}
																		size="sm"
																		variant="outline"
																	>
																		<X className="h-3 w-3" />
																	</Button>
																</div>
															) : (
																<div className="flex space-x-2">
																	<Button
																		onClick={() => startEditing(offer)}
																		size="sm"
																		variant="outline"
																	>
																		<Pencil className="h-3 w-3" />
																	</Button>
																	<Button
																		onClick={() => deleteOffer(offer.id)}
																		size="sm"
																		className="bg-red-600 hover:bg-red-700"
																	>
																		<Trash2 className="h-3 w-3" />
																	</Button>
																</div>
															)}
														</td>
													</tr>
												)
											})}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	)
}

