import { Badge, Dot } from "@/components/ui/card";

export type DealStatus = "paid" | "open" | "overdue" | "refunded" | "cancelled";

const MAP: Record<DealStatus, { label: string; tone: "success" | "neutral" | "danger" | "muted"; dot: "success" | "muted" | "danger" }> = {
  paid: { label: "Bezahlt", tone: "success", dot: "success" },
  open: { label: "Offen", tone: "neutral", dot: "muted" },
  overdue: { label: "Überfällig", tone: "danger", dot: "danger" },
  refunded: { label: "Erstattet", tone: "muted", dot: "muted" },
  cancelled: { label: "Storniert", tone: "muted", dot: "muted" },
};

export function StatusBadge({ status }: { status: DealStatus }) {
  const s = MAP[status] ?? MAP.open;
  return (
    <Badge tone={s.tone}>
      <Dot tone={s.dot} /> {s.label}
    </Badge>
  );
}
