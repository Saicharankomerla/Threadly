import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import { OrderStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, total, delivery_address, phone, notes, created_at, customer_id, order_items(id, product_name, unit_price, quantity, size)"
    )
    .eq("id", params.id)
    .single();

  // Not found, or belongs to someone else — RLS already blocks the second
  // case at the database level, but checking explicitly gives a clean 404
  // instead of an empty/confusing page.
  if (!order || order.customer_id !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/orders" className="text-sm text-ink/60 hover:text-ink">
        ← Back to my orders
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-ink/50 mt-1">
            Placed on {new Date(order.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
        <StatusBadge status={order.status as OrderStatus} />
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-4">
            Order progress
          </h2>
          <OrderStatusTimeline status={order.status as OrderStatus} />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-2">
              Items
            </h2>
            <div className="space-y-1 text-sm">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name}
                    {item.size ? ` (${item.size})` : ""} x{item.quantity}
                  </span>
                  <span className="text-ink/60">
                    ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-line flex justify-between font-medium">
              <span>Total</span>
              <span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-wide text-ink/50 mb-2">
              Delivery details
            </h2>
            <p className="text-sm text-ink/70">{order.delivery_address}</p>
            <p className="text-sm text-ink/70">{order.phone}</p>
            {order.notes && (
              <p className="text-sm text-ink/70 mt-1">Notes: {order.notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
