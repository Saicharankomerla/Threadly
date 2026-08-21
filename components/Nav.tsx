import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

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

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Threadly
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-widest text-ink/70 hover:text-ink"
          >
            Catalog
          </Link>
          {user && (
            <Link
              href="/orders"
              className="text-xs font-medium uppercase tracking-widest text-ink/70 hover:text-ink"
            >
              My orders
            </Link>
          )}
          {role === "admin" && (
            <Link
              href="/admin"
              className="text-xs font-medium uppercase tracking-widest text-ink/70 hover:text-ink"
            >
              Admin
            </Link>
          )}
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
        </nav>
      </div>
    </header>
  );
}
