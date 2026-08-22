"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartIcon() {
  const { totalCount } = useCart();

  return (
    <Link href="/cart" aria-label="Shopping bag" className="relative text-ink/70 hover:text-ink">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 8h12l-1 12H7L6 8z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {totalCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-thread text-[10px] text-white">
          {totalCount > 9 ? "9+" : totalCount}
        </span>
      )}
    </Link>
  );
}
