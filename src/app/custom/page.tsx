import CustomRequestForm from '@/components/CustomRequestForm'
export default function CustomPage() {
  const waNumber = '254115292686';
  const message = encodeURIComponent(
    "Hi Strawberry Dips! I'd like a custom order. Event date: ____. Design details: ____. Budget: ____."
  );
  const waLink = `https://wa.me/${waNumber}?text=${message}`;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Request a Custom Piece</h1>
      <p className="mt-3 text-gray-600">
        Tell us what you have in mind and we’ll get back with a quote and timing.
      </p>

      <div className="mt-8 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-6">
        <h2 className="text-xl font-semibold text-pink-700">
          Prefer WhatsApp?
        </h2>
        <p className="mt-2 text-gray-700">
          Tap below to start a chat with us on WhatsApp with a pre-filled message.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-green-500 px-6 py-3 text-white font-semibold shadow hover:bg-green-600 transition-colors"
        >
          Chat on WhatsApp
        </a>
        <p className="mt-3 text-xs text-gray-600">
          Number: +254 115 292 686
        </p>
      </div>

      <div className="mt-10 text-gray-700">
        <p className="mb-4">Or use our form below for a detailed request.</p>
        <CustomRequestForm />
      </div>
    </main>
  );
}

// Client component is imported directly; allowed in Server Components


