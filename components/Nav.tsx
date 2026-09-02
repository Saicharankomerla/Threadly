import { createClient } from "@/lib/supabase/server";
import NavClient from "./NavClient";

export default async function Nav() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;
  let wishlistCount = 0;
  let pendingOrdersCount = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;

    const { count } = await supabase
      .from("wishlist_items")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id);
    wishlistCount = count ?? 0;

    if (role === "admin") {
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      pendingOrdersCount = pendingCount ?? 0;
    }
  }

  return (
    <NavClient
      isLoggedIn={!!user}
      isAdmin={role === "admin"}
      wishlistCount={wishlistCount}
      pendingOrdersCount={pendingOrdersCount}
    />
  );
}
