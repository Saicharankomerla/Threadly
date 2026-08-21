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
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-xl tracking-tight">
          Threadly
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/" className="text-sm text-ink/70 hover:text-ink">
            Catalog
          </Link>
          {user && (
            <Link href="/orders" className="text-sm text-ink/70 hover:text-ink">
              My orders
            </Link>
          )}
          {role === "admin" && (
            <Link href="/admin" className="text-sm text-ink/70 hover:text-ink">
              Admin
            </Link>
          )}
          {user ? (
            <SignOutButton />
          ) : (
            <Link href="/login" className="btn-primary">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
