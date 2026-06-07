import React from "react";
import clsx from "clsx";

type BadgeVariant =
  | "default"
  | "green"
  | "red"
  | "yellow"
  | "blue"
  | "purple"
  | "teal"
  | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200",
  green:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  red: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  yellow:
    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  purple:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",
  gray: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

const dotStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-400",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  gray: "bg-slate-400",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx("w-1.5 h-1.5 rounded-full flex-shrink-0", dotStyles[variant])}
        />
      )}
      {children}
    </span>
  );
}
