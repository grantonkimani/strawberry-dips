'use client';

import Link from "next/link";
import { Phone, Mail, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-pink-50 text-gray-800 border-t border-slate-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-pink-600">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-pink-600" />
                <Link href="tel:0757567614" className="text-gray-800 hover:text-pink-700 transition-colors text-sm font-medium">
                  0757567614
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-pink-600" />
                <Link href="mailto:Strawberrydips.ke@gmail.com" className="text-gray-800 hover:text-pink-700 transition-colors text-sm font-medium">
                  Strawberrydips.ke@gmail.com
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-pink-600" />
                <span className="text-gray-800 text-sm">Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-pink-600">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/about" className="text-gray-800 hover:text-pink-700 transition-colors text-sm font-medium">About Us</Link>
              <Link href="/support" className="text-gray-800 hover:text-pink-700 transition-colors text-sm font-medium">Support</Link>
              <Link href="/policies/privacy" className="text-gray-800 hover:text-pink-700 transition-colors text-sm font-medium">Privacy Policy</Link>
              <Link href="/policies/terms" className="text-gray-800 hover:text-pink-700 transition-colors text-sm font-medium">Terms of Service</Link>
              <Link href="/policies/delivery" className="text-gray-800 hover:text-pink-700 transition-colors text-sm font-medium">Delivery Info</Link>
            </div>
          </div>

          {/* Brand */}
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end space-x-2 mb-2">
              <span className="text-2xl">🍓</span>
              <h3 className="text-xl font-bold text-pink-600">Strawberrydips</h3>
            </div>
            <p className="text-gray-700 text-xs flex items-center justify-center md:justify-end">
              Made with <Heart className="h-3 w-3 text-red-500 mx-1" /> in Kenya
            </p>
            <p className="text-gray-500 text-xs mt-1">&copy; 2024 All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
