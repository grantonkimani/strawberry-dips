'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X } from 'lucide-react';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const content = (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[9998]"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-sm bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <h2 className="text-lg font-bold text-gray-900">Help & Info</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-2">
          <Link href="/support" onClick={onClose} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-600">Support</Link>
          <Link href="/policies/delivery" onClick={onClose} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-600">Delivery Info</Link>
          <Link href="/policies/returns" onClick={onClose} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-600">Returns & Refunds</Link>
          <Link href="/policies/privacy" onClick={onClose} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-600">Privacy Policy</Link>
          <Link href="/policies/terms" onClick={onClose} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-600">Terms of Service</Link>
          <Link href="/contact" onClick={onClose} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-pink-50 hover:text-pink-600">Contact</Link>
        </nav>
      </div>
    </>
  );

  return createPortal(content, document.body);
}


