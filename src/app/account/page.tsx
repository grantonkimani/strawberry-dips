import { Header } from "@/components/Header";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Account</h1>
          <p className="text-xl text-gray-600">Manage your account and orders</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-6">
            Sign in to view your orders, manage your account, and enjoy a personalized shopping experience.
          </p>
          <div className="space-y-3">
            <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
              Sign In
            </button>
            <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors">
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



















