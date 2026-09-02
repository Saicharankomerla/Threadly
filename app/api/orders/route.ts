import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import crypto from "crypto";

type CartItemInput = {
  product_id: string;
  size?: string | null;
  quantity: number;
};

export async function POST(req: NextRequest) {
  const supabase = createClient();

  // 1. Must be logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  // 2. Parse + validate input. Supports either a single-item payload
  // (product_id/size/quantity) or a multi-item bag payload (items: [...]).
  const body = await req.json();
  const { delivery_address, phone, notes } = body;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Payment information is missing." },
      { status: 400 }
    );
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payment gateway is not configured." },
      { status: 500 }
    );
  }

  // Verify the payment is genuine and actually came from Razorpay. This
  // signature can only be produced by someone who has the Key Secret, which
  // never leaves the server — so a forged request from the browser will
  // always fail this check.
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 400 }
    );
  }

  const rawItems: CartItemInput[] = Array.isArray(body.items)
    ? body.items
    : body.product_id
    ? [{ product_id: body.product_id, size: body.size, quantity: body.quantity }]
    : [];

  if (rawItems.length === 0 || !delivery_address || !phone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  for (const item of rawItems) {
    const qty = Number(item.quantity);
    if (!item.product_id || !Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: "Invalid item in bag." }, { status: 400 });
    }
  }

  // 3. Look up every product in one query (RLS: public can read active products)
  const productIds = rawItems.map((i) => i.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active")
    .in("id", productIds);

  if (productsError || !products) {
    return NextResponse.json({ error: "Could not look up products." }, { status: 500 });
  }

  const productById = new Map(products.map((p) => [p.id, p]));

  // Validate stock + active status for every line, and build order_items rows
  const orderItemsToInsert: {
    product_id: string;
    product_name: string;
    unit_price: number;
    size: string | null;
    quantity: number;
  }[] = [];
  const stockUpdates: { id: string; newStock: number }[] = [];
  let total = 0;

  for (const item of rawItems) {
    const product = productById.get(item.product_id);
    const qty = Number(item.quantity);

    if (!product || !product.is_active) {
      return NextResponse.json(
        { error: `Product not found: ${item.product_id}` },
        { status: 404 }
      );
    }
    if (product.stock < qty) {
      return NextResponse.json(
        { error: `Not enough stock for ${product.name}.` },
        { status: 400 }
      );
    }

    total += Number(product.price) * qty;
    orderItemsToInsert.push({
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      size: item.size || null,
      quantity: qty,
    });
    stockUpdates.push({ id: product.id, newStock: product.stock - qty });
  }

  // 4. Insert the order — RLS requires customer_id = auth.uid(), enforced by the
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
      payment_status: "paid",
      razorpay_order_id,
      razorpay_payment_id,
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message || "Could not create order." },
      { status: 500 }
    );
  }

  // 5. Insert every order item, snapshotting product name/price at order time
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsToInsert.map((i) => ({ ...i, order_id: order.id })));

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // 6. Decrement stock for every product. Customers can't write to `products`
  // under RLS, so this trusted, already-validated update runs with the
  // service-role client — never exposed to the browser.
  const serviceClient = createServiceRoleClient();
  await Promise.all(
    stockUpdates.map((s) =>
      serviceClient.from("products").update({ stock: s.newStock }).eq("id", s.id)
    )
  );

  // 7. Notify the admin — this ALWAYS runs server-side so it can't be
  // skipped or spoofed by the client. Failure to email never blocks the order.
  try {
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const itemsHtml = orderItemsToInsert
        .map(
          (i) =>
            `<li>${i.product_name} ${i.size ? `(size ${i.size})` : ""} x${i.quantity} — ₹${(
              Number(i.unit_price) * i.quantity
            ).toFixed(2)}</li>`
        )
        .join("");

      await resend.emails.send({
        from: "Komerla Orders <orders@komerla.com>",
        to: process.env.ADMIN_EMAIL,
        subject: `New order — ${orderItemsToInsert.length} item(s), ₹${total.toFixed(2)}`,
        html: `
          <h2>New order placed — payment received</h2>
          <ul>${itemsHtml}</ul>
          <p><strong>Total:</strong> ₹${total.toFixed(2)} (paid online via Razorpay)</p>
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
