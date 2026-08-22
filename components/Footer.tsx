import Link from "next/link";

const SOCIAL_ICONS = [
  { name: "Instagram", path: "M12 2c2.7 0 3.1 0 4.1.1 1 .1 1.7.2 2.3.5.6.3 1.1.6 1.6 1.1.5.5.8 1 1.1 1.6.3.6.4 1.3.5 2.3.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c-.1 1-.2 1.7-.5 2.3-.3.6-.6 1.1-1.1 1.6-.5.5-1 .8-1.6 1.1-.6.3-1.3.4-2.3.5-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1-.1-1.7-.2-2.3-.5-.6-.3-1.1-.6-1.6-1.1-.5-.5-.8-1-1.1-1.6-.3-.6-.4-1.3-.5-2.3-.1-1-.1-1.4-.1-4.1s0-3.1.1-4.1c.1-1 .2-1.7.5-2.3.3-.6.6-1.1 1.1-1.6.5-.5 1-.8 1.6-1.1.6-.3 1.3-.4 2.3-.5C8.9 2 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" },
  { name: "Facebook", path: "M13.5 21v-7.5H16l.4-3H13.5V8.4c0-.9.2-1.5 1.5-1.5H16.5V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H8v3h2.3V21h3.2z" },
  { name: "Pinterest", path: "M12 2a10 10 0 00-3.6 19.3c0-.8 0-1.7.2-2.5l1.4-6s-.3-.7-.3-1.7c0-1.6 1-2.8 2.1-2.8 1 0 1.5.7 1.5 1.6 0 1-.6 2.5-1 3.9-.2 1 .5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.2-3.8-3.1 0-5 2.3-5 4.8 0 .9.3 1.5.7 2 .2.2.2.3.1.6l-.2.9c-.1.3-.3.4-.6.3-1.4-.6-2-2.1-2-3.9 0-2.9 2.5-6.4 7.3-6.4 3.9 0 6.5 2.8 6.5 5.9 0 4-2.2 7-5.5 7-1.1 0-2.1-.6-2.5-1.2l-.7 2.7c-.2 1-.7 2-1.1 2.7A10 10 0 1012 2z" },
  { name: "X", path: "M18.9 3h3.1l-6.8 7.8L23.3 21h-6.3l-4.9-6.4L6.5 21H3.4l7.3-8.3L2.7 3h6.4l4.4 5.9L18.9 3zm-1.1 16.2h1.7L7.3 4.7H5.5L17.8 19.2z" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper mt-16">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-sm font-semibold mb-4">Shop</h3>
          <ul className="space-y-2 text-sm text-paper/60">
            <li><Link href="/" className="hover:text-paper">Home</Link></li>
            <li><Link href="/" className="hover:text-paper">Men</Link></li>
            <li><Link href="/about" className="hover:text-paper">About us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-paper/60">
            <li><Link href="/about" className="hover:text-paper">About Komerla</Link></li>
            <li className="text-paper/40">How it works</li>
            <li className="text-paper/40">Sustainability</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Help</h3>
          <ul className="space-y-2 text-sm text-paper/60">
          <li><Link href="/orders" className="hover:text-paper">My orders</Link></li>
          <li><Link href="/profile" className="hover:text-paper">My profile</Link></li>
          <li>
    <Link href="/contact" className="hover:text-paper">
  Contact &amp; support
    </Link>
  </li>
  <li className="text-paper/40">Legal &amp; privacy</li>
</ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-4">Join us</h3>
          <p className="text-sm text-paper/60 mb-3">
            Sign up and be first to know about new arrivals.
          </p>
          <Link
            href="/signup"
            className="text-sm underline underline-offset-2 hover:text-paper/80"
          >
            Sign up now
          </Link>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="font-display italic text-4xl sm:text-5xl">Komerla</p>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-paper/40">India (₹)</p>
          <div className="flex items-center gap-4">
            {SOCIAL_ICONS.map((icon) => (
              <span
                key={icon.name}
                aria-label={icon.name}
                title={`${icon.name} (coming soon)`}
                className="text-paper/40"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d={icon.path} />
                </svg>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-paper/40">
          © {year} Komerla. All orders arranged directly, no payment gateway.
        </p>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <h4 className="text-sm font-semibold mb-3">Payments</h4>
          <div className="flex flex-wrap gap-2">
            {["Cash on delivery", "UPI", "GPay", "PhonePe"].map((method) => (
              <span
                key={method}
                className="text-xs border border-paper/20 px-3 py-1.5 text-paper/60"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}