import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AdminOrdersBoard from "./AdminOrdersBoard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*), profiles(email, full_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl">Admin · Orders</h1>
        <Link href="/admin/products" className="btn-secondary">
          Manage products
        </Link>
      </div>
      <AdminOrdersBoard initialOrders={orders ?? []} />
    </div>
  );
}
