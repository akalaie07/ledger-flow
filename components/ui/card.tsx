import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger" | "warning" | "muted";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-surface-2 text-muted-foreground border border-border",
    muted: "bg-transparent text-faint border border-border",
    success: "bg-success-soft text-success border border-success/20",
    danger: "bg-danger-soft text-danger border border-danger/20",
    warning: "bg-warning-soft text-warning border border-warning/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "success" }: { tone?: "success" | "danger" | "warning" | "muted" }) {
  const tones: Record<string, string> = {
    success: "bg-success",
    danger: "bg-danger",
    warning: "bg-warning",
    muted: "bg-faint",
  };
  return <span className={cn("size-1.5 rounded-full", tones[tone])} />;
}
