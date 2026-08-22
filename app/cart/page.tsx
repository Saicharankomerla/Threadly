"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            size: i.size,
            quantity: i.quantity,
          })),
          delivery_address: address,
          phone,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong placing your order.");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/orders/${data.order_id}?placed=1`);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center py-16">
        <h1 className="font-display text-2xl mb-3">Your bag is empty</h1>
        <Link href="/" className="text-thread underline">
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="font-display text-2xl mb-6">Your bag</h1>
        <div className="divide-y divide-line">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.size}`} className="flex gap-4 py-4">
              <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded bg-line/40">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                {item.size && <p className="text-sm text-ink/60">Size: {item.size}</p>}
                <p className="text-sm text-ink/60">₹{item.price.toFixed(2)}</p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-line rounded-md">
                    <button
                      type="button"
                      className="px-2 py-1 text-sm"
                      onClick={() =>
                        updateQuantity(item.product_id, item.size, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="px-3 text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="px-2 py-1 text-sm"
                      onClick={() =>
                        updateQuantity(item.product_id, item.size, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product_id, item.size)}
                    className="text-xs uppercase tracking-widest text-ink/50 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-medium">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 h-fit">
        <h2 className="font-medium mb-4">Checkout</h2>
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="label">Delivery address</label>
            <textarea
              required
              className="input"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Phone number</label>
            <input
              type="tel"
              required
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="border-t border-line pt-3 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Placing order…" : "Continue to checkout"}
          </button>
          <p className="text-xs text-ink/50 text-center">
            Payment is cash/UPI on delivery.
          </p>
        </form>
      </div>
    </div>
  );
}
