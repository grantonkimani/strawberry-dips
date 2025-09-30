'use client';

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-800 via-gray-900 to-pink-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Top Section - Brand Description */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
            Find the perfect treats for all your big and small moments
          </h2>
          <p className="text-gray-50 text-lg max-w-4xl mx-auto leading-relaxed">
            Looking for unique and spectacular treats that create a lasting impression? At Strawberrydips, we have hundreds of chocolate-covered strawberry options to celebrate every moment, 
            whether it's for <Link href="/about" className="text-pink-400 hover:text-pink-300 underline">special occasions</Link> or <Link href="/menu" className="text-pink-400 hover:text-pink-300 underline">everyday indulgence</Link>, from <Link href="/menu?category=anniversaries" className="text-pink-400 hover:text-pink-300 underline">anniversaries</Link> to <Link href="/menu?category=graduations" className="text-pink-400 hover:text-pink-300 underline">graduations</Link> and <Link href="/menu?category=weddings" className="text-pink-400 hover:text-pink-300 underline">weddings</Link>. 
            Strawberrydips is also Kenya's leading <span className="text-pink-400 font-semibold">premium chocolate delivery</span> service, known 
            for excellent packaging by our expert chocolatiers—the best in the country. With Strawberrydips, enjoy fast same-day delivery in Nairobi and next-day 
            delivery all over Kenya. Our flexible and safe payment options make it easy to turn those special moments into cherished memories.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Get in Touch */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-pink-300">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-pink-400 flex-shrink-0" />
                     <Link href="tel:0757567614" className="text-gray-50 hover:text-white transition-colors">
                  0757567614
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-pink-400 flex-shrink-0" />
                     <Link href="mailto:Strawberrydips.ke@gmail.com" className="text-gray-50 hover:text-white transition-colors">
                  Strawberrydips.ke@gmail.com
                </Link>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-pink-400 flex-shrink-0 mt-1" />
                   <div className="text-gray-50">
                     <p>Nairobi, Kenya</p>
                     <p className="text-sm">Same-day delivery available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Our Company */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-pink-300">Our Company</h3>
            <ul className="space-y-3">
              <li>
                       <Link href="/about" className="text-gray-50 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                       <Link href="/about#faq" className="text-gray-50 hover:text-white transition-colors">
                  Frequently Asked Questions (FAQs)
                </Link>
              </li>
              <li>
                       <Link href="/about#care" className="text-gray-50 hover:text-white transition-colors">
                  Strawberry Care Guide
                </Link>
              </li>
              <li>
                       <Link href="/about#story" className="text-gray-50 hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                       <Link href="/contact#locations" className="text-gray-50 hover:text-white transition-colors">
                  Delivery Locations
                </Link>
              </li>
              <li>
                       <Link href="/about#reviews" className="text-gray-50 hover:text-white transition-colors">
                  Customer Reviews
                </Link>
              </li>
              <li>
                       <Link href="/about#careers" className="text-gray-50 hover:text-white transition-colors">
                  Careers & Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Info & Policies */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-pink-300">Account Info</h3>
            <ul className="space-y-3">
              <li>
                       <Link href="/account" className="text-gray-50 hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                       <Link href="/account/orders" className="text-gray-50 hover:text-white transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                       <Link href="/policies/returns" className="text-gray-50 hover:text-white transition-colors">
                  Returns Policy
                </Link>
              </li>
              <li>
                       <Link href="/policies/refund" className="text-gray-50 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                       <Link href="/policies/delivery" className="text-gray-50 hover:text-white transition-colors">
                  Delivery Policy
                </Link>
              </li>
              <li>
                       <Link href="/policies/privacy" className="text-gray-50 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                       <Link href="/policies/shipping" className="text-gray-50 hover:text-white transition-colors">
                  Shipping Zones
                </Link>
              </li>
              <li>
                       <Link href="/policies/terms" className="text-gray-50 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Business Hours Section */}
        <div className="mt-12 pt-8 border-t border-pink-800">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 text-pink-400 mr-2" />
                Business Hours
              </h4>
                     <div className="text-gray-50 space-y-1">
                <p><span className="font-medium">Monday - Friday:</span> 8:00 AM - 7:00 PM</p>
                <p><span className="font-medium">Saturday:</span> 9:00 AM - 6:00 PM</p>
                <p><span className="font-medium">Sunday:</span> 10:00 AM - 4:00 PM</p>
                <p className="text-sm text-pink-400 mt-2">Same-day delivery available for orders placed before 2:00 PM</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-end space-x-2 mb-2">
                <img 
                  src="/strawberry-dip-logo.svg" 
                  alt="Strawberrydips Logo" 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'inline';
                    }
                  }}
                />
                <span className="text-2xl" style={{display: 'none'}}>🍓</span>
                <h3 className="text-2xl font-bold text-pink-400">Strawberrydips</h3>
              </div>
              <p className="text-gray-50 text-sm flex items-center justify-center md:justify-end">
                Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> in Kenya
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-pink-800 bg-gradient-to-r from-pink-900 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="text-center text-gray-50">
            <p>&copy; 2024 Strawberrydips Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
