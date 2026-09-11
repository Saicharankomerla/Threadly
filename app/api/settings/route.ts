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
