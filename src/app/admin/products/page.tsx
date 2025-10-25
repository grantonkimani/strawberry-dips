"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Plus, Trash2, Pencil, Save, X } from 'lucide-react'

interface Product {
	id: string
	name: string
	description: string | null
	base_price: number
	category_id: string | null
	image_url: string | null
	image_urls?: string[] | null
	video_url?: string | null
	poster_url?: string | null
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
	base_price: '',
	category_id: '',
	image_url: '',
	image_urls: [] as string[],
	video_url: '',
	poster_url: '',
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
		
		// Listen for category updates from other pages
		const handleStorageChange = (e: StorageEvent) => {
			console.log('Storage event received:', e.key, e.newValue);
			if (e.key === 'categoriesUpdated') {
				console.log('Refreshing categories due to storage event');
				fetchCategories()
			}
		}
		
		// Also listen for custom events (for same-tab updates)
		const handleCustomCategoryUpdate = () => {
			console.log('Custom category update event received');
			fetchCategories()
		}
		
		window.addEventListener('storage', handleStorageChange)
		window.addEventListener('categoryUpdated', handleCustomCategoryUpdate)
		
		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('categoryUpdated', handleCustomCategoryUpdate)
		}
	}, [])

	async function fetchProducts() {
		setLoading(true)
		try {
			const res = await fetch('/api/products', { 
				cache: 'no-store',
				headers: {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'
				}
			})
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
		console.log('Fetching categories...');
		try {
			const res = await fetch('/api/categories', {
				cache: 'no-store',
				headers: {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'
				}
			})
			const data = await res.json()
			console.log('Categories fetched:', data.categories?.length || 0, 'categories');
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
			[name]: type === 'checkbox' ? checked : name === 'base_price' ? (value === '' ? '' : Number(value)) : value,
		}))
	}

	async function handleUploadForCreate(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return
		setIsUploadingCreate(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/uploads/product-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setForm(prev => ({ ...prev, image_url: data.url, image_urls: prev.image_urls?.length ? prev.image_urls : [data.url] }))
		} catch (err) {
			setError('Failed to upload image. Please try again.')
		} finally {
			setIsUploadingCreate(false)
		}
	}

	async function handleMultiUploadForCreate(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files || [])
		if (!files.length) return
		setIsUploadingCreate(true)
		try {
			const newUrls: string[] = []
			for (const file of files) {
				const fd = new FormData()
				fd.append('file', file)
				const res = await fetch('/api/uploads/product-image', { method: 'POST', body: fd })
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || 'Upload failed')
				newUrls.push(data.url)
			}
			setForm(prev => {
				const existing = prev.image_urls || []
				const merged = [...existing, ...newUrls]
				const dedup = merged.filter((u, i, arr) => u && arr.indexOf(u) === i).slice(0, 3)
				return { ...prev, image_urls: dedup, image_url: dedup[0] || prev.image_url }
			})
		} catch (err) {
			setError('Failed to upload images. Please try again.')
		} finally {
			setIsUploadingCreate(false)
		}
	}

	async function handleUploadForEdit(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0]
		if (!file) return
		setIsUploadingEdit(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/uploads/product-image', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setEditForm(prev => ({ ...prev, image_url: data.url, image_urls: (prev.image_urls as string[] | undefined)?.length ? prev.image_urls : [data.url] }))
		} catch (err) {
			setError('Failed to upload image. Please try again.')
		} finally {
			setIsUploadingEdit(false)
		}
	}

	async function handleMultiUploadForEdit(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files || [])
		if (!files.length) return
		setIsUploadingEdit(true)
		try {
			const newUrls: string[] = []
			for (const file of files) {
				const fd = new FormData()
				fd.append('file', file)
				const res = await fetch('/api/uploads/product-image', { method: 'POST', body: fd })
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || 'Upload failed')
				newUrls.push(data.url)
			}
			setEditForm(prev => {
				const existing = (prev.image_urls as string[] | undefined) || []
				const merged = [...existing, ...newUrls]
				const dedup = merged.filter((u, i, arr) => u && arr.indexOf(u) === i).slice(0, 3)
				return { ...prev, image_urls: dedup, image_url: dedup[0] || (prev.image_url as string | undefined) || null }
			})
		} catch (err) {
			setError('Failed to upload images. Please try again.')
		} finally {
			setIsUploadingEdit(false)
		}
	}

	function removeCreateImage(index: number) {
		setForm(prev => {
			const list = [...(prev.image_urls || [])]
			list.splice(index, 1)
			return { ...prev, image_urls: list, image_url: list[0] || '' }
		})
	}

	function moveCreateImage(index: number, dir: -1 | 1) {
		setForm(prev => {
			const list = [...(prev.image_urls || [])]
			const j = index + dir
			if (j < 0 || j >= list.length) return prev
			;[list[index], list[j]] = [list[j], list[index]]
			return { ...prev, image_urls: list, image_url: list[0] || prev.image_url }
		})
	}

	function removeEditImage(index: number) {
		setEditForm(prev => {
			const current = (prev.image_urls as string[] | undefined) || []
			const list = [...current]
			list.splice(index, 1)
			return { ...prev, image_urls: list, image_url: list[0] || (prev.image_url as string | undefined) || null }
		})
	}

	function moveEditImage(index: number, dir: -1 | 1) {
		setEditForm(prev => {
			const current = (prev.image_urls as string[] | undefined) || []
			const list = [...current]
			const j = index + dir
			if (j < 0 || j >= list.length) return prev
			;[list[index], list[j]] = [list[j], list[index]]
			return { ...prev, image_urls: list, image_url: list[0] || (prev.image_url as string | undefined) || null }
		})
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
		if (!form.base_price || Number(form.base_price) <= 0) {
			setError('Base price must be greater than 0')
			return
		}

		try {
			// Normalize URLs to public paths if needed
			const normalizedForm = {
				...form,
				image_url: normalizePublicUrl(form.image_url),
				image_urls: (form.image_urls || []).map(u => normalizePublicUrl(u)),
				poster_url: normalizePublicUrl(form.poster_url),
				video_url: form.video_url
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
			image_urls: product.image_urls || (product.image_url ? [product.image_url] : []),
			video_url: product.video_url || null,
			poster_url: product.poster_url || null,
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
			// Normalize URLs to public paths if needed
			const normalizedEdit = {
				...editForm,
				image_url: normalizePublicUrl(editForm.image_url || ''),
				image_urls: (editForm.image_urls as string[] | undefined)?.map(u => normalizePublicUrl(u)) || undefined,
				poster_url: normalizePublicUrl(editForm.poster_url || ''),
				video_url: editForm.video_url
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
			const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to delete product')
			}
		// Update the UI immediately - optimistic update
		setProducts(prev => prev.filter(p => p.id !== id))
		// No need to refetch - optimistic update handles it
		} catch (error) {
			console.error('Delete product error:', error)
			alert(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}


	return (
		<div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-50">
			<div className="bg-white border-b border-pink-100 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Manage Products</h1>
						<p className="text-gray-600">Add, edit, or remove items for sale</p>
					</div>
					<div className="flex gap-2">
						<Button onClick={fetchCategories} variant="outline" className="text-sm">
							🔄 Refresh Categories
						</Button>
						<Button onClick={() => {
							setForm(emptyForm);
							setIsCreating(prev => !prev);
						}} className="bg-pink-600 hover:bg-pink-700">
							{isCreating ? <X className="h-4 w-4 mr-2"/> : <Plus className="h-4 w-4 mr-2"/>}
							{isCreating ? 'Cancel' : 'Add Product'}
						</Button>
					</div>
				</div>
			</div>

			{/* Navigation */}
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
									<input name="base_price" type="number" min={0} step={0.01} value={form.base_price === '0' ? '' : form.base_price || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
								</div>
								<div>
						<label className="block text-sm font-semibold text-gray-800 mb-1">Images (up to 3)</label>
									<div className="space-y-2">
							<input name="image_url" value={form.image_url} onChange={handleChange} placeholder="Cover image URL (optional if you upload)" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
							<div className="flex items-center space-x-3">
								<label className="inline-block">
									<span className="sr-only">Upload images</span>
									<input type="file" accept="image/*" multiple onChange={handleMultiUploadForCreate} className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
								</label>
								{isUploadingCreate && <span className="text-sm text-gray-600">Uploading...</span>}
							</div>
							{(form.image_urls || []).length > 0 && (
								<div className="flex flex-wrap gap-2">
								{(form.image_urls || []).map((url, i) => (
										<div key={url + i} className="relative">
											<img src={url} alt={`Image ${i+1}`} className="h-20 w-28 object-cover rounded border" loading="lazy" width={112} height={80} />
											<div className="absolute -top-2 -right-2 flex space-x-1">
												<Button size="sm" variant="outline" onClick={() => moveCreateImage(i, -1)} disabled={i===0}>↑</Button>
												<Button size="sm" variant="outline" onClick={() => moveCreateImage(i, 1)} disabled={i===(form.image_urls!.length-1)}>↓</Button>
												<Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => removeCreateImage(i)}>X</Button>
											</div>
										</div>
									))}
								</div>
							)}
									</div>
								</div>
				<div>
					<label className="block text-sm font-semibold text-gray-800 mb-1">Product Video (MP4/WebM)</label>
					<input name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://... (optional if you upload)" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 mb-2" />
					<div className="flex items-center space-x-3 mb-2">
						<label className="inline-block">
							<span className="sr-only">Upload video</span>
							<input type="file" accept="video/mp4,video/webm" onChange={async (e) => {
								const file = e.target.files?.[0]
								if (!file) return
								setIsUploadingCreate(true)
								try {
									const fd = new FormData()
									fd.append('file', file)
									const res = await fetch('/api/uploads/product-video', { method: 'POST', body: fd })
									const data = await res.json()
									if (!res.ok) throw new Error(data.error || 'Upload failed')
									setForm(prev => ({ ...prev, video_url: data.url }))
								} catch {
									setError('Failed to upload video. Please try again.')
								} finally {
									setIsUploadingCreate(false)
								}
							}} className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
						</label>
						{isUploadingCreate && <span className="text-sm text-gray-600">Uploading...</span>}
					</div>
					<label className="block text-sm font-semibold text-gray-800 mb-1">Video Poster (optional)</label>
					<input name="poster_url" value={form.poster_url} onChange={handleChange} placeholder="https://... (optional if you upload)" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500" />
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
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" width={640} height={160} />
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
							<input type="file" accept="image/*" multiple onChange={handleMultiUploadForEdit} className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
											{isUploadingEdit && <span className="text-sm text-gray-600">Uploading...</span>}
										</div>
						{((editForm.image_urls as string[] | undefined) || []).length > 0 && (
							<div className="flex flex-wrap gap-2">
								{((editForm.image_urls as string[] | undefined) || []).map((url, i, arr) => (
									<div key={url + i} className="relative">
										<img src={url} alt={`Image ${i+1}`} className="h-20 w-28 object-cover rounded border" loading="lazy" width={112} height={80} />
										<div className="absolute -top-2 -right-2 flex space-x-1">
											<Button size="sm" variant="outline" onClick={() => moveEditImage(i, -1)} disabled={i===0}>↑</Button>
											<Button size="sm" variant="outline" onClick={() => moveEditImage(i, 1)} disabled={i===(arr.length-1)}>↓</Button>
											<Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => removeEditImage(i)}>X</Button>
										</div>
									</div>
								))}
							</div>
						)}
								<label className="block text-sm font-semibold text-gray-800 mb-1 mt-2">Product Video (MP4/WebM)</label>
								<input 
									value={editForm.video_url || ''} 
									onChange={e => handleEditChange('video_url', e.target.value)} 
									placeholder="https://... (optional if you upload)"
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 mb-2" 
								/>
								<div className="flex items-center space-x-3 mb-2">
									<input type="file" accept="video/mp4,video/webm" onChange={async (e) => {
										const file = e.target.files?.[0]
										if (!file) return
										setIsUploadingEdit(true)
										try {
											const fd = new FormData()
											fd.append('file', file)
											const res = await fetch('/api/uploads/product-video', { method: 'POST', body: fd })
											const data = await res.json()
											if (!res.ok) throw new Error(data.error || 'Upload failed')
											handleEditChange('video_url', data.url)
										} catch {
											setError('Failed to upload video. Please try again.')
										} finally {
											setIsUploadingEdit(false)
										}
									}} className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
								</div>
								<label className="block text-sm font-semibold text-gray-800 mb-1">Video Poster (optional)</label>
								<input 
									value={editForm.poster_url || ''} 
									onChange={e => handleEditChange('poster_url', e.target.value)} 
									placeholder="https://... (optional if you upload)"
									className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 mb-2" 
								/>
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
															value={editForm.base_price === '0' ? '' : editForm.base_price || ''} 
															onChange={e => handleEditChange('base_price', e.target.value === '' ? '' : Number(e.target.value))} 
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
