import { OrderStatus } from "@/lib/status";

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Order placed" },
  { key: "confirmed", label: "Order confirmed" },
  { key: "purchased", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="border border-red-200 bg-red-50 text-red-700 rounded-md p-4 text-sm">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <ol className="space-y-0">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                  done
                    ? "bg-ink border-ink text-paper"
                    : "border-line text-ink/30"
                }`}
              >
                {done ? "✓" : ""}
              </span>
              {!isLast && (
                <span
                  className={`w-px flex-1 ${done ? "bg-ink" : "bg-line"}`}
                  style={{ minHeight: "28px" }}
                />
              )}
            </div>
            <p
              className={`pb-7 text-sm ${
                done ? "text-ink font-medium" : "text-ink/40"
              }`}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
