"use client";

import { useEffect, useId, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminOrdersBadge({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const supabase = createClient();
  const instanceId = useId();

  useEffect(() => {
    async function refreshCount() {
      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      setCount(count ?? 0);
    }

    // New orders always start as "pending", and any status change (e.g. an
    // admin confirming one elsewhere) should also update the count — so we
    // just recount from scratch on either kind of change rather than trying
    // to track deltas locally.
    //
    // The channel name includes instanceId because this component can be
    // rendered more than once at a time (e.g. next to "Admin" and again
    // inside its dropdown) — Supabase doesn't allow two separate
    // subscriptions to share one channel name.
    const channel = supabase
      .channel(`admin-orders-badge-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        refreshCount
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        refreshCount
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, instanceId]);

  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} new order${count === 1 ? "" : "s"} awaiting confirmation`}
      className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white"
    >
      {count}
    </span>
  );
}
