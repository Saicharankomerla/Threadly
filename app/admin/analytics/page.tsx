import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Stats = {
  signups_today: number;
  signups_this_month: number;
  active_today: number;
  active_this_month: number;
  total_users: number;
  orders_today: number;
  orders_this_month: number;
  total_orders: number;
  revenue_today: number;
  revenue_this_month: number;
  total_revenue: number;
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-medium">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink/50">{sub}</p>}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const { data: stats, error } = await supabase.rpc("admin_dashboard_stats");

  if (error || !stats) {
    return (
      <div>
        <h1 className="font-display text-2xl mb-4">Admin · Analytics</h1>
        <p className="text-red-600 text-sm">
          Could not load stats: {error?.message || "Unknown error."}
        </p>
        <p className="text-ink/60 text-sm mt-2">
          Make sure the admin_dashboard_stats database function has been created in Supabase.
        </p>
      </div>
    );
  }

  const s = stats as Stats;
  const money = (n: number) => `₹${Number(n).toFixed(2)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-2xl">Admin · Analytics</h1>
        <div className="flex gap-2">
          <Link href="/admin" className="border border-ink px-4 py-2 text-xs uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
            Orders
          </Link>
          <Link href="/admin/products" className="border border-ink px-4 py-2 text-xs uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
            Manage products
          </Link>
        </div>
      </div>
      <p className="text-sm text-ink/50 mb-8">
        All figures refresh on page load. Revenue excludes cancelled orders.
      </p>

      <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-3">Today</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="New signups" value={String(s.signups_today)} />
        <StatCard label="Active users" value={String(s.active_today)} sub="logged in today" />
        <StatCard label="Orders" value={String(s.orders_today)} />
        <StatCard label="Revenue" value={money(s.revenue_today)} />
      </div>

      <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-3">This month</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="New signups" value={String(s.signups_this_month)} />
        <StatCard label="Active users" value={String(s.active_this_month)} sub="logged in this month" />
        <StatCard label="Orders" value={String(s.orders_this_month)} />
        <StatCard label="Revenue" value={money(s.revenue_this_month)} />
      </div>

      <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-3">All time</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total users" value={String(s.total_users)} />
        <StatCard label="Total orders" value={String(s.total_orders)} sub="excluding cancelled" />
        <StatCard label="Total revenue" value={money(s.total_revenue)} sub="excluding cancelled" />
      </div>
    </div>
  );
}
