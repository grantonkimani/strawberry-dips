export default function AdminTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Test Page</h1>
      <p className="text-gray-600">This is a test page to check if admin routes are working.</p>
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Status</h2>
        <p className="text-green-600">✅ Admin routes are accessible</p>
        <p className="text-blue-600">ℹ️ This page bypasses authentication for testing</p>
      </div>
    </div>
  );
}
