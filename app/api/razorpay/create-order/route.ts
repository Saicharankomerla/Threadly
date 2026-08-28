import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Razorpay from "razorpay";

type CartItemInput = {
  product_id: string;
  size?: string | null;
  quantity: number;
};

export async function POST(req: NextRequest) {
  const supabase = createClient();

  // Must be logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = await req.json();
  const rawItems: CartItemInput[] = Array.isArray(body.items) ? body.items : [];

  if (rawItems.length === 0) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }

  for (const item of rawItems) {
    const qty = Number(item.quantity);
    if (!item.product_id || !Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: "Invalid item in bag." }, { status: 400 });
    }
  }

  // Recompute the total server-side — never trust a price/total from the browser.
  const productIds = rawItems.map((i) => i.product_id);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock, is_active")
    .in("id", productIds);

  if (productsError || !products) {
    return NextResponse.json({ error: "Could not look up products." }, { status: 500 });
  }

  const productById = new Map(products.map((p) => [p.id, p]));
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
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Payment gateway is not configured." },
      { status: 500 }
    );
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  // Razorpay expects the amount in the smallest currency unit — paise, not rupees.
  const amountInPaise = Math.round(total * 100);

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${user.id.slice(0, 8)}`,
    });

    return NextResponse.json({
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 }
    );
  }
}
