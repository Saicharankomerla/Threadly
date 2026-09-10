"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type TrackResult = {
  id: string;
  status: string;
  created_at: string;
};

// Order status flow, in sequence. "cancelled" is handled separately below —
// it doesn't fit on this line since it can happen from almost any step.
const STEPS = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Order confirmed" },
  { key: "purchased", label: "Your order is shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

function TrackContent() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id") ?? "";

  const [orderId, setOrderId] = useState(idFromUrl);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(id: string) {
    const trimmed = id.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/track?id=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong looking up that order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-lookup when arriving via the emailed link (?id=...).
  useEffect(() => {
    if (idFromUrl) {
      lookup(idFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromUrl]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    lookup(orderId);
  }

  const currentStepIndex = result
    ? STEPS.findIndex((s) => s.key === result.status)
    : -1;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-2xl mb-1">Track your order</h1>
      <p className="text-ink/60 mb-6">
        Enter your order ID to see its current status.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          className="input flex-1"
          placeholder="Paste your order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? "Checking…" : "Track"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-6">{error}</p>}

      {result && result.status === "cancelled" && (
        <div className="card p-4">
          <p className="font-medium">This order was cancelled.</p>
          <p className="text-sm text-ink/60 mt-1">
            Order ID: {result.id}
          </p>
        </div>
      )}

      {result && result.status !== "cancelled" && currentStepIndex >= 0 && (
        <div className="card p-4">
          <p className="text-sm text-ink/60 mb-4">Order ID: {result.id}</p>
          <ol className="space-y-4">
            {STEPS.map((step, i) => {
              const completed = i <= currentStepIndex;
              return (
                <li key={step.key} className="flex items-center gap-3">
                  <span
                    className={
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border " +
                      (completed
                        ? "bg-ink text-white border-ink"
                        : "border-line text-ink/30")
                    }
                  >
                    {completed ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="text-xs">{i + 1}</span>
                    )}
                  </span>
                  <span className={completed ? "text-ink" : "text-ink/40"}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
  );
}
