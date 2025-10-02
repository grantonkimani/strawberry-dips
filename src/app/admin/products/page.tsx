"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AdminNav } from '@/components/AdminNav'
import { Plus, Trash2, Pencil, Save, X } from 'lucide-react'

interface Product {
	id: string
	name: string
	description: string | null
	base_price: number
	category_id: string | null
	image_url: string | null
	is_available: boolean
	created_at: string
	categories?: {
		id: string
		name: string
		description?: string
		display_order: number
	}
	// Legacy support
	category?: string
}

interface Category {
	id: string
	name: string
	description: string | null
	display_order: number
	is_active: boolean
}

const emptyForm = {
	name: '',
	description: '',
	base_price: 0,
	category_id: '',
	image_url: '',
	is_available: true,
}

export default function AdminProductsPage() {
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<Category[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)
	const [form, setForm] = useState<typeof emptyForm>(emptyForm)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [editForm, setEditForm] = useState<Partial<Product>>({})
const [isUploadingCreate, setIsUploadingCreate] = useState(false)
const [isUploadingEdit, setIsUploadingEdit] = useState(false)
const [originalEditImageUrl, setOriginalEditImageUrl] = useState<string | null>(null)

	useEffect(() => {
		fetchProducts()
		fetchCategories()
	}, [])

	async function fetchProducts() {
		setLoading(true)
		try {
			const res = await fetch('/api/products')
			const data = await res.json()
			if (Array.isArray(data)) setProducts(data)
			else if (data.products) setProducts(data.products)
			else setError(data.error || 'Failed to fetch products')
		} catch (e) {
			setError('Failed to fetch products')
		} finally {
			setLoading(false)
		}
	}

	async function fetchCategories() {
		try {
			const res = await fetch('/api/categories')
			const data = await res.json()
			if (data.categories) {
				setCategories(data.categories)
			}
		} catch (e) {
			console.error('Failed to fetch categories:', e)
		}
	}

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) {
		const { name, value, type } = e.target
		const checked = 'checked' in e.target ? e.target.checked : false
		setForm(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : name === 'base_price' ? Number(value) : value,
		}))
	}

	async function handleUploadForCreate(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return
		setIsUploadingCreate(true)
		try {
			const ext = file.name.split('.').pop() || 'jpg'
			// Path is relative to the bucket; no bucket prefix
			const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
			const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
				upsert: true,
				contentType: file.type || 'image/jpeg'
			})
			if (uploadError) throw uploadError
			const { data } = supabase.storage.from('product-images').getPublicUrl(path)
			setForm(prev => ({ ...prev, image_url: data.publicUrl }))
		} catch (err) {
			setError('Failed to upload image. Please try again.')
		} finally {
			setIsUploadingCreate(false)
		}
	}

	async function handleUploadForEdit(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return
		setIsUploadingEdit(true)
		try {
			const ext = file.name.split('.').pop() || 'jpg'
			// Path is relative to the bucket; no bucket prefix
			const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
			const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
				upsert: true,
				contentType: file.type || 'image/jpeg'
			})
			if (uploadError) throw uploadError
			const { data } = supabase.storage.from('product-images').getPublicUrl(path)
			setEditForm(prev => ({ ...prev, image_url: data.publicUrl }))
		} catch (err) {
			setError('Failed to upload image. Please try again.')
		} finally {
			setIsUploadingEdit(false)
		}
	}

	async function createProduct() {
		// Clear any previous errors
		setError(null)
		if (isUploadingCreate) {
			setError('Please wait for the image upload to finish before saving.')
			return
		}
		
		// Validate required fields
		if (!form.name.trim()) {
			setError('Product name is required')
			return
		}
		if (!form.category_id) {
			setError('Please select a category')
			return
		}
		if (form.base_price <= 0) {
			setError('Base price must be greater than 0')
			return
		}

		try {
			// Normalize image_url to public URL if needed
			const normalizedForm = {
				...form,
				image_url: normalizePublicUrl(form.image_url)
			}
			const res = await fetch('/api/products', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(normalizedForm),
			})
			const data = await res.json()
			if (data.product) {
				setProducts(prev => [data.product, ...prev])
				setForm(emptyForm)
				setIsCreating(false)
			} else if (data.error) {
				setError(data.error)
			} else {
				setError('Failed to create product')
			}
		} catch (error) {
			setError('Failed to create product')
		}
	}

	function startEditing(product: Product) {
		setEditingId(product.id)
		setEditForm({
			name: product.name,
			description: product.description,
			base_price: product.base_price,
			category_id: product.category_id,
			image_url: product.image_url,
			is_available: product.is_available
		})
    setOriginalEditImageUrl(product.image_url || null)
	}

	function cancelEditing() {
		setEditingId(null)
		setEditForm({})
		setError(null)
	}

	function handleEditChange(field: keyof Product, value: any) {
		setEditForm(prev => ({
			...prev,
			[field]: value
		}))
	}

	async function updateProduct(id: string) {
		// Clear any previous errors
		setError(null)
		if (isUploadingEdit) {
			setError('Please wait for the image upload to finish before saving.')
			return
		}
		
		// Validate required fields
		if (!editForm.name?.trim()) {
			setError('Product name is required')
			return
		}
		if (!editForm.category_id) {
			setError('Please select a category')
			return
		}
		if (!editForm.base_price || editForm.base_price <= 0) {
			setError('Base price must be greater than 0')
			return
		}

		try {
			// Normalize image_url to public URL if needed
			const normalizedEdit = {
				...editForm,
				image_url: normalizePublicUrl(editForm.image_url || '')
			}
			const res = await fetch(`/api/products/${id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(normalizedEdit),
			})
			const data = await res.json()
      if (data.product) {
				setProducts(prev => prev.map(p => (p.id === id ? data.product : p)))
				setEditingId(null)
				setEditForm({})
				setError(null)
        if (originalEditImageUrl && originalEditImageUrl !== data.product.image_url) {
          const oldPath = getStoragePathFromPublicUrl(originalEditImageUrl)
          if (oldPath) {
            try { await supabase.storage.from('product-images').remove([oldPath]) } catch {}
          }
        }
        setOriginalEditImageUrl(null)
			} else if (data.error) {
				setError(data.error)
			} else {
				setError('Failed to update product')
			}
		} catch (error) {
			setError('Failed to update product')
		}
	}

	async function deleteProduct(id: string) {
		if (!confirm('Delete this product?')) return
		try {
			await fetch(`/api/products/${id}`, { method: 'DELETE' })
			setProducts(prev => prev.filter(p => p.id !== id))
		} catch {}
	}


	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50">
			<div className="bg-white border-b border-pink-100 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Manage Products</h1>
						<p className="text-gray-600">Add, edit, or remove items for sale</p>
					</div>
					<Button onClick={() => setIsCreating(prev => !prev)} className="bg-pink-600 hover:bg-pink-700">
						{isCreating ? <X className="h-4 w-4 mr-2"/> : <Plus className="h-4 w-4 mr-2"/>}
						{isCreating ? 'Cancel' : 'Add Product'}
					</Button>
				</div>
			</div>

			{/* Navigation */}
			<AdminNav />

			<div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
						{error}
					</div>
				)}
				
				{isCreating && (
					<Card>
						<CardHeader>
							<CardTitle>New Product</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">Name *</label>
									<input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">Category *</label>
									<select name="category_id" value={form.category_id} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500">
										<option value="">Select a category</option>
										{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
									</select>
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">Base Price *</label>
									<input name="base_price" type="number" min={0} step={0.01} value={form.base_price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-800 mb-1">Image</label>
									<div className="space-y-2">
										<input name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://... (optional if you upload)" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
										<div className="flex items-center space-x-3">
											<label className="inline-block">
												<span className="sr-only">Upload image</span>
												<input type="file" accept="image/*" onChange={handleUploadForCreate} className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
											</label>
											{isUploadingCreate && <span className="text-sm text-gray-600">Uploading...</span>}
										</div>
										{form.image_url && (
											<img src={form.image_url} alt="Preview" className="h-24 rounded border" />
										)}
									</div>
								</div>
								<div className="md:col-span-2">
									<label className="block text-sm font-semibold text-gray-800 mb-1">Description</label>
									<textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
								</div>
								<div className="flex items-center space-x-2 md:col-span-2">
									<input id="avail" name="is_available" type="checkbox" checked={form.is_available} onChange={handleChange} className="text-pink-600 focus:ring-pink-500" />
									<label htmlFor="avail" className="text-sm font-semibold text-gray-800">Available</label>
								</div>
							</div>
							<div className="mt-4 flex justify-end">
								<Button onClick={createProduct} disabled={isUploadingCreate} className="bg-pink-600 hover:bg-pink-700 disabled:opacity-60 disabled:cursor-not-allowed">
									<Save className="h-4 w-4 mr-2" /> Save Product
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Products</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="text-center py-8 text-gray-600">Loading...</div>
						) : products.length === 0 ? (
							<div className="text-center py-8 text-gray-600">No products found.</div>
						) : (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								{products.map(p => (
									<div key={p.id} className="border rounded-lg overflow-hidden bg-white">
										<div className="h-40 bg-gray-100 flex items-center justify-center">
											{p.image_url ? (
												<img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
											) : (
												<span className="text-3xl">🍓</span>
											)}
										</div>
										<div className="p-4 space-y-2">
											{editingId === p.id ? (
												<div className="space-y-2">
													<input 
														value={editForm.name || ''} 
														onChange={e => handleEditChange('name', e.target.value)} 
														placeholder="Product name"
														className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" 
													/>
										<label className="block text-sm font-semibold text-gray-800 mb-1">Image</label>
										<input 
											value={editForm.image_url || ''} 
											onChange={e => handleEditChange('image_url', e.target.value)} 
											placeholder="https://... (optional if you upload)"
											className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 mb-2" 
										/>
										<div className="flex items-center space-x-3 mb-2">
											<input type="file" accept="image/*" onChange={handleUploadForEdit} className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
											{isUploadingEdit && <span className="text-sm text-gray-600">Uploading...</span>}
										</div>
										{editForm.image_url && (
											<img src={editForm.image_url} alt="Preview" className="h-24 rounded border" />
										)}
													<textarea 
														value={editForm.description || ''} 
														onChange={e => handleEditChange('description', e.target.value)} 
														placeholder="Product description"
														className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" 
														rows={2} 
													/>
													<div className="grid grid-cols-2 gap-2">
														<select 
															value={editForm.category_id || ''} 
															onChange={e => handleEditChange('category_id', e.target.value)} 
															className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
														>
															<option value="">Select category</option>
															{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
														</select>
														<input 
															type="number" 
															step={0.01} 
															min={0} 
															value={editForm.base_price || 0} 
															onChange={e => handleEditChange('base_price', Number(e.target.value))} 
															className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" 
														/>
													</div>
													<div className="flex items-center space-x-2">
														<input 
															type="checkbox" 
															checked={editForm.is_available ?? true} 
															onChange={e => handleEditChange('is_available', e.target.checked)} 
															className="text-pink-600 focus:ring-pink-500" 
														/>
														<span className="text-sm text-gray-700">Available</span>
													</div>
													<div className="flex justify-end space-x-2">
														<Button onClick={cancelEditing} variant="outline"><X className="h-4 w-4 mr-2"/>Cancel</Button>
														<Button onClick={() => updateProduct(p.id)} className="bg-pink-600 hover:bg-pink-700"><Save className="h-4 w-4 mr-2"/>Save</Button>
													</div>
												</div>
											) : (
												<>
													<div className="flex items-start justify-between">
														<div>
															<h3 className="font-semibold text-gray-900">{p.name}</h3>
															<p className="text-sm text-gray-500">{p.categories?.name || p.category || 'No category'}</p>
														</div>
														<div className="text-right">
															<p className="font-semibold">KSH {p.base_price.toFixed(2)}</p>
															<p className={`text-xs ${p.is_available ? 'text-green-600' : 'text-red-600'}`}>{p.is_available ? 'Available' : 'Unavailable'}</p>
														</div>
													</div>
													<p className="text-sm text-gray-700 line-clamp-3">{p.description}</p>
													<div className="flex justify-end space-x-2">
														<Button variant="outline" onClick={() => startEditing(p)}><Pencil className="h-4 w-4 mr-2"/>Edit</Button>
														<Button variant="outline" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4 mr-2"/>Delete</Button>
													</div>
												</>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

function getStoragePathFromPublicUrl(url?: string | null): string | null {
  if (!url) return null
  const marker = '/object/public/product-images/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.substring(idx + marker.length)
}

function normalizePublicUrl(url?: string | null): string {
  if (!url) return ''
  // If already has /object/public/, return as is
  if (url.includes('/object/public/product-images/')) return url
  // If it has /object/product-images/, convert to public path
  const marker = '/storage/v1/object/product-images/'
  if (url.includes(marker)) {
    return url.replace('/storage/v1/object/product-images/', '/storage/v1/object/public/product-images/')
  }
  return url
}
