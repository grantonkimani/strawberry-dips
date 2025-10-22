'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

interface Banner {
  id?: string;
  image_url: string;
  alt?: string;
  headline?: string;
  subtext?: string;
  cta_label?: string;
  cta_href?: string;
  overlay?: number;
  display_order?: number;
  active?: boolean;
}

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Banner>({ image_url: '', headline: '', subtext: '', alt: '', cta_label: '', cta_href: '', overlay: 0.55, active: true });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners');
      const json = await res.json();
      setBanners(json.banners || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const res = await fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, display_order: banners.length }) });
    const json = await res.json();
    if (!json.error) {
      setForm({ image_url: '', headline: '', subtext: '', alt: '', cta_label: '', cta_href: '', overlay: 0.55, active: true });
      load();
    } else {
      alert(json.error);
    }
  };

  const onUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/banners/upload', { method: 'POST', body: formData });
    const json = await res.json();
    if (json?.url) setForm((f) => ({ ...f, image_url: json.url }));
    else alert(json.error || 'Upload failed');
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/banners/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
    load();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.error) {
        load(); // Reload the list
      } else {
        alert(`Failed to delete banner: ${json.error}`);
      }
    } catch (error) {
      console.error('Delete banner error:', error);
      alert('Failed to delete banner. Please try again.');
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const next = [...banners];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx].display_order, next[j].display_order] = [next[j].display_order || idx, next[idx].display_order || j];
    [next[idx], next[j]] = [next[j], next[idx]];
    setBanners(next);
    // Persist orders
    await Promise.all(next.map((b, i) => fetch(`/api/banners/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ display_order: i }) })));
    load();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Banners</h1>

      {/* Create form */}
      <div className="space-y-4 rounded-lg border p-4 sm:p-6 bg-white">
        {/* Image Upload Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              className="flex-1 border border-gray-300 p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" 
              placeholder="Image URL (or upload below)" 
              value={form.image_url} 
              onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
            />
            <label className="inline-flex items-center justify-center px-4 py-3 rounded-md bg-pink-600 text-white text-sm font-medium cursor-pointer hover:bg-pink-700 transition-colors min-w-[100px]">
              Upload
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && onUpload(e.target.files[0])} />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input 
            className="w-full border border-gray-300 p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" 
            placeholder="Alt text" 
            value={form.alt} 
            onChange={(e) => setForm({ ...form, alt: e.target.value })} 
          />
          <input 
            className="w-full border border-gray-300 p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" 
            placeholder="Headline" 
            value={form.headline} 
            onChange={(e) => setForm({ ...form, headline: e.target.value })} 
          />
          <input 
            className="w-full border border-gray-300 p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" 
            placeholder="Subtext" 
            value={form.subtext} 
            onChange={(e) => setForm({ ...form, subtext: e.target.value })} 
          />
          <input 
            className="w-full border border-gray-300 p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" 
            placeholder="CTA label" 
            value={form.cta_label} 
            onChange={(e) => setForm({ ...form, cta_label: e.target.value })} 
          />
          <input 
            className="w-full sm:col-span-2 border border-gray-300 p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500" 
            placeholder="CTA href (e.g., /menu)" 
            value={form.cta_href} 
            onChange={(e) => setForm({ ...form, cta_href: e.target.value })} 
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Overlay Control */}
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 min-w-[60px]">Overlay</label>
            <input 
              type="range" 
              min={0} 
              max={1} 
              step={0.05} 
              value={form.overlay} 
              onChange={(e) => setForm({ ...form, overlay: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm text-gray-700 min-w-[40px]">{form.overlay?.toFixed(2)}</span>
          </div>
          
          {/* Active Toggle and Submit */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input 
                type="checkbox" 
                checked={form.active} 
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded"
              />
              Active
            </label>
            <Button 
              onClick={create} 
              className="w-full sm:w-auto sm:ml-auto px-6 py-2"
            >
              Add Banner
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-600 bg-white rounded-lg border">
            No banners yet. Create your first banner above.
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((b, i) => (
              <div key={b.id} className="bg-white border rounded-lg p-4 space-y-4 sm:space-y-0">
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-3">
                  <img 
                    src={b.image_url} 
                    alt={b.alt || ''} 
                    className="w-full h-32 object-cover rounded-md" 
                    loading="lazy" 
                  />
                  <div>
                    <div className="font-medium text-gray-900">{b.headline || '(no headline)'}</div>
                    <div className="text-sm text-gray-600 mt-1">{b.subtext || '(no subtext)'}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">{b.image_url}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input 
                        type="checkbox" 
                        checked={!!b.active} 
                        onChange={(e) => toggleActive(b.id!, e.target.checked)}
                        className="rounded"
                      />
                      Active
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === banners.length - 1}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteBanner(b.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex sm:items-center gap-4">
                  <img 
                    src={b.image_url} 
                    alt={b.alt || ''} 
                    className="h-16 w-28 object-cover rounded" 
                    loading="lazy" 
                    width={112} 
                    height={64} 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{b.headline || '(no headline)'}</div>
                    <div className="text-sm text-gray-600 truncate">{b.subtext || '(no subtext)'}</div>
                    <div className="text-xs text-gray-500 truncate">{b.image_url}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input 
                        type="checkbox" 
                        checked={!!b.active} 
                        onChange={(e) => toggleActive(b.id!, e.target.checked)}
                        className="rounded"
                      />
                      Active
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === banners.length - 1}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => deleteBanner(b.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete banner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


