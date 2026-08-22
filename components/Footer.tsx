export default function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-ink/50 mb-3">
            Komerla
          </h3>
          <p className="text-sm text-ink/70 leading-relaxed">
            A one-person clothing shop. I buy what you order and deliver it
            myself — no middlemen, no marketplace markup.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-ink/50 mb-3">
            How it works
          </h3>
          <ul className="text-sm text-ink/70 space-y-2">
            <li>Browse the catalog, place an order</li>
            <li>I'll confirm and buy the item</li>
            <li>Delivered to your door</li>
            <li>Pay cash or UPI on delivery</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-ink/50 mb-3">
            Payment on delivery
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Cash", "UPI", "GPay", "PhonePe"].map((method) => (
              <span
                key={method}
                className="text-xs border border-line px-3 py-1.5 text-ink/70"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-ink/40">
          © {new Date().getFullYear()} Komerla. All orders arranged directly, no payment gateway.
        </p>
      </div>
    </footer>
  );
}