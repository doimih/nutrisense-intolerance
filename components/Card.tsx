import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  bordered?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  className,
  padding = "md",
  hover = false,
  bordered = false,
}: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white dark:bg-slate-800 rounded-xl shadow-sm",
        paddingStyles[padding],
        hover && "transition-shadow duration-200 hover:shadow-md cursor-pointer",
        bordered && "border border-gray-100 dark:border-slate-700",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={clsx("mb-4 pb-4 border-b border-gray-100 dark:border-slate-700", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={clsx(
        "text-lg font-semibold text-slate-900 dark:text-white",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={clsx(
        "text-sm text-slate-500 dark:text-slate-400 mt-1",
        className
      )}
    >
      {children}
    </p>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center gap-2",
        className
      )}
    >
      {children}
    </div>
  );
}
