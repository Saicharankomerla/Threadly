import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const supabase = createClient();

  // 1. Must be logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  // 2. Parse + validate input
  const body = await req.json();
  const { product_id, size, quantity, delivery_address, phone, notes } = body;

  if (!product_id || !quantity || !delivery_address || !phone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return NextResponse.json({ error: "Invalid quantity." }, { status: 400 });
  }

  // 3. Look up the product (RLS: public can read active products)
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active")
    .eq("id", product_id)
    .single();

  if (productError || !product || !product.is_active) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (product.stock < qty) {
    return NextResponse.json({ error: "Not enough stock available." }, { status: 400 });
  }

  const total = Number(product.price) * qty;

  // 4. Insert order — RLS requires customer_id = auth.uid(), enforced by the
  // regular (cookie-scoped) client, so this can't be spoofed to another user.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "pending",
      total,
      delivery_address,
      phone,
      notes: notes || null,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message || "Could not create order." },
      { status: 500 }
    );
  }

  // 5. Insert order item, snapshotting product name/price at order time
  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    product_name: product.name,
    unit_price: product.price,
    size: size || null,
    quantity: qty,
  });

  if (itemError) {
    return NextResponse.json({ error: itemError.message }, { status: 500 });
  }

  // 6. Decrement stock. Customers can't write to `products` under RLS, so this
  // trusted, already-validated decrement runs with the service-role client —
  // never exposed to the browser.
  const serviceClient = createServiceRoleClient();
  await serviceClient
    .from("products")
    .update({ stock: product.stock - qty })
    .eq("id", product.id);

  // 7. Notify the admin — this ALWAYS runs server-side so it can't be
  // skipped or spoofed by the client. Failure to email never blocks the order.
  try {
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Threadly Orders <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL,
        subject: `New order — ${product.name} x${qty}`,
        html: `
          <h2>New order placed</h2>
          <p><strong>Product:</strong> ${product.name} ${size ? `(size ${size})` : ""} x${qty}</p>
          <p><strong>Total:</strong> ₹${total.toFixed(2)}</p>
          <p><strong>Customer email:</strong> ${user.email}</p>
          <p><strong>Delivery address:</strong> ${delivery_address}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">Open admin dashboard →</a></p>
        `,
      });
    }
  } catch (emailError) {
    console.error("Order email failed to send:", emailError);
    // Do not fail the request — the order is already placed and will show
    // up on the realtime admin dashboard regardless.
  }

  return NextResponse.json({ order_id: order.id }, { status: 201 });
}
