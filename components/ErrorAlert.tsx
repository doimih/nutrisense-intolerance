"use client";

import React from "react";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

type AlertType = "error" | "success" | "info" | "warning";

interface ErrorAlertProps {
  type?: AlertType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const typeConfig: Record<
  AlertType,
  { icon: React.ComponentType<{ className?: string }>; styles: string; iconStyle: string }
> = {
  error: {
    icon: AlertCircle,
    styles:
      "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
    iconStyle: "text-red-500",
  },
  success: {
    icon: CheckCircle2,
    styles:
      "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
    iconStyle: "text-green-500",
  },
  info: {
    icon: Info,
    styles:
      "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
    iconStyle: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    styles:
      "bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
    iconStyle: "text-yellow-500",
  },
};

export default function ErrorAlert({
  type = "error",
  title,
  message,
  onDismiss,
  className,
}: ErrorAlertProps) {
  const { lang } = useLanguage();
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        "flex items-start gap-3 px-4 py-3 rounded-lg text-sm",
        config.styles,
        className
      )}
      role="alert"
    >
      <Icon className={clsx("w-4 h-4 mt-0.5 flex-shrink-0", config.iconStyle)} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label={lang === "ro" ? "Inchide" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
