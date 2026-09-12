import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminOrdersBoard from "./AdminOrdersBoard";
import AdminSettingsBar from "@/components/AdminSettingsBar";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(image_url)), profiles(email, full_name)")
    .order("created_at", { ascending: false });

  const { data: settingsRows } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["delivery_charge", "platform_fee_enabled", "platform_fee_amount"]);

  const settingsMap = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value]));
  const settings = {
    delivery_charge: Number(settingsMap.delivery_charge ?? 0),
    platform_fee_enabled: Boolean(settingsMap.platform_fee_enabled),
    platform_fee_amount: Number(settingsMap.platform_fee_amount ?? 0),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Admin · Orders</h1>
        <Link href="/admin/products" className="btn-secondary">
          Manage products
        </Link>
      </div>
      <AdminSettingsBar initialSettings={settings} />
      <AdminOrdersBoard initialOrders={orders ?? []} />
    </div>
  );
}
