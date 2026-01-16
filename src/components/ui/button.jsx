import React from 'react';
import { cn } from '@/lib/utils';

export function Button({ className, variant = 'default', size = 'default', ...props }) {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50',
    ghost: 'hover:bg-slate-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1.5 text-sm',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
