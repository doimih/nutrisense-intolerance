"use client";

import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm hover:shadow focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700",
  secondary:
    "bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm focus:ring-teal-500",
  outline:
    "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-gray-400",
  ghost:
    "bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-gray-300",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm focus:ring-red-500",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-base gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}
