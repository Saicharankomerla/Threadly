"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  sizes: string[];
  stock: number;
};

export default function OrderForm({
  product,
  isLoggedIn,
}: {
  product: Product;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const outOfStock = product.stock <= 0;

  if (!isLoggedIn) {
    return (
      <div className="rounded-md bg-line/30 p-4 text-sm">
        <Link href={`/login?redirect=/products/${product.id}`} className="text-thread underline font-medium">
          Log in
        </Link>{" "}
        to place an order for this item.
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          size,
          quantity,
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

      router.push(`/orders/${data.order_id}?placed=1`);
    } catch (err) {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <label className="label">Size</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setSize(s)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  size === s
                    ? "border-thread bg-thread text-white"
                    : "border-line bg-white text-ink hover:border-thread"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="label">Quantity</label>
        <input
          type="number"
          min={1}
          className="input w-24"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
        />
      </div>

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
          placeholder="Color preference, delivery time window, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || outOfStock}
        className="btn-primary w-full"
      >
        {outOfStock ? "Out of stock" : loading ? "Placing order…" : "Place order"}
      </button>
      <p className="text-xs text-ink/50">
        Payment is cash/UPI on delivery, arranged directly with you.
      </p>
    </form>
  );
}
