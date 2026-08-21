import { OrderStatus, STATUS_LABELS, STATUS_STYLES } from "@/lib/status";

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status-pill ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
