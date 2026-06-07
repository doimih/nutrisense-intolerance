import React from 'react';

type BadgeVariant = 'green' | 'red' | 'amber' | 'blue' | 'muted' | 'orange';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant, children, className = '' }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    green: 'badge-green',
    red: 'badge-red',
    amber: 'badge-amber',
    blue: 'badge-blue',
    muted: 'badge-muted',
    orange: 'badge bg-orange-50 text-orange-600',
  };

  return <span className={`${variantClasses[variant]} ${className}`}>{children}</span>;
}
