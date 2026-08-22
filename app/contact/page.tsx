export default function ContactPage() {
  const email = process.env.ADMIN_EMAIL || "hello@komerla.com";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Contact &amp; Support</h1>

      <div className="space-y-8 text-ink/80 leading-relaxed">
        <p>
          Have a question about an order, a product, or anything else?
          Reach out directly — every message goes straight to me, no
          support tickets or call centers.
        </p>

        <div className="card p-5">
          <h2 className="text-xs font-medium uppercase tracking-widest text-ink/50 mb-2">
            Email
          </h2>
          <a href={`mailto:${email}`} className="text-lg text-thread underline">
            {email}
          </a>
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-medium uppercase tracking-widest text-ink/50 mb-2">
            Address
          </h2>
          <p>Komerla Fashion House</p>
          <p>Andhra pradesh,Kadapa,proddatur </p>
        </div>

        <div className="card p-5">
          <h2 className="text-xs font-medium uppercase tracking-widest text-ink/50 mb-2">
            Response time
          </h2>
          <p>
            You will get a reply within a day. From my team order-specific questions,
            include your order number so I can look it up quickly.
          </p>
        </div>
      </div>
    </div>
  );
}