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
            <img src="/mpesa.png" alt="MPesa" className="h-5 w-auto" />
            <span>MPesa</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/stripe.svg" alt="Stripe" className="h-5 w-auto" />
            <span>Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/intasend.svg" alt="IntaSend" className="h-5 w-auto" />
            <span>IntaSend</span>
          </div>
        </div>
      </div>
    </section>
  );
}


