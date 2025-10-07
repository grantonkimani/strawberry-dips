'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

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

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/banners/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) });
    load();
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
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Banners</h1>

      {/* Create form */}
      <div className="grid gap-3 rounded-lg border p-4 bg-white">
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="border p-2 rounded" placeholder="Image URL (e.g., /uploads/hero-2.webp)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Alt text" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Subtext" value={form.subtext} onChange={(e) => setForm({ ...form, subtext: e.target.value })} />
          <input className="border p-2 rounded" placeholder="CTA label" value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} />
          <input className="border p-2 rounded" placeholder="CTA href (e.g., /menu)" value={form.cta_href} onChange={(e) => setForm({ ...form, cta_href: e.target.value })} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Overlay</label>
          <input type="range" min={0} max={1} step={0.05} value={form.overlay} onChange={(e) => setForm({ ...form, overlay: Number(e.target.value) })} />
          <span className="text-sm text-gray-700">{form.overlay?.toFixed(2)}</span>
          <label className="ml-4 text-sm text-gray-600">Active</label>
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <Button onClick={create} className="ml-auto">Add banner</Button>
        </div>
      </div>

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : banners.length === 0 ? (
          <div className="text-gray-600">No banners yet.</div>
        ) : (
          <div className="space-y-3">
            {banners.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 border rounded p-3 bg-white">
                <img src={b.image_url} alt={b.alt || ''} className="h-14 w-24 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{b.headline || '(no headline)'}</div>
                  <div className="text-xs text-gray-600">{b.image_url}</div>
                </div>
                <label className="text-sm mr-2">Active</label>
                <input type="checkbox" checked={!!b.active} onChange={(e) => toggleActive(b.id!, e.target.checked)} />
                <div className="flex items-center gap-2 ml-3">
                  <Button size="sm" onClick={() => move(i, -1)} className="px-2">↑</Button>
                  <Button size="sm" onClick={() => move(i, 1)} className="px-2">↓</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


