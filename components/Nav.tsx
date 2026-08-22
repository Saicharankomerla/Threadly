import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";
import CartIcon from "./CartIcon";

const CATEGORIES = ["Shirts", "Bottom wear", "Shoes", "Watches"];

export default async function Nav() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  const linkClass =
    "text-xs font-medium uppercase tracking-widest text-ink/70 hover:text-ink py-5";

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="font-display text-2xl tracking-tight py-5">
            Threadly
          </Link>

          <nav className="flex items-center gap-8">
            <div className="group relative h-full">
              <Link href="/" className={linkClass}>
                Men
              </Link>
              <div className="absolute left-0 top-full hidden w-72 border border-line bg-paper shadow-lg group-hover:block">
                <div className="flex flex-col py-4">
                  <Link
                    href="/"
                    className="px-5 py-2 text-xs uppercase tracking-widest text-ink/70 hover:text-ink hover:bg-line/30"
                  >
                    New in
                  </Link>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className="px-5 py-2 text-xs uppercase tracking-widest text-ink/70 hover:text-ink hover:bg-line/30"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/" className={linkClass}>
              Home
            </Link>
            {role === "admin" && (
              <Link href="/admin" className={linkClass}>
                Admin
              </Link>
            )}
            <Link href="/about" className={linkClass}>
              About us
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button
            aria-label="Wishlist"
            className="text-ink/70 hover:text-ink"
            title="Wishlist (coming soon)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 21s-7.5-4.7-10-9.3C.3 8.1 2 4.5 5.6 4c2-.3 3.8.7 4.9 2.3.7 1 .7 1 1.4 0C13 4.7 14.8 3.7 16.9 4c3.6.5 5.3 4.1 3.6 7.7C19.5 16.3 12 21 12 21z" />
            </svg>
          </button>

          <CartIcon />

          <Link
            href={user ? "/profile" : "/login"}
            aria-label="Account"
            className="text-ink/70 hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
          </Link>

          {user ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium uppercase tracking-widest border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
