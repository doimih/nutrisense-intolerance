"use client";

import React, { useId } from "react";
import clsx from "clsx";

interface FormFieldProps {
  label: string;
  inputId?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  inputId,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = inputId || generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const normalizedChildren = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: (children.props as { id?: string }).id || fieldId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {normalizedChildren}
      {error && (
        <p
          id={errorId}
          className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <span>⚠</span>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "w-full px-3 py-2.5 text-sm rounded-lg border transition-colors duration-150",
        "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100",
        "placeholder:text-slate-400 dark:placeholder:text-slate-500",
        "focus:outline-none focus:ring-2 focus:ring-offset-0",
        error
          ? "border-red-400 focus:ring-red-300 dark:border-red-500"
          : "border-gray-300 dark:border-slate-600 focus:ring-green-400 dark:focus:ring-green-500 focus:border-green-400",
        className
      )}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        "w-full px-3 py-2.5 text-sm rounded-lg border transition-colors duration-150 resize-none",
        "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100",
        "placeholder:text-slate-400 dark:placeholder:text-slate-500",
        "focus:outline-none focus:ring-2 focus:ring-offset-0",
        error
          ? "border-red-400 focus:ring-red-300"
          : "border-gray-300 dark:border-slate-600 focus:ring-green-400 focus:border-green-400",
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export function Select({ error, options, className, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        "w-full px-3 py-2.5 text-sm rounded-lg border transition-colors duration-150",
        "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100",
        "focus:outline-none focus:ring-2 focus:ring-offset-0",
        error
          ? "border-red-400 focus:ring-red-300"
          : "border-gray-300 dark:border-slate-600 focus:ring-green-400 focus:border-green-400",
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        className={clsx(
          "mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600",
          "focus:ring-green-400 focus:ring-offset-0 focus:ring-2",
          "dark:border-slate-600 dark:bg-slate-900",
          className
        )}
        {...props}
      />
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}
