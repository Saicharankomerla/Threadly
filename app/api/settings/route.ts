import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Publicly readable — the cart page needs this to show the price
// breakdown before checkout even starts.
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ["delivery_charge", "platform_fee_enabled", "platform_fee_amount"]);

  if (error || !data) {
    return NextResponse.json({ error: "Could not load settings." }, { status: 500 });
  }

  const settings = Object.fromEntries(data.map((r) => [r.key, r.value]));

  return NextResponse.json({
    delivery_charge: Number(settings.delivery_charge ?? 0),
    platform_fee_enabled: Boolean(settings.platform_fee_enabled),
    platform_fee_amount: Number(settings.platform_fee_amount ?? 0),
  });
}

// Only admins can change settings. The app_settings table's own RLS policy
// also enforces this at the database level, so this check is a fast-fail —
// it's not the only thing standing between a random user and this table.
export async function POST(req: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const body = await req.json();
  const deliveryCharge = Number(body.delivery_charge);
  const platformFeeEnabled = Boolean(body.platform_fee_enabled);
  const platformFeeAmount = Number(body.platform_fee_amount);

  if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
    return NextResponse.json({ error: "Invalid delivery charge." }, { status: 400 });
  }
  if (!Number.isFinite(platformFeeAmount) || platformFeeAmount < 0) {
    return NextResponse.json({ error: "Invalid platform fee amount." }, { status: 400 });
  }

  const updates = [
    { key: "delivery_charge", value: deliveryCharge },
    { key: "platform_fee_enabled", value: platformFeeEnabled },
    { key: "platform_fee_amount", value: platformFeeAmount },
  ];

  const { error } = await supabase.from("app_settings").upsert(updates);

  if (error) {
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
