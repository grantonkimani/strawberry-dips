'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onClose?: () => void;
  className?: string;
}

export function SearchBar({ onClose, className = '' }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize search query from URL
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose?.();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.push('/');
    onClose?.();
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full px-4 py-3 pr-20 bg-white rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 border border-gray-200 transition-all duration-200"
        />
        
        {/* Search Icon */}
        <button
          type="submit"
          className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Clear Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Suggestions (Optional) */}
      {isFocused && searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="text-sm text-gray-500 mb-2">Quick searches:</div>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('chocolate covered strawberries');
                  router.push('/?q=chocolate covered strawberries');
                  onClose?.();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Chocolate Covered Strawberries
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('gift baskets');
                  router.push('/?q=gift baskets');
                  onClose?.();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Gift Baskets
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('wine');
                  router.push('/?q=wine');
                  onClose?.();
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded"
              >
                Wine Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
