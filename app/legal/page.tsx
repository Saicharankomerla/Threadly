export default function LegalPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-8">Legal &amp; Privacy</h1>

      <div className="space-y-8 text-ink/80 leading-relaxed">
        <section>
          <h2 className="font-display text-xl mb-3">Who we are</h2>
          <p>
            Komerla is a one-person clothing order-fulfillment business. All
            orders are sourced, confirmed, and delivered personally by the
            founder — there is no separate warehouse or fulfillment company
            involved.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">Information we collect</h2>
          <p>
            To place and deliver an order, we collect your name, email
            address, phone number, and delivery address. If you create an
            account, we also store your login credentials securely through
            our authentication provider, Supabase. We do not store your card
            or payment details — payments are processed directly by
            Razorpay, our payment gateway, and Komerla never sees or stores
            your full card number, UPI PIN, or bank credentials.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">How we use your information</h2>
          <p>
            Your information is used only to process your order, contact you
            about its status, and — if you opt in — let you know about new
            arrivals. We do not sell or share your personal information with
            third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">Payments</h2>
          <p>
            All payments are processed securely through Razorpay. Komerla
            does not have access to your full payment details at any point
            in the transaction.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">Returns &amp; delivery</h2>
          <p>
            Orders are delivered by hand. If there's an issue with your
            order, reach out through our{" "}
            <a href="/contact" className="underline">
              contact page
            </a>{" "}
            and we'll work it out directly — every message is read and
            answered personally.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">Contact</h2>
          <p>
            Questions about this policy or your data? Reach out through our{" "}
            <a href="/contact" className="underline">
              contact page
            </a>{" "}
            anytime.
          </p>
        </section>

        <p className="text-xs text-ink/40 pt-4">
          This policy may be updated as Komerla grows. Last updated{" "}
          {new Date().getFullYear()}.
        </p>
      </div>
    </div>
  );
}
