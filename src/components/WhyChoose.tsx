'use client';

import { ShieldCheck, CreditCard, Truck, Star } from 'lucide-react';

const items = [
  {
    icon: ShieldCheck,
    title: 'Freshness & Quality',
    body:
      "Hand-crafted chocolate covered strawberries, made fresh with premium ingredients.",
  },
  {
    icon: CreditCard,
    title: 'Safe & Secure Payments',
    body:
      'Pay confidently with M-Pesa and major cards through trusted gateways.',
  },
  {
    icon: Truck,
    title: 'Fast Local Delivery',
    body:
      'Same‑day in Nairobi and next‑day to most areas in Kenya, 7 days a week.',
  },
  {
    icon: Star,
    title: 'Loved by Customers',
    body:
      'Thousands of happy customers. Gifting made beautiful and reliable.',
  },
];

export function WhyChoose() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
          Why Choose Strawberry Dips?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
          {items.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="text-center bg-white rounded-xl border border-pink-100/70 p-6 shadow-sm"
            >
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-pink-50 text-pink-600 mx-auto mb-4">
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


