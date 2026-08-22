"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
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
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock <= 0;

  if (!isLoggedIn) {
    return (
      <div className="rounded-md bg-line/30 p-4 text-sm">
        <Link href={`/login?redirect=/products/${product.id}`} className="text-thread underline font-medium">
          Log in
        </Link>{" "}
        to add this item to your bag.
      </div>
    );
  }

  function handleAddToBag() {
    addItem({
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      size: size || null,
      quantity,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-4">
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
          max={product.stock}
          className="input w-24"
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))
          }
        />
      </div>

      <button
        type="button"
        onClick={handleAddToBag}
        disabled={outOfStock}
        className="btn-primary w-full"
      >
        {outOfStock ? "Out of stock" : added ? "Added to bag ✓" : "Add to bag"}
      </button>

      {added && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="text-xs uppercase tracking-widest text-thread underline w-full text-center block"
        >
          View bag →
        </button>
      )}

      <p className="text-xs text-ink/50">
        Payment is cash/UPI on delivery, arranged directly with you.
      </p>
    </div>
  );
}
