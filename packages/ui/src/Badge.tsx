import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const baseStyle = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500';
  
  const variants = {
    default: 'border-transparent bg-primary-500 text-white',
    secondary: 'border-transparent bg-neutral-100 text-neutral-900',
    success: 'border-transparent bg-success/15 text-success border-success/20',
    warning: 'border-transparent bg-warning/15 text-warning border-warning/20',
    danger: 'border-transparent bg-danger/15 text-danger border-danger/20',
    info: 'border-transparent bg-info/15 text-info border-info/20'
  };

  const classNames = `${baseStyle} ${variants[variant]} ${className}`.trim();

  return <div className={classNames} {...props} />;
}
