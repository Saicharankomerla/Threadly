import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { OrderStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { placed?: string };
}) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", params.id)
    .single();

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-xl">
      {searchParams.placed && (
        <div className="mb-6 rounded-md bg-thread/10 border border-thread/30 p-4 text-thread">
          Order placed! I'll confirm it shortly — you'll see updates here.
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Order #{order.id.slice(0, 8)}</h1>
        <StatusBadge status={order.status as OrderStatus} />
      </div>
      <p className="text-sm text-ink/50 mt-1">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="card mt-6 p-4">
        <h2 className="font-medium mb-3">Items</h2>
        <div className="divide-y divide-line">
          {order.order_items.map((item: any) => (
            <div key={item.id} className="py-2 flex justify-between text-sm">
              <span>
                {item.product_name} {item.size ? `(${item.size})` : ""} x
                {item.quantity}
              </span>
              <span>₹{(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-line mt-3 pt-3 flex justify-between font-medium">
          <span>Total</span>
          <span>₹{Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="card mt-4 p-4 text-sm">
        <h2 className="font-medium mb-2">Delivery details</h2>
        <p className="text-ink/70">{order.delivery_address}</p>
        <p className="text-ink/70">{order.phone}</p>
        {order.notes && <p className="text-ink/70 mt-2">Notes: {order.notes}</p>}
      </div>
    </div>
  );
}
