import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// Public endpoint — intentionally does NOT require login, since the emailed
// tracking link needs to work on any device. Uses the service-role client to
// bypass RLS, but only ever returns safe, non-sensitive fields: no delivery
// address, phone, or total. Anyone with a valid order ID (a UUID, effectively
// unguessable) can check that order's status — same exposure as a normal
// courier tracking page.
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json({ error: "Missing order id." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: order.id,
    status: order.status,
    created_at: order.created_at,
  });
}
