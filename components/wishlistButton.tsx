"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WishlistButton({
  productId,
  initialInWishlist = false,
  className = "",
}: {
  productId: string;
  initialInWishlist?: boolean;
  className?: string;
}) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); // in case this button sits inside a product <Link>
    e.stopPropagation();

    setLoading(true);
    const next = !inWishlist;
    setInWishlist(next); // optimistic update

    try {
      const res = await fetch("/api/wishlist", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });

      if (!res.ok) {
        setInWishlist(!next); // revert on failure
        if (res.status === 401) {
          router.push("/login");
        }
      } else {
        router.refresh(); // keeps the header's wishlist count in sync
      }
    } catch {
      setInWishlist(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={inWishlist}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      className={`text-ink/70 hover:text-ink disabled:opacity-50 transition-colors ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={inWishlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 21s-7.5-4.7-10-9.3C.3 8.1 2 4.5 5.6 4c2-.3 3.8.7 4.9 2.3.7 1 .7 1 1.4 0C13 4.7 14.8 3.7 16.9 4c3.6.5 5.3 4.1 3.6 7.7C19.5 16.3 12 21 12 21z" />
      </svg>
    </button>
  );
}
