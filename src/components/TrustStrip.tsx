export function TrustStrip() {
  return (
    <section className="bg-white border-y border-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 inline-flex items-center justify-center rounded-full bg-green-100 text-green-700 text-[10px] font-bold">✓</span>
            Secure checkout
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 border border-gray-200">IntaSend</span>
          </div>
        </div>
      </div>
    </section>
  );
}


