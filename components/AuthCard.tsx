import React from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-green-600 dark:text-green-400 text-sm font-medium mt-1">
              {subtitle}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 leading-relaxed">
              {description}
            </p>
          </div>

          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
