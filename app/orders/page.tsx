import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { OrderStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function MyOrdersPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total, created_at, order_items(product_name, quantity, size)")
    .eq("customer_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">My orders</h1>

      {(!orders || orders.length === 0) && (
        <p className="text-ink/60">
          No orders yet.{" "}
          <Link href="/" className="text-thread underline">
            Browse the catalog
          </Link>
          .
        </p>
      )}

      <div className="space-y-3">
        {orders?.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="card block p-4 hover:border-thread transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-ink/50">
                  {new Date(order.created_at).toLocaleDateString()} · Order #
                  {order.id.slice(0, 8)}
                </p>
                <p className="mt-1">
                  {order.order_items
                    ?.map((i: any) => `${i.product_name} x${i.quantity}`)
                    .join(", ")}
                </p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status as OrderStatus} />
                <p className="mt-1 text-sm">₹{Number(order.total).toFixed(2)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
