import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { ORDER_STATUSES, OrderStatus, STATUS_LABELS } from "@/lib/status";

// Customer-facing messages for statuses worth emailing about.
const CUSTOMER_MESSAGES: Partial<Record<OrderStatus, { subject: string; headline: string; body: string }>> = {
  confirmed: {
    subject: "Your order has been confirmed",
    headline: "Your order is confirmed!",
    body: "I've confirmed your order and I'm getting it ready for you.",
  },
  purchased: {
    subject: "Your order is on its way",
    headline: "Your order has shipped",
    body: "I've purchased your item and it's on its way to you.",
  },
  out_for_delivery: {
    subject: "Your order is out for delivery",
    headline: "Out for delivery",
    body: "Your order is arriving today.",
  },
  delivered: {
    subject: "Your order has arrived",
    headline: "Delivered!",
    body: "Your order has been delivered. Enjoy!",
  },
};

export async function POST(req: NextRequest) {
  const supabase = createClient();

  // 1. Must be logged in and an admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  // 2. Validate input
  const body = await req.json();
  const { order_id, status } = body;

  if (!order_id || !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid order_id or status." }, { status: 400 });
  }

  // 3. Update the order — RLS also enforces admin-only here as defense in depth
  const { data: order, error: updateError } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", order_id)
    .select("id, status, customer_id")
    .single();

  if (updateError || !order) {
    return NextResponse.json(
      { error: updateError?.message || "Could not update order." },
      { status: 500 }
    );
  }

  // 4. Email the customer for statuses worth telling them about.
  // Never blocks the response — a failed email doesn't undo the status update.
  try {
    const message = CUSTOMER_MESSAGES[status as OrderStatus];
    console.log("[update-status] status received:", status);
    console.log("[update-status] message found for this status:", !!message);

    // The customer's profile row is only readable by the customer themselves
    // under RLS — the admin's regular client can't see it, and that failure
    // is silent (profiles comes back null, not an error). Use the
    // service-role client for this one lookup so it isn't blocked.
    let customerEmail: string | undefined;
    if (message) {
      const serviceClient = createServiceRoleClient();
      const { data: customerProfile, error: profileError } = await serviceClient
        .from("profiles")
        .select("email")
        .eq("id", order.customer_id)
        .single();
      console.log("[update-status] customer_id looked up:", order.customer_id);
      console.log("[update-status] profile fetch error:", profileError);
      console.log("[update-status] profile fetch result:", customerProfile);
      customerEmail = customerProfile?.email;
    }
    console.log("[update-status] RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);
    console.log("[update-status] final customerEmail used:", customerEmail);

    if (message && customerEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?id=${order.id}`;

      await resend.emails.send({
        from: "Komerla Orders <onboarding@resend.dev>",
        to: customerEmail,
        subject: `${message.subject} — Komerla`,
        html: `
          <h2>${message.headline}</h2>
          <p>${message.body}</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p>Check your order status anytime: <a href="${trackUrl}">${trackUrl}</a></p>
        `,
      });
    } else if (message && !customerEmail) {
      console.error(
        `Status update email skipped: no email found for customer ${order.customer_id}`
      );
    }
  } catch (emailError) {
    console.error("Status update email failed to send:", emailError);
  }

  return NextResponse.json({ ok: true });
}
