'use client';

import { useState, useRef } from 'react';

interface UploadResult {
  url: string;
  path: string;
}

export default function CustomRequestForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [occasion, setOccasion] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleUpload(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/uploads/product-image', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Upload failed');
    return data as UploadResult;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !phone || !description) {
      setError('Please fill in your name, email, phone, and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploaded: UploadResult[] = [];
      for (const f of files.slice(0, 3)) {
        // Limit to 3 images
        const result = await handleUpload(f);
        uploaded.push(result);
      }

      const res = await fetch('/api/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          occasion,
          event_date: eventDate || null,
          area,
          budget: budget || null,
          description,
          image_urls: uploaded.map(u => u.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to submit request');

      setSuccess('Request submitted! We will contact you shortly.');
      setName('');
      setEmail('');
      setPhone('');
      setOccasion('');
      setEventDate('');
      setArea('');
      setBudget('');
      setDescription('');
      setFiles([]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="07xx xxx xxx"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Occasion</label>
          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="Birthday, Anniversary, Corporate, ..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Event date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery area / pickup</label>
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="e.g., Nairobi CBD, Westlands, Pickup"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Budget (optional)</label>
          <input
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            placeholder="e.g., 2500–5000 KES or max 4000 KES"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Describe what you want</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Flavors, quantity, design notes..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reference images (up to 3)</label>
        <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-pink-400 transition-colors">
          <div className="px-4 py-6 text-center">
            <svg className="mx-auto h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4v8z" />
            </svg>
            <p className="mt-3 text-sm text-gray-700">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-pink-600 hover:text-pink-700"
              >
                Click to upload
              </button>
              <span className="text-gray-500"> or drag and drop</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">JPG/PNG, up to 5MB each.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const list = Array.from(e.target.files || []);
                setFiles(list.slice(0, 3));
              }}
              className="sr-only"
              aria-label="Upload reference images"
            />
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-2">Selected ({files.length}/3)</div>
            <div className="grid grid-cols-3 gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-pink-600 px-6 py-3 text-white font-semibold shadow hover:bg-pink-700 transition-colors disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}


