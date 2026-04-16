import type { ReactNode } from "react";

interface BadgeProps {
  color?: "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

const badgeStyles: Record<NonNullable<BadgeProps["color"]>, string> = {
  success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
  warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500",
  error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
  info: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-500",
};

const sizeStyles: Record<NonNullable<BadgeProps["size"]>, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
};

export default function Badge({
  color = "info",
  size = "md",
  className = "",
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${badgeStyles[color]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
