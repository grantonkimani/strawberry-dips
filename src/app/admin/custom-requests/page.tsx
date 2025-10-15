import Link from 'next/link';
import { revalidatePath } from 'next/cache';

interface CustomRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  occasion: string | null;
  event_date: string | null;
  area: string | null;
  budget: string | null;
  description: string;
  image_urls: string[] | null;
  status: string;
  created_at: string;
}

async function fetchRequests(): Promise<CustomRequest[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  const url = base ? `${base}/api/custom` : `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/custom`;
  const res = await fetch(url || '/api/custom', { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.requests || [];
}

async function deleteRequest(id: string) {
  'use server'
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const url = `${base}/api/custom/${id}`;
  await fetch(url, { method: 'DELETE', cache: 'no-store' });
  revalidatePath('/admin/custom-requests');
}

export default async function AdminCustomRequestsPage() {
  const requests = await fetchRequests();

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Custom Requests</h1>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-lg border border-gray-200 p-6 text-gray-600">
            No custom requests yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Occasion</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Event Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Area</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-pink-50/40">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">{r.customer_name}</div>
                      <div className="text-gray-600">{r.customer_email}</div>
                      {r.customer_phone && <div className="text-gray-600">{r.customer_phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 hidden lg:table-cell">{r.occasion || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell">{r.event_date || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell">{r.area || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 hidden lg:table-cell">{r.budget || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-sm">
                      <form action={async () => {
                        'use server'
                        await deleteRequest(r.id);
                      }}>
                        <button type="submit" className="text-red-600 hover:text-red-700 font-medium">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}


