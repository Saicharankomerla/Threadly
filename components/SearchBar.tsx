"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        aria-label="Search"
        title="Search"
        onClick={() => setOpen((v) => !v)}
        className="text-ink/70 hover:text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </button>

      {open && (
        <>
          {/* Invisible backdrop so clicking outside the box closes it */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <form
            onSubmit={handleSubmit}
            className="absolute right-0 top-full mt-3 z-20 flex w-72 items-center border border-line bg-paper shadow-lg"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="px-3 text-ink/60 hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </form>
        </>
      )}
    </div>
  );
}
