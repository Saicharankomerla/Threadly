import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/wishlist — list the logged-in customer's saved products
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("id, product_id, created_at, products(id, name, price, image_url, is_active)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data });
}

// POST /api/wishlist  { product_id } — add a product to the wishlist
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { product_id } = await req.json();
  if (!product_id) {
    return NextResponse.json({ error: "Missing product_id." }, { status: 400 });
  }

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ customer_id: user.id, product_id });

  // 23505 = unique constraint violation — it's already saved, which is fine
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE /api/wishlist  { product_id } — remove a product from the wishlist
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { product_id } = await req.json();
  if (!product_id) {
    return NextResponse.json({ error: "Missing product_id." }, { status: 400 });
  }

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("customer_id", user.id)
    .eq("product_id", product_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
