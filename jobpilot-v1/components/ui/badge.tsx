import { clsx } from "clsx";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-slate-800 text-slate-200 border-slate-700",
  success: "bg-emerald-950 text-emerald-300 border-emerald-800",
  warning: "bg-amber-950 text-amber-300 border-amber-800",
  danger: "bg-rose-950 text-rose-300 border-rose-800",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
