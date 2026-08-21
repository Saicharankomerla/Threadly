"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/StatusBadge";
import { ORDER_STATUSES, OrderStatus, STATUS_LABELS } from "@/lib/status";

type Order = {
  id: string;
  status: OrderStatus;
  total: number;
  delivery_address: string;
  phone: string;
  notes: string | null;
  created_at: string;
  order_items: { id: string; product_name: string; quantity: number; size: string | null }[];
  profiles: { email: string; full_name: string | null } | null;
};

export default function AdminOrdersBoard({ initialOrders }: { initialOrders: Order[] }) {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          const { data } = await supabase
            .from("orders")
            .select("*, order_items(*), profiles(email, full_name)")
            .eq("id", (payload.new as any).id)
            .single();
          if (data) setOrders((prev) => [data as Order, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as any;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
        }
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId);
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    setUpdating(null);
    if (error) {
      alert(`Could not update status: ${error.message}`);
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-ink/60">
        <span
          className={`h-2 w-2 rounded-full ${live ? "bg-green-500" : "bg-amber-500"}`}
        />
        {live ? "Live — new orders appear instantly" : "Connecting…"}
      </div>

      {orders.length === 0 && <p className="text-ink/60">No orders yet.</p>}

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink/50">
                  {new Date(order.created_at).toLocaleString()} · #{order.id.slice(0, 8)}
                </p>
                <p className="font-medium mt-0.5">
                  {order.profiles?.full_name || order.profiles?.email || "Customer"}
                </p>
                <p className="text-sm text-ink/60">{order.profiles?.email}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="mt-1 font-medium">₹{Number(order.total).toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-3 border-t border-line pt-3 text-sm space-y-1">
              {order.order_items.map((item) => (
                <p key={item.id}>
                  {item.product_name} {item.size ? `(${item.size})` : ""} x{item.quantity}
                </p>
              ))}
            </div>

            <div className="mt-3 grid gap-1 text-sm text-ink/70">
              <p>{order.delivery_address}</p>
              <p>{order.phone}</p>
              {order.notes && <p>Notes: {order.notes}</p>}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <label className="text-sm text-ink/60">Status:</label>
              <select
                className="input w-auto"
                value={order.status}
                disabled={updating === order.id}
                onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
