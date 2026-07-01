import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap " +
  "transition-[background,color,box-shadow,transform] duration-150 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background active:scale-[0.985] " +
  "disabled:pointer-events-none disabled:opacity-55 select-none cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)] hover:brightness-[1.06]",
  secondary:
    "bg-surface text-foreground border border-border-strong hover:bg-surface-2 hover:border-faint",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-2",
  danger: "bg-danger text-white shadow-[0_1px_2px_rgb(0_0_0/0.08)] hover:brightness-[1.06]",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(base, variants[variant], sizes[size], className);
