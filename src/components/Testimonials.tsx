export function Testimonials() {
  return (
    <section className="py-16 px-4 bg-pink-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Loved by Customers</h2>
          <p className="text-gray-600">Fresh, delicious, and made with care</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Amina',
              text: 'Absolutely delicious! The presentation was beautiful and delivery was on time.',
            },
            {
              name: 'Brian',
              text: 'Best chocolate strawberries I have had. Perfect for gifts!',
            },
            {
              name: 'Lucy',
              text: 'Ordered for a birthday — everyone loved them. Highly recommend.',
            },
          ].map((t, i) => (
            <div key={i} className="rounded-xl border border-pink-100 bg-white p-6 shadow-sm">
              <div className="text-pink-600 text-4xl leading-none">“</div>
              <p className="mt-2 text-gray-800">{t.text}</p>
              <div className="mt-4 font-semibold text-gray-900">— {t.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


